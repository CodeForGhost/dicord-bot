import mongoose, { Schema, Document } from 'mongoose';
import { IClip, ClipStatus } from '../types/index.js';

export interface ClipDocument extends Omit<IClip, 'id'>, Document {
  id: string;
}

const clipSchema = new Schema<ClipDocument>({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  submitterId: {
    type: String,
    required: true,
  },
  submitterName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  videoUrl: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'under_review'] as ClipStatus[],
    default: 'pending',
  },
  reviewerId: {
    type: String,
    default: null,
  },
  reviewerName: {
    type: String,
    default: null,
  },
  reviewNotes: {
    type: String,
    default: '',
  },
  tags: [
    {
      type: String,
    },
  ],
  duration: {
    type: Number,
    default: null,
  },
  fileSize: {
    type: Number,
    default: null,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: {
    type: Date,
    default: null,
  },
});

clipSchema.index({ submitterId: 1 });
clipSchema.index({ status: 1 });
clipSchema.index({ submittedAt: -1 });

export default mongoose.model<ClipDocument>('Clip', clipSchema);
