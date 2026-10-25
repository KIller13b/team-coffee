import mongoose, { Schema, Document } from 'mongoose';

export interface IAgentInfo {
  id: string;
  name: string;
  title: string;
  role: string;
  avatar: string;
  color: string;
  status: string;
  currentTask: string;
  latestActivity: string;
  completedTasksCount: number;
  totalProcessedCount: number;
  responsibilities: string[];
  inputSummary: string;
  outputSummary: string;
  evidenceReferences: string[];
  lastActiveTimestamp?: string;
  activeTasks?: string[];
  model?: string;
}

export interface IAgentMessage extends Document {
  id: string;
  agentId: string;
  agentName: string;
  stage: string;
  timestamp: string;
  title: string;
  message: string;
  contractId?: string;
  contractName?: string;
  clauseReference?: string;
  verbatimEvidence?: string;
  disagreementLevel?: string;
  requiresHumanReview?: boolean;
  tags?: string[];
}

export interface IWorkflowStep extends Document {
  id: string;
  stepNumber: number;
  agentId: string;
  title: string;
  description: string;
  status: string;
  timestamp: string;
}

export const AgentMessageSchema = new Schema<IAgentMessage>(
  {
    id: { type: String, required: true, unique: true, index: true },
    agentId: { type: String, required: true },
    agentName: { type: String, required: true },
    stage: { type: String, required: true },
    timestamp: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    contractId: { type: String, index: true },
    contractName: { type: String },
    clauseReference: { type: String },
    verbatimEvidence: { type: String },
    disagreementLevel: { type: String },
    requiresHumanReview: { type: Boolean },
    tags: { type: [String], default: [] },
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

export const WorkflowStepSchema = new Schema<IWorkflowStep>(
  {
    id: { type: String, required: true, unique: true },
    stepNumber: { type: Number, required: true },
    agentId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, required: true },
    timestamp: { type: String, required: true },
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

export const AgentMessageModel = mongoose.model<IAgentMessage>('AgentMessage', AgentMessageSchema);
export const WorkflowStepModel = mongoose.model<IWorkflowStep>('WorkflowStep', WorkflowStepSchema);
