import mongoose, { Document, Schema } from "mongoose";

export interface IRole extends Document {
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
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
  },
  {
    timestamps: true,
  }
);

export const Role = mongoose.model<IRole>("Role", RoleSchema);
export default Role;
