import mongoose, { Schema, type Document } from 'mongoose';

export interface IBandMember {
  musicianId: string;
  musicianName: string;
  musicianAvatar: string;
  role: string; // e.g., "Voce principale", "Chitarra Solista", "Basso", "Batteria"
  joinedAt: string;
}

export interface IBandSocialLinks {
  instagram?: string;
  spotify?: string;
  youtube?: string;
  website?: string;
}

export interface IBand extends Document {
  _id: string;
  id: string;
  name: string;
  bio: string;
  city: string;
  avatar: string;
  genres: string[];
  leaderId: string; // musicianId of creator / admin
  members: IBandMember[];
  lookingFor: string[]; // open roles they are recruiting, e.g. ["Tastierista", "Seconda Voce"]
  socialLinks?: IBandSocialLinks;
  createdAt: string;
}

const BandSchema = new Schema<IBand>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    bio: { type: String, default: '' },
    city: { type: String, required: true, trim: true },
    avatar: { 
      type: String, 
      default: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80' 
    },
    genres: [{ type: String }],
    leaderId: { type: String, required: true, ref: 'Musician' },
    members: [
      {
        musicianId: { type: String, required: true },
        musicianName: { type: String, required: true },
        musicianAvatar: { type: String, default: '' },
        role: { type: String, required: true },
        joinedAt: { type: String, required: true }
      }
    ],
    lookingFor: [{ type: String }],
    socialLinks: {
      instagram: { type: String, default: '' },
      spotify: { type: String, default: '' },
      youtube: { type: String, default: '' },
      website: { type: String, default: '' }
    },
    createdAt: { type: String, required: true }
  },
  {
    _id: false,
    timestamps: false,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Virtual for id
BandSchema.virtual('id').get(function () {
  return this._id;
});

export const Band = (mongoose.models.Band as mongoose.Model<IBand>) || mongoose.model<IBand>('Band', BandSchema);
