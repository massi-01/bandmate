import mongoose, { Schema, type Document } from 'mongoose';

export interface IMusicianInstrument {
  name: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzato' | 'Professionista';
  isPrimary?: boolean;
}

export interface IMusicianSocialLinks {
  instagram?: string;
  spotify?: string;
  youtube?: string;
  soundcloud?: string;
}

export interface IMusician extends Document {
  _id: string;
  id: string;
  userId: string;
  name: string;
  username: string;
  age: number;
  gender: string;
  city: string;
  region?: string;
  avatar?: string;
  bio?: string;
  availability: string;
  experienceYears: number;
  phoneOrContact?: string;
  instruments: IMusicianInstrument[];
  genres: string[];
  socialLinks?: IMusicianSocialLinks;
  createdAt: string;
}

const MusicianSchema = new Schema<IMusician>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, unique: true, ref: 'User' },
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    city: { type: String, required: true, trim: true },
    region: { type: String, default: '' },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    availability: { type: String, required: true, default: 'Disponibile per Jam' },
    experienceYears: { type: Number, required: true, default: 1 },
    phoneOrContact: { type: String, default: '' },
    instruments: [
      {
        name: { type: String, required: true },
        level: { type: String, required: true },
        isPrimary: { type: Boolean, default: false }
      }
    ],
    genres: [{ type: String }],
    socialLinks: {
      instagram: { type: String, default: '' },
      spotify: { type: String, default: '' },
      youtube: { type: String, default: '' },
      soundcloud: { type: String, default: '' }
    },
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

MusicianSchema.virtual('id').get(function () {
  return this._id;
});

export const Musician = mongoose.models.Musician || mongoose.model<IMusician>('Musician', MusicianSchema);
