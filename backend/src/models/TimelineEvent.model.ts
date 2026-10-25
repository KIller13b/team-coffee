import mongoose, { Schema, Document } from 'mongoose';
import { RiskLevel } from './Contract.model';

export interface ITimelineEvent extends Document {
  id: string;
  contractId: string;
  contractName: string;
  counterparty: string;
  title: string;
  date: string;
  type: string;
  severity: RiskLevel;
  status: string;
  description: string;
  clauseCitation: string;
  penaltyAmountINR?: number;
  noticePeriodDays?: number;
  isWorstCaseProjection?: boolean;
}

export const TimelineEventSchema = new Schema<ITimelineEvent>(
  {
    id: { type: String, required: true, unique: true, index: true },
    contractId: { type: String, required: true, index: true },
    contractName: { type: String, required: true },
    counterparty: { type: String, required: true },
    title: { type: String, required: true },
    date: { type: String, required: true, index: true },
    type: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    status: { type: String, required: true },
    description: { type: String, required: true },
    clauseCitation: { type: String, required: true },
    penaltyAmountINR: { type: Number },
    noticePeriodDays: { type: Number },
    isWorstCaseProjection: { type: Boolean },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

export const TimelineEventModel = mongoose.model<ITimelineEvent>('TimelineEvent', TimelineEventSchema);
