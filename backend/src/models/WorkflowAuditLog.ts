import mongoose, { Document, Schema, Types } from "mongoose";

export type AuditAction =
  | "OFFBOARDING_CREATED"
  | "STAGE_ACTIVATED"
  | "CHECKLIST_UPDATED"
  | "APPROVED"
  | "REJECTED"
  | "REMINDER_SENT"
  | "NOTIFICATION_SENT"
  | "NOTIFICATION_FAILED"
  | "DOCUMENT_GENERATED"
  | "ACCESS_REVOKED"
  | "WORKFLOW_COMPLETED"
  | "WORKFLOW_CANCELLED";

export interface IAuditPerformedBy {
  userId?: Types.ObjectId | null;
  roleId?: Types.ObjectId | null;
  name?: string;
}

export interface IWorkflowAuditLog extends Document {
  offboardingCaseId: Types.ObjectId;
  stageId?: Types.ObjectId | null;
  action: AuditAction;
  performedBy: IAuditPerformedBy;
  remarks: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

const PerformedBySchema = new Schema<IAuditPerformedBy>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      default: null,
    },
    name: {
      type: String,
    },
  },
  { _id: false }
);

const WorkflowAuditLogSchema = new Schema<IWorkflowAuditLog>(
  {
    offboardingCaseId: {
      type: Schema.Types.ObjectId,
      ref: "OffboardingCase",
      required: true,
      index: true,
    },
    stageId: {
      type: Schema.Types.ObjectId,
      ref: "WorkflowStage",
      default: null,
    },
    action: {
      type: String,
      enum: [
        "OFFBOARDING_CREATED",
        "STAGE_ACTIVATED",
        "CHECKLIST_UPDATED",
        "APPROVED",
        "REJECTED",
        "REMINDER_SENT",
        "NOTIFICATION_SENT",
        "NOTIFICATION_FAILED",
        "DOCUMENT_GENERATED",
        "ACCESS_REVOKED",
        "WORKFLOW_COMPLETED",
        "WORKFLOW_CANCELLED",
      ],
      required: true,
      index: true,
    },
    performedBy: {
      type: PerformedBySchema,
      default: () => ({}),
    },
    remarks: {
      type: String,
      default: "",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  }
);

WorkflowAuditLogSchema.index({
  offboardingCaseId: 1,
  timestamp: -1,
});

export const WorkflowAuditLog = mongoose.model<IWorkflowAuditLog>(
  "WorkflowAuditLog",
  WorkflowAuditLogSchema
);
export default WorkflowAuditLog;
