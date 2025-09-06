import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertAudioTrackSchema } from "@shared/schema";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Please upload MP3, WAV, or OGG files.'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

function getAudioDuration(filePath: string): Promise<number | null> {
  return new Promise((resolve) => {
    // Since we can't use external libraries, return null for now
    // In a real implementation, you'd use a library like node-ffmpeg
    resolve(null);
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all tracks
  app.get("/api/tracks", async (req, res) => {
    try {
      const tracks = await storage.getAllTracks();
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tracks" });
    }
  });

  // Upload audio file
  app.post("/api/tracks/upload", upload.single('audio'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const duration = await getAudioDuration(req.file.path);

      const trackData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        duration,
        mimeType: req.file.mimetype,
        filePath: req.file.path,
      };

      const validatedData = insertAudioTrackSchema.parse(trackData);
      const track = await storage.createTrack(validatedData);

      res.json(track);
    } catch (error) {
      if (req.file) {
        fs.unlinkSync(req.file.path); // Clean up file if processing failed
      }
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to upload file" });
      }
    }
  });

  // Stream audio file
  app.get("/api/tracks/:id/stream", async (req, res) => {
    try {
      const track = await storage.getTrack(req.params.id);
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }

      if (!fs.existsSync(track.filePath)) {
        return res.status(404).json({ message: "Audio file not found" });
      }

      const stat = fs.statSync(track.filePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(track.filePath, { start, end });

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': track.mimeType,
        });

        file.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': track.mimeType,
        });
        fs.createReadStream(track.filePath).pipe(res);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to stream audio" });
    }
  });

  // Delete track
  app.delete("/api/tracks/:id", async (req, res) => {
    try {
      const track = await storage.getTrack(req.params.id);
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }

      // Delete file from filesystem
      if (fs.existsSync(track.filePath)) {
        fs.unlinkSync(track.filePath);
      }

      const deleted = await storage.deleteTrack(req.params.id);
      if (deleted) {
        res.json({ message: "Track deleted successfully" });
      } else {
        res.status(404).json({ message: "Track not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete track" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
