import mongoose, { Schema, type Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    salt: { type: String, required: true },
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

UserSchema.virtual('id').get(function () {
  return this._id;
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
