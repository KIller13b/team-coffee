import mongoose, { Schema, Document } from 'mongoose';

export interface IRecommendedAction {
  id: string;
  priority: string;
  title: string;
  description: string;
  contractId: string;
  contractName: string;
  deadline: string;
  actionOwner: string;
  financialImpactINR: number;
  arbitrationVerdictRef: string;
  status: string;
}

export interface IContractReport extends Document {
  id: string;
  title: string;
  generatedAt: string;
  scope: string;
  totalContractsEvaluated: number;
  totalExposureINR: number;
  criticalRisksCount: number;
  highRisksCount: number;
  worstCasePenaltiesINR: number;
  evidenceSummary: string;
  verifiedByAgents: string[];
  recommendedActions: IRecommendedAction[];
  contractId?: string;
}

export const RecommendedActionSchema = new Schema<IRecommendedAction>(
  {
    id: { type: String, required: true },
    priority: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    contractId: { type: String, required: true },
    contractName: { type: String, required: true },
    deadline: { type: String, required: true },
    actionOwner: { type: String, required: true },
    financialImpactINR: { type: Number, default: 0.0 },
    arbitrationVerdictRef: { type: String, default: '' },
    status: { type: String, default: 'pending' },
  },
  { _id: false }
);

export const ContractReportSchema = new Schema<IContractReport>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    generatedAt: { type: String, required: true },
    scope: { type: String, required: true },
    totalContractsEvaluated: { type: Number, default: 0 },
    totalExposureINR: { type: Number, default: 0.0 },
    criticalRisksCount: { type: Number, default: 0 },
    highRisksCount: { type: Number, default: 0 },
    worstCasePenaltiesINR: { type: Number, default: 0.0 },
    evidenceSummary: { type: String, default: '' },
    verifiedByAgents: { type: [String], default: [] },
    recommendedActions: { type: [RecommendedActionSchema], default: [] },
    contractId: { type: String, index: true },
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

export const ContractReportModel = mongoose.model<IContractReport>('ContractReport', ContractReportSchema);
