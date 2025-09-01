export interface IClip {
  id: string;
  submitterId: string;
  submitterName: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  status: ClipStatus;
  reviewerId?: string | null;
  reviewerName?: string | null;
  reviewNotes?: string;
  tags: string[];
  duration?: number | null;
  fileSize?: number | null;
  submittedAt: Date;
  reviewedAt?: Date | null;
}

export type ClipStatus = 'pending' | 'approved' | 'rejected' | 'under_review';

export const ClipStatusEmoji: Record<ClipStatus, string> = {
  pending: '⏳',
  approved: '✅',
  rejected: '❌',
  under_review: '🔄',
};

export const ClipStatusColor: Record<ClipStatus, number> = {
  approved: 0x00ff00,
  rejected: 0xff0000,
  under_review: 0xffff00,
  pending: 0x0099ff,
};

export interface ClipQuery {
  status?: ClipStatus;
  submitterId?: string;
  $or?: Array<{
    title?: { $regex: string; $options: string };
    description?: { $regex: string; $options: string };
  }>;
  tags?: { $in: RegExp[] };
}
