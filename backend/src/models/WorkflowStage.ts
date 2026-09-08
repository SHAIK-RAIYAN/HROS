import mongoose, { Document, Schema, Types } from "mongoose";

export interface IWorkflowStageChecklistItem {
  itemId: string;
  label: string;
  required: boolean;
  completed: boolean;
  completedAt?: Date;
}

export interface IAccessRevocationItem {
  system: "EMAIL" | "VPN" | "APPLICATION" | "AD" | "OTHER";
  accessIdentifier?: string;
  action: "DISABLE" | "DELETE" | "REVOKE";
  status: "PENDING" | "COMPLETED" | "FAILED";
  executionMode: "MANUAL" | "AUTOMATED";
  performedBy?: Types.ObjectId;
  performedAt?: Date;
  remarks?: string;
}

export type StageStatus =
  | "PENDING"
  | "ACTIVE"
  | "APPROVED"
  | "REJECTED"
  | "SKIPPED";

export interface IWorkflowStage extends Document {
  offboardingCaseId: Types.ObjectId;
  stageCode: string;
  stageName: string;
  sequence: number;
  executionMode: "SEQUENTIAL" | "PARALLEL";
  roleId: Types.ObjectId;
  assignedUserId?: Types.ObjectId | null;
  status: StageStatus;
  checklist: IWorkflowStageChecklistItem[];
  remarks: string;
  activatedAt?: Date;
  completedAt?: Date;
  dueAt?: Date;
  lastReminderAt?: Date;
  reminderCount: number;
  completedBy?: Types.ObjectId;
  accessRevocation: IAccessRevocationItem[];
  createdAt: Date;
  updatedAt: Date;
}

const ChecklistItemSchema = new Schema<IWorkflowStageChecklistItem>(
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
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
  },
  { _id: false }
);

const AccessRevocationSchema = new Schema<IAccessRevocationItem>(
  {
    system: {
      type: String,
      enum: ["EMAIL", "VPN", "APPLICATION", "AD", "OTHER"],
      required: true,
    },
    accessIdentifier: {
      type: String,
    },
    action: {
      type: String,
      enum: ["DISABLE", "DELETE", "REVOKE"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    executionMode: {
      type: String,
      enum: ["MANUAL", "AUTOMATED"],
      default: "MANUAL",
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    performedAt: Date,
    remarks: String,
  },
  { _id: false }
);

const WorkflowStageSchema = new Schema<IWorkflowStage>(
  {
    offboardingCaseId: {
      type: Schema.Types.ObjectId,
      ref: "OffboardingCase",
      required: true,
      index: true,
    },
    stageCode: {
      type: String,
      required: true,
    },
    stageName: {
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
      required: true,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
      index: true,
    },
    assignedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "APPROVED", "REJECTED", "SKIPPED"],
      default: "PENDING",
      index: true,
    },
    checklist: [ChecklistItemSchema],
    remarks: {
      type: String,
      default: "",
    },
    activatedAt: Date,
    completedAt: Date,
    dueAt: Date,
    lastReminderAt: Date,
    reminderCount: {
      type: Number,
      default: 0,
    },
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    accessRevocation: [AccessRevocationSchema],
  },
  {
    timestamps: true,
  }
);

WorkflowStageSchema.index({
  offboardingCaseId: 1,
  sequence: 1,
});

WorkflowStageSchema.index({
  assignedUserId: 1,
  status: 1,
});

WorkflowStageSchema.index({
  roleId: 1,
  status: 1,
});

export const WorkflowStage = mongoose.model<IWorkflowStage>(
  "WorkflowStage",
  WorkflowStageSchema
);
export default WorkflowStage;
