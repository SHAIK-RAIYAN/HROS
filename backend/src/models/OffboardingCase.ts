import mongoose, { Document, Schema, Types } from "mongoose";

export interface IEmployeeSnapshot {
  employeeCode?: string;
  name?: string;
  email?: string;
  designation?: string;
  department?: string;
  joiningDate?: Date;
  managerName?: string;
}

export interface IDocumentUrls {
  resignationAcceptance?: string | null;
  noc?: string | null;
  experienceRelieving?: string | null;
}

export type OffboardingStatus =
  | "INITIATED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export interface IOffboardingCase extends Document {
  caseNumber: string;
  employeeId: Types.ObjectId;
  workflowTemplateId: Types.ObjectId;
  workflowVersion: number;
  employeeSnapshot: IEmployeeSnapshot;
  resignationDate: Date;
  lastWorkingDay: Date;
  reason: string;
  status: OffboardingStatus;
  currentSequence: number;
  documentUrls: IDocumentUrls;
  initiatedBy: Types.ObjectId;
  initiatedAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSnapshotSchema = new Schema<IEmployeeSnapshot>(
  {
    employeeCode: String,
    name: String,
    email: String,
    designation: String,
    department: String,
    joiningDate: Date,
    managerName: String,
  },
  { _id: false }
);

const DocumentUrlsSchema = new Schema<IDocumentUrls>(
  {
    resignationAcceptance: {
      type: String,
      default: null,
    },
    noc: {
      type: String,
      default: null,
    },
    experienceRelieving: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const OffboardingCaseSchema = new Schema<IOffboardingCase>(
  {
    caseNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    workflowTemplateId: {
      type: Schema.Types.ObjectId,
      ref: "WorkflowTemplate",
      required: true,
    },
    workflowVersion: {
      type: Number,
      required: true,
    },
    employeeSnapshot: {
      type: EmployeeSnapshotSchema,
      default: () => ({}),
    },
    resignationDate: {
      type: Date,
      required: true,
    },
    lastWorkingDay: {
      type: Date,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: [
        "INITIATED",
        "IN_PROGRESS",
        "ON_HOLD",
        "COMPLETED",
        "CANCELLED",
        "REJECTED",
      ],
      default: "INITIATED",
      index: true,
    },
    currentSequence: {
      type: Number,
      default: 1,
      required: true,
    },
    documentUrls: {
      type: DocumentUrlsSchema,
      default: () => ({
        resignationAcceptance: null,
        noc: null,
        experienceRelieving: null,
      }),
    },
    initiatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    initiatedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

OffboardingCaseSchema.index({
  status: 1,
  lastWorkingDay: 1,
});

OffboardingCaseSchema.index({
  employeeId: 1,
  status: 1,
});

export const OffboardingCase = mongoose.model<IOffboardingCase>(
  "OffboardingCase",
  OffboardingCaseSchema
);
export default OffboardingCase;
