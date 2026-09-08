import mongoose from "mongoose";
import dotenv from "dotenv";
import {
  Role,
  User,
  Employee,
  WorkflowTemplate,
  OffboardingCase,
  WorkflowStage,
  WorkflowAuditLog,
} from "../models";

dotenv.config();

const seedDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/employee-offboarding";

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding");

    await Promise.all([
      Role.deleteMany({}),
      User.deleteMany({}),
      Employee.deleteMany({}),
      WorkflowTemplate.deleteMany({}),
      OffboardingCase.deleteMany({}),
      WorkflowStage.deleteMany({}),
      WorkflowAuditLog.deleteMany({}),
    ]);
    console.log("Cleared existing collections");

    const roles = await Role.insertMany([
      { name: "Project Manager", code: "PROJECT_MANAGER" },
      { name: "Admin & Systems", code: "ADMIN_SYSTEMS" },
      { name: "Accounts", code: "ACCOUNTS" },
      { name: "Personnel", code: "PERSONNEL" },
      { name: "Human Resources", code: "HR" },
    ]);

    const roleMap = roles.reduce<Record<string, mongoose.Types.ObjectId>>((acc, role) => {
      acc[role.code] = role._id as mongoose.Types.ObjectId;
      return acc;
    }, {});

    const users = await User.insertMany([
      {
        name: "Project Manager User",
        email: "pm@terralogic.com",
        roleId: roleMap["PROJECT_MANAGER"],
      },
      {
        name: "Admin Systems User",
        email: "admin@terralogic.com",
        roleId: roleMap["ADMIN_SYSTEMS"],
      },
      {
        name: "Accounts User",
        email: "accounts@terralogic.com",
        roleId: roleMap["ACCOUNTS"],
      },
      {
        name: "Personnel User",
        email: "personnel@terralogic.com",
        roleId: roleMap["PERSONNEL"],
      },
      {
        name: "HR User",
        email: "hr@terralogic.com",
        roleId: roleMap["HR"],
      },
    ]);

    const hrUser = users.find((u) => u.email === "hr@terralogic.com") || users[4];

    const employee = await Employee.create({
      employeeCode: "EMP001",
      name: "John Doe",
      email: "john.doe@terralogic.com",
      designation: "Developer",
      department: "Engineering",
      joiningDate: new Date("2023-01-15"),
      managerName: "Project Manager User",
    });

    await WorkflowTemplate.create({
      name: "Standard Employee Offboarding",
      code: "EMPLOYEE_OFFBOARDING",
      entityType: "OFFBOARDING",
      version: 1,
      isActive: true,
      createdBy: hrUser._id as mongoose.Types.ObjectId,
      updatedBy: hrUser._id as mongoose.Types.ObjectId,
      stages: [
        {
          stageCode: "PROJECT_MANAGER",
          name: "Project / Reporting Manager",
          sequence: 1,
          executionMode: "SEQUENTIAL",
          roleId: roleMap["PROJECT_MANAGER"],
          checklist: [
            {
              itemId: "PROJECT_COMPLETION",
              label: "Project responsibilities completed",
              required: true,
            },
            {
              itemId: "KNOWLEDGE_TRANSFER",
              label: "Knowledge transfer completed",
              required: true,
            },
            {
              itemId: "ACCESS_REVIEW",
              label: "Client/project/system access reviewed",
              required: true,
            },
          ],
          requiresRemarks: true,
          allowRejection: true,
          dueHours: 24,
          reminderAfterHours: 12,
        },
        {
          stageCode: "ADMIN_SYSTEMS",
          name: "Admin & Systems",
          sequence: 2,
          executionMode: "PARALLEL",
          roleId: roleMap["ADMIN_SYSTEMS"],
          checklist: [
            {
              itemId: "LAPTOP",
              label: "Laptop returned",
              required: true,
            },
            {
              itemId: "CHARGER",
              label: "Charger returned",
              required: true,
            },
            {
              itemId: "PHONE",
              label: "Phone returned",
              required: false,
            },
            {
              itemId: "DATA_CARD",
              label: "Data card returned",
              required: false,
            },
            {
              itemId: "KEYS",
              label: "Keys returned",
              required: false,
            },
            {
              itemId: "EMAIL_ACCESS",
              label: "Email access revoked",
              required: true,
            },
            {
              itemId: "SYSTEM_ACCESS",
              label: "System access revoked",
              required: true,
            },
          ],
          requiresRemarks: true,
          allowRejection: true,
          dueHours: 24,
          reminderAfterHours: 12,
        },
        {
          stageCode: "ACCOUNTS",
          name: "Accounts",
          sequence: 2,
          executionMode: "PARALLEL",
          roleId: roleMap["ACCOUNTS"],
          checklist: [
            {
              itemId: "TRAVEL_ADVANCE",
              label: "Travel advances cleared",
              required: true,
            },
            {
              itemId: "STAFF_LOAN",
              label: "Staff loans cleared",
              required: true,
            },
            {
              itemId: "SALARY_ADVANCE",
              label: "Salary advances cleared",
              required: true,
            },
            {
              itemId: "IMPREST",
              label: "Imprest cleared",
              required: true,
            },
          ],
          requiresRemarks: true,
          allowRejection: true,
          dueHours: 24,
          reminderAfterHours: 12,
        },
        {
          stageCode: "PERSONNEL",
          name: "Personnel",
          sequence: 2,
          executionMode: "PARALLEL",
          roleId: roleMap["PERSONNEL"],
          checklist: [
            {
              itemId: "ID_CARD",
              label: "ID card returned",
              required: true,
            },
            {
              itemId: "ACCESS_CARD",
              label: "Access card returned",
              required: true,
            },
            {
              itemId: "BUSINESS_CARDS",
              label: "Business cards returned",
              required: false,
            },
          ],
          requiresRemarks: true,
          allowRejection: true,
          dueHours: 24,
          reminderAfterHours: 12,
        },
        {
          stageCode: "HR_FINAL",
          name: "HR Final Clearance",
          sequence: 3,
          executionMode: "SEQUENTIAL",
          roleId: roleMap["HR"],
          checklist: [
            {
              itemId: "FINAL_CLEARANCE",
              label: "Final HR clearance completed",
              required: true,
            },
            {
              itemId: "CERTIFICATION",
              label: "HR certification completed",
              required: true,
            },
          ],
          requiresRemarks: true,
          allowRejection: true,
          dueHours: 24,
          reminderAfterHours: 12,
        },
      ],
    });

    console.log("Database seeded successfully");
    console.log(`Roles created: ${roles.length}`);
    console.log(`Users created: ${users.length}`);
    console.log(`Employee created: ${employee.name} (${employee.employeeCode})`);
    console.log("Workflow template created: Standard Employee Offboarding");
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

seedDatabase();
