import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  name: string;
  passwordHash: string;
  settings: {
    theme: string;
    domainPreset: string;
  };
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true, select: false },
  settings: {
    theme: { type: String, default: 'system' },
    domainPreset: { type: String, default: 'general' },
  },
}, { timestamps: true });

UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model<IUser>('User', UserSchema);
