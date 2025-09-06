import { type AudioTrack, type InsertAudioTrack } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getTrack(id: string): Promise<AudioTrack | undefined>;
  getAllTracks(): Promise<AudioTrack[]>;
  createTrack(track: InsertAudioTrack): Promise<AudioTrack>;
  deleteTrack(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private tracks: Map<string, AudioTrack>;

  constructor() {
    this.tracks = new Map();
  }

  async getTrack(id: string): Promise<AudioTrack | undefined> {
    return this.tracks.get(id);
  }

  async getAllTracks(): Promise<AudioTrack[]> {
    return Array.from(this.tracks.values());
  }

  async createTrack(insertTrack: InsertAudioTrack): Promise<AudioTrack> {
    const id = randomUUID();
    const track: AudioTrack = { 
      id,
      filename: insertTrack.filename,
      originalName: insertTrack.originalName,
      fileSize: insertTrack.fileSize,
      duration: insertTrack.duration || null,
      mimeType: insertTrack.mimeType,
      filePath: insertTrack.filePath
    };
    this.tracks.set(id, track);
    return track;
  }

  async deleteTrack(id: string): Promise<boolean> {
    return this.tracks.delete(id);
  }
}

export const storage = new MemStorage();
