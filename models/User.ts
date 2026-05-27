import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  username: string
  password: string
  isAdmin: boolean
  createdAt: Date
  likedSongs: mongoose.Types.ObjectId[]
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  likedSongs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
})

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
