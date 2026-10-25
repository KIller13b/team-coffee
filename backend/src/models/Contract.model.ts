import mongoose, { Schema, Document } from 'mongoose';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ContractStatus = 'active' | 'under_review' | 'expiring_soon' | 'terminated' | 'disputed' | 'critical';
export type AnalysisStatus = 'completed' | 'processing' | 'pending_arbitration' | 'flagged';
export type ResponsibleParty = 'internal' | 'counterparty' | 'shared';

export function normalizeContractId(cid: string): string {
  if (!cid) return '';
  let clean = cid.trim();
  if (clean.toLowerCase().endsWith('.txt') || clean.toLowerCase().endsWith('.pdf')) {
    clean = clean.slice(0, clean.lastIndexOf('.'));
  }
  if (clean.toLowerCase().startsWith('cnt-')) {
    clean = clean.slice(4);
  }
  return clean.toUpperCase();
}

export function toPrefixedContractId(cid: string): string {
  const norm = normalizeContractId(cid);
  return norm ? `cnt-${norm}` : '';
}

export interface IContractClause {
  id: string;
  contractId: string;
  field: string;
  extractedValue: string;
  clauseCitation: string;
  confidenceScore: number;
  verbatimText: string;
  extractedBy: 'thor' | 'odin';
  category: string;
  interpretationNote?: string;
  section?: string;
  title?: string;
  text?: string;
  type?: string;
  isFlagged?: boolean;
  isAmbiguous?: boolean;
  ambiguityReason?: string;
  ambiguityStatus?: string;
}

export interface IObligation {
  id: string;
  contractId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'upcoming' | 'due' | 'overdue' | 'completed';
  severity: RiskLevel;
  financialExposureINR: number;
  responsibleParty: ResponsibleParty;
  clauseReference: string;
}

export interface IContract extends Document {
  id: string;
  title: string;
  counterparty: string;
  contractType: string;
  status: ContractStatus;
  analysisStatus: AnalysisStatus;
  riskLevel: RiskLevel;
  startDate: string;
  endDate: string;
  renewalDate: string;
  durationMonths: number;
  jurisdiction: string;
  totalValueINR: number;
  financialExposureINR: number;
  autoRenewalConditions: string;
  paymentSchedule: string;
  confidenceScore: number;
  summary: string;
  tags: string[];
  relatedContractIds?: string[];
  clauses: IContractClause[];
  obligations: IObligation[];
  value?: string;
  effectiveDate?: string;
  expiryDate?: string;
  autoRenew?: boolean;
  renewalNoticeDays?: number;
  governingLaw?: string;
  clausesCount?: number;
  criticalObligationsCount?: number;
  verifiedCitationsCount?: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const ContractClauseSchema = new Schema<IContractClause>(
  {
    id: { type: String, required: true },
    contractId: { type: String, default: '' },
    field: { type: String, default: '' },
    extractedValue: { type: String, default: '' },
    clauseCitation: { type: String, default: '' },
    confidenceScore: { type: Number, default: 0.95 },
    verbatimText: { type: String, default: '' },
    extractedBy: { type: String, enum: ['thor', 'odin'], default: 'thor' },
    category: { type: String, default: 'general' },
    interpretationNote: { type: String },
    section: { type: String },
    title: { type: String },
    text: { type: String },
    type: { type: String },
    isFlagged: { type: Boolean, default: false },
    isAmbiguous: { type: Boolean, default: false },
    ambiguityReason: { type: String },
    ambiguityStatus: { type: String },
  },
  { _id: false }
);

export const ObligationSchema = new Schema<IObligation>(
  {
    id: { type: String, required: true },
    contractId: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    dueDate: { type: String, default: '' },
    status: { type: String, enum: ['upcoming', 'due', 'overdue', 'completed'], default: 'upcoming' },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    financialExposureINR: { type: Number, default: 0.0 },
    responsibleParty: { type: String, enum: ['internal', 'counterparty', 'shared'], default: 'counterparty' },
    clauseReference: { type: String, default: '' },
  },
  { _id: false }
);

export const ContractSchema = new Schema<IContract>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    counterparty: { type: String, default: 'Unknown' },
    contractType: { type: String, default: 'Cloud Service Agreement' },
    status: { type: String, enum: ['active', 'under_review', 'expiring_soon', 'terminated', 'disputed', 'critical'], default: 'active' },
    analysisStatus: { type: String, enum: ['completed', 'processing', 'pending_arbitration', 'flagged'], default: 'completed' },
    riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    startDate: { type: String, default: '2026-08-01' },
    endDate: { type: String, default: '2027-07-31' },
    renewalDate: { type: String, default: '2027-06-01' },
    durationMonths: { type: Number, default: 12 },
    jurisdiction: { type: String, default: 'State of Delaware' },
    totalValueINR: { type: Number, default: 0.0 },
    financialExposureINR: { type: Number, default: 0.0 },
    autoRenewalConditions: { type: String, default: '' },
    paymentSchedule: { type: String, default: '' },
    confidenceScore: { type: Number, default: 0.95 },
    summary: { type: String, default: '' },
    tags: { type: [String], default: [] },
    relatedContractIds: { type: [String], default: [] },
    clauses: { type: [ContractClauseSchema], default: [] },
    obligations: { type: [ObligationSchema], default: [] },
    value: { type: String },
    effectiveDate: { type: String },
    expiryDate: { type: String },
    autoRenew: { type: Boolean },
    renewalNoticeDays: { type: Number },
    governingLaw: { type: String },
    clausesCount: { type: Number },
    criticalObligationsCount: { type: Number },
    verifiedCitationsCount: { type: Number },
    description: { type: String },
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

export const ContractModel = mongoose.model<IContract>('Contract', ContractSchema);
