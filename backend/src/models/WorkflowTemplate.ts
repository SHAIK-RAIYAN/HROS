import mongoose, { Document, Schema, Types } from "mongoose";

export interface IWorkflowTemplateChecklistItem {
  itemId: string;
  label: string;
  required: boolean;
}

export interface IWorkflowTemplateStage {
  stageCode: string;
  name: string;
  sequence: number;
  executionMode: "SEQUENTIAL" | "PARALLEL";
  roleId: Types.ObjectId;
  checklist: IWorkflowTemplateChecklistItem[];
  requiresRemarks: boolean;
  allowRejection: boolean;
  dueHours: number;
  reminderAfterHours: number;
}

export interface IWorkflowTemplate extends Document {
  name: string;
  code: string;
  entityType: "OFFBOARDING";
  version: number;
  isActive: boolean;
  stages: IWorkflowTemplateStage[];
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowTemplateChecklistItemSchema = new Schema<IWorkflowTemplateChecklistItem>(
  {
    itemId: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    required: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const WorkflowTemplateStageSchema = new Schema<IWorkflowTemplateStage>(
  {
    stageCode: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    sequence: {
      type: Number,
      required: true,
    },
    executionMode: {
      type: String,
      enum: ["SEQUENTIAL", "PARALLEL"],
      default: "SEQUENTIAL",
      required: true,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    checklist: [WorkflowTemplateChecklistItemSchema],
    requiresRemarks: {
      type: Boolean,
      default: false,
    },
    allowRejection: {
      type: Boolean,
      default: true,
    },
    dueHours: {
      type: Number,
      default: 24,
    },
    reminderAfterHours: {
      type: Number,
      default: 24,
    },
  },
  { _id: false }
);

const WorkflowTemplateSchema = new Schema<IWorkflowTemplate>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    entityType: {
      type: String,
      enum: ["OFFBOARDING"],
      required: true,
    },
    version: {
      type: Number,
      default: 1,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    stages: [WorkflowTemplateStageSchema],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const WorkflowTemplate = mongoose.model<IWorkflowTemplate>(
  "WorkflowTemplate",
  WorkflowTemplateSchema
);
export default WorkflowTemplate;
