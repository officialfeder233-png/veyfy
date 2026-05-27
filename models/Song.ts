import mongoose, { Schema, Document } from 'mongoose'

export interface ISong extends Document {
  title: string
  artist: string
  album?: string
  duration?: number
  coverUrl?: string
  audioUrl: string       // catbox.moe link
  youtubeId?: string     // original YouTube video ID
  downloadedAt: Date
  playCount: number
  genre?: string
}

const SongSchema = new Schema<ISong>({
  title:       { type: String, required: true, trim: true },
  artist:      { type: String, required: true, trim: true },
  album:       { type: String, trim: true },
  duration:    { type: Number },
  coverUrl:    { type: String },
  audioUrl:    { type: String, required: true },
  youtubeId:   { type: String },
  downloadedAt:{ type: Date, default: Date.now },
  playCount:   { type: Number, default: 0 },
  genre:       { type: String },
})

// Index for fast search
SongSchema.index({ title: 'text', artist: 'text', album: 'text' })
SongSchema.index({ artist: 1 })

export default mongoose.models.Song || mongoose.model<ISong>('Song', SongSchema)
