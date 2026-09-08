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
        name: "Alice (HR Admin)",
        email: "alice.hr@terralogic.com",
        roleId: roleMap["HR"],
      },
      {
        name: "Bob (Engineering Manager)",
        email: "bob.pm@terralogic.com",
        roleId: roleMap["PROJECT_MANAGER"],
      },
      {
        name: "Charlie (IT Systems)",
        email: "charlie.admin@terralogic.com",
        roleId: roleMap["ADMIN_SYSTEMS"],
      },
      {
        name: "Diana (Finance)",
        email: "diana.accounts@terralogic.com",
        roleId: roleMap["ACCOUNTS"],
      },
      {
        name: "Evan (Facilities)",
        email: "evan.personnel@terralogic.com",
        roleId: roleMap["PERSONNEL"],
      },
    ]);

    const hrUser = users.find((u) => u.email === "alice.hr@terralogic.com") || users[0];

    const employees = await Employee.insertMany([
      {
        employeeCode: "EMP001",
        name: "Sarah Connor",
        email: "sarah.connor@terralogic.com",
        designation: "Lead QA Engineer",
        department: "Engineering",
        joiningDate: new Date("2022-03-15"),
        managerName: "Bob (Engineering Manager)",
      },
      {
        employeeCode: "EMP002",
        name: "Marcus Johnson",
        email: "marcus.johnson@terralogic.com",
        designation: "Senior Account Executive",
        department: "Sales",
        joiningDate: new Date("2021-06-20"),
        managerName: "Rachel Vance",
      },
      {
        employeeCode: "EMP003",
        name: "Priya Patel",
        email: "priya.patel@terralogic.com",
        designation: "DevOps Engineer",
        department: "Platform Engineering",
        joiningDate: new Date("2023-01-10"),
        managerName: "Bob (Engineering Manager)",
      },
      {
        employeeCode: "EMP004",
        name: "David Kim",
        email: "david.kim@terralogic.com",
        designation: "Senior Frontend Developer",
        department: "Product Engineering",
        joiningDate: new Date("2022-08-01"),
        managerName: "Bob (Engineering Manager)",
      },
      {
        employeeCode: "EMP005",
        name: "Elena Rostova",
        email: "elena.rostova@terralogic.com",
        designation: "Product Marketing Manager",
        department: "Marketing",
        joiningDate: new Date("2021-11-15"),
        managerName: "Thomas Blake",
      },
      {
        employeeCode: "EMP006",
        name: "James Wilson",
        email: "james.wilson@terralogic.com",
        designation: "Financial Analyst",
        department: "Finance",
        joiningDate: new Date("2023-04-12"),
        managerName: "Diana (Finance)",
      },
      {
        employeeCode: "EMP007",
        name: "Aisha Khan",
        email: "aisha.khan@terralogic.com",
        designation: "HR Business Partner",
        department: "Human Resources",
        joiningDate: new Date("2020-09-01"),
        managerName: "Alice (HR Admin)",
      },
      {
        employeeCode: "EMP008",
        name: "Carlos Mendez",
        email: "carlos.mendez@terralogic.com",
        designation: "Security Operations Specialist",
        department: "IT Infrastructure",
        joiningDate: new Date("2022-05-18"),
        managerName: "Charlie (IT Systems)",
      },
      {
        employeeCode: "EMP009",
        name: "Grace Hopper",
        email: "grace.hopper@terralogic.com",
        designation: "Principal Architect",
        department: "Engineering",
        joiningDate: new Date("2019-02-14"),
        managerName: "Bob (Engineering Manager)",
      },
      {
        employeeCode: "EMP010",
        name: "Liam O'Connor",
        email: "liam.oconnor@terralogic.com",
        designation: "Customer Success Lead",
        department: "Customer Operations",
        joiningDate: new Date("2023-07-25"),
        managerName: "Rachel Vance",
      },
    ]);

    const workflowTemplate = await WorkflowTemplate.create({
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
    console.log(`Employees created: ${employees.length}`);
    console.log(`Workflow template created: ${workflowTemplate.name}`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed:", error);
    try {
      await mongoose.disconnect();
    } catch {}
    process.exit(1);
  }
};

seedDatabase();
