import mongoose, { Schema, Document } from 'mongoose';

export interface INode extends Document {
  title: string;
  bodyMarkdown: string;
  type: 'concept' | 'note' | 'snippet' | 'project' | 'subject' | 'chapter';
  tags: string[];
  ownerId: mongoose.Types.ObjectId;
  collaborators: mongoose.Types.ObjectId[];
  version: number;
}

const NodeSchema: Schema = new Schema({
  title: { type: String, required: true, index: 'text' },
  bodyMarkdown: { type: String, default: '' },
  type: { 
    type: String, 
    enum: ['concept', 'note', 'snippet', 'project', 'subject', 'chapter'], 
    default: 'concept' 
  },
  tags: { type: [String], index: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  version: { type: Number, default: 1 },
}, { timestamps: true });

export default mongoose.model<INode>('Node', NodeSchema);
