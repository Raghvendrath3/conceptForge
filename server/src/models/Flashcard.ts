import mongoose, { Schema, Document } from 'mongoose';

export interface IFlashcard extends Document {
  nodeId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  ease: number;
  interval: number;
  dueAt: Date;
}

const FlashcardSchema: Schema = new Schema({
  nodeId: { type: Schema.Types.ObjectId, ref: 'Node', required: true, index: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  ease: { type: Number, default: 2.5 },
  interval: { type: Number, default: 0 },
  dueAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

export default mongoose.model<IFlashcard>('Flashcard', FlashcardSchema);
