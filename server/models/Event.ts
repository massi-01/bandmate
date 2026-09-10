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
