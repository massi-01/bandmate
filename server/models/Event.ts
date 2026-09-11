import mongoose, { Schema, type Document } from 'mongoose';

export interface IAssignedMusician {
  musicianId: string;
  musicianName: string;
  musicianAvatar: string;
  joinedAt: string;
}

export interface IInstrumentSlot {
  id: string;
  instrument: string;
  maxCount: number;
  assignedMusicians: IAssignedMusician[];
}

export interface IEventAppliedBand {
  id: string;
  bandId: string;
  bandName: string;
  bandAvatar: string;
  city: string;
  genres: string[];
  leaderId: string;
  membersCount: number;
  message?: string;
  appliedAt: string;
}

export interface IEventSong {
  id: string;
  title: string;
  artist: string;
  bpm?: number | string;
  key?: string;
  tutorialUrl?: string;
  notes?: string;
}

export interface IEventComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorInstrument?: string;
  content: string;
  createdAt: string;
}

export interface IEvent extends Document {
  _id: string;
  id: string;
  organizerId: string;
  title: string;
  description: string;
  type: string;
  date: string;
  time: string;
  locationName: string;
  address?: string;
  city: string;
  genres: string[];
  slots: IInstrumentSlot[];
  appliedBands: IEventAppliedBand[];
  setlist: IEventSong[];
  comments: IEventComment[];
  equipmentNotes?: string;
  createdAt: string;
}

const EventSchema = new Schema<IEvent>(
  {
    _id: { type: String, required: true },
    organizerId: { type: String, required: true, ref: 'Musician' },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, required: true, default: 'Jam Session' },
    date: { type: String, required: true },
    time: { type: String, required: true },
    locationName: { type: String, required: true, trim: true },
    address: { type: String, default: '' },
    city: { type: String, required: true, trim: true },
    genres: [{ type: String }],
    slots: [
      {
        id: { type: String, required: true },
        instrument: { type: String, required: true },
        maxCount: { type: Number, required: true, default: 1 },
        assignedMusicians: [
          {
            musicianId: { type: String, required: true },
            musicianName: { type: String, required: true },
            musicianAvatar: { type: String, default: '' },
            joinedAt: { type: String, required: true }
          }
        ]
      }
    ],
    appliedBands: [
      {
        id: { type: String, required: true },
        bandId: { type: String, required: true },
        bandName: { type: String, required: true },
        bandAvatar: { type: String, default: '' },
        city: { type: String, default: '' },
        genres: [{ type: String }],
        leaderId: { type: String, required: true },
        membersCount: { type: Number, default: 1 },
        message: { type: String, default: '' },
        appliedAt: { type: String, required: true }
      }
    ],
    setlist: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true, trim: true },
        artist: { type: String, required: true, trim: true },
        bpm: { type: Schema.Types.Mixed, default: '' },
        key: { type: String, default: '' },
        tutorialUrl: { type: String, default: '' },
        notes: { type: String, default: '' }
      }
    ],
    comments: [
      {
        id: { type: String, required: true },
        authorId: { type: String, required: true },
        authorName: { type: String, required: true },
        authorAvatar: { type: String, default: '' },
        authorInstrument: { type: String, default: 'Musicista' },
        content: { type: String, required: true },
        createdAt: { type: String, required: true }
      }
    ],
    equipmentNotes: { type: String, default: '' },
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

EventSchema.virtual('id').get(function () {
  return this._id;
});

export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
