import mongoose, { Schema, Document } from 'mongoose';
import { RiskLevel } from './Contract.model';

export interface ICrossContractConflict {
  conflictingContractId: string;
  conflictingContractName: string;
  conflictingClauseCitation: string;
  conflictSummary: string;
}

export interface IRisk extends Document {
  id: string;
  title: string;
  contractId: string;
  contractName: string;
  counterparty: string;
  severity: RiskLevel;
  likelihood: 'unlikely' | 'possible' | 'likely' | 'imminent';
  impact: 'low' | 'moderate' | 'severe' | 'catastrophic';
  financialExposureINR: number;
  status: 'open' | 'investigating' | 'arbitrated' | 'mitigated' | 'accepted';
  evidenceClause: string;
  verbatimExcerpt: string;
  explanation: string;
  recommendedNextStep: string;
  identifiedBy: string;
  createdAt: string;
  disputedBy?: string;
  arbitratedBy?: 'tyr';
  arbitrationVerdict?: string;
  crossContractConflict?: ICrossContractConflict;
  category?: string;
  summary?: string;
  financialExposure?: string;
  actionRequired?: string;
  verifiedBy?: string;
  citation?: string;
}

export const CrossContractConflictSchema = new Schema<ICrossContractConflict>(
  {
    conflictingContractId: { type: String, required: true },
    conflictingContractName: { type: String, required: true },
    conflictingClauseCitation: { type: String, required: true },
    conflictSummary: { type: String, required: true },
  },
  { _id: false }
);

export const RiskSchema = new Schema<IRisk>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    contractId: { type: String, default: '', index: true },
    contractName: { type: String, default: '' },
    counterparty: { type: String, default: 'Unknown' },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium', index: true },
    likelihood: { type: String, enum: ['unlikely', 'possible', 'likely', 'imminent'], default: 'likely' },
    impact: { type: String, enum: ['low', 'moderate', 'severe', 'catastrophic'], default: 'severe' },
    financialExposureINR: { type: Number, default: 0.0 },
    status: { type: String, enum: ['open', 'investigating', 'arbitrated', 'mitigated', 'accepted'], default: 'open', index: true },
    evidenceClause: { type: String, default: '' },
    verbatimExcerpt: { type: String, default: '' },
    explanation: { type: String, default: '' },
    recommendedNextStep: { type: String, default: '' },
    identifiedBy: { type: String, default: 'loki' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    disputedBy: { type: String },
    arbitratedBy: { type: String, enum: ['tyr'] },
    arbitrationVerdict: { type: String },
    crossContractConflict: { type: CrossContractConflictSchema },
    category: { type: String },
    summary: { type: String },
    financialExposure: { type: String },
    actionRequired: { type: String },
    verifiedBy: { type: String },
    citation: { type: String },
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

export const RiskModel = mongoose.model<IRisk>('Risk', RiskSchema);
