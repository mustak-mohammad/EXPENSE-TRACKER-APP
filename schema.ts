import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const audioTracks = pgTable("audio_tracks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  duration: integer("duration"), // in seconds
  mimeType: text("mime_type").notNull(),
  filePath: text("file_path").notNull(),
});

export const insertAudioTrackSchema = createInsertSchema(audioTracks).omit({
  id: true,
});

export type InsertAudioTrack = z.infer<typeof insertAudioTrackSchema>;
export type AudioTrack = typeof audioTracks.$inferSelect;
