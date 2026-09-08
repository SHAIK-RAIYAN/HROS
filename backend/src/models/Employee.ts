import mongoose, { Document, Schema } from "mongoose";

export interface IEmployee extends Document {
  employeeCode: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  joiningDate: Date;
  managerName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    joiningDate: {
      type: Date,
      required: true,
    },
    managerName: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const Employee = mongoose.model<IEmployee>("Employee", EmployeeSchema);
export default Employee;
