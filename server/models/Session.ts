import mongoose, { Schema, type Document } from 'mongoose';

export interface ISession extends Document {
  token: string;
  userId: string;
  createdAt: string;
}

const SessionSchema = new Schema<ISession>(
  {
    token: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, ref: 'User', index: true },
    createdAt: { type: String, required: true, default: () => new Date().toISOString() }
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const Session = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
