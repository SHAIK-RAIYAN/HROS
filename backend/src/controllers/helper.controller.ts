import { Request, Response } from "express";
import { Role, User, Employee } from "../models";

export const getRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await Role.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: roles });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch roles", details: error.message });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().populate("roleId").sort({ name: 1 });
    res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch users", details: error.message });
  }
};

export const getEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const employees = await Employee.find()
      .select("_id name employeeCode designation department email managerName joiningDate")
      .sort({ name: 1 });
    res.status(200).json({ success: true, data: employees });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch employees", details: error.message });
  }
};
