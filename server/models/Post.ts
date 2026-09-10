import mongoose, { Schema, type Document } from 'mongoose';

export interface IPostComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorInstrument: string;
  content: string;
  createdAt: string;
}

export interface IPost extends Document {
  _id: string;
  id: string;
  authorId: string;
  category: string;
  title: string;
  content: string;
  city: string;
  targetInstruments: string[];
  genres: string[];
  likes: string[];
  comments: IPostComment[];
  createdAt: string;
}

const PostSchema = new Schema<IPost>(
  {
    _id: { type: String, required: true },
    authorId: { type: String, required: true, ref: 'Musician' },
    category: { type: String, required: true, default: 'cercasi-musicista' },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    city: { type: String, required: true, trim: true },
    targetInstruments: [{ type: String }],
    genres: [{ type: String }],
    likes: [{ type: String }],
    comments: [
      {
        id: { type: String, required: true },
        authorId: { type: String, required: true },
        authorName: { type: String, required: true },
        authorAvatar: { type: String, default: '' },
        authorInstrument: { type: String, default: 'Musicista' },
        content: { type: String, required: true },
        createdAt: { type: String, required: true, default: () => new Date().toISOString() }
      }
    ],
    createdAt: { type: String, required: true, default: () => new Date().toISOString() }
  },
  {
    _id: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

PostSchema.virtual('id').get(function () {
  return this._id;
});

export const Post = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
