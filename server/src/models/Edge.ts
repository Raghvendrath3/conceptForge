import mongoose, { Schema, Document } from 'mongoose';

export interface IEdge extends Document {
  from: mongoose.Types.ObjectId;
  to: mongoose.Types.ObjectId;
  label: 'prerequisite' | 'related' | 'part-of';
  ownerId: mongoose.Types.ObjectId;
}

const EdgeSchema: Schema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: 'Node', required: true, index: true },
  to: { type: Schema.Types.ObjectId, ref: 'Node', required: true, index: true },
  label: { 
    type: String, 
    enum: ['prerequisite', 'related', 'part-of'], 
    default: 'related' 
  },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: true });

// Prevent duplicate edges between same nodes
EdgeSchema.index({ from: 1, to: 1 }, { unique: true });

export default mongoose.model<IEdge>('Edge', EdgeSchema);
