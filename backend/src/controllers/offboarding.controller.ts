import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  Employee,
  User,
  WorkflowTemplate,
  OffboardingCase,
  WorkflowStage,
  WorkflowAuditLog,
} from "../models";
import { sendStageActivationEmail } from "../services/email.service";

export const initiateOffboarding = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { employeeId, resignationDate, lastWorkingDay, reason } = req.body;

    if (!employeeId || !resignationDate || !lastWorkingDay) {
      res.status(400).json({
        error: "Missing required fields: employeeId, resignationDate, lastWorkingDay",
      });
      return;
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    const template = await WorkflowTemplate.findOne({
      entityType: "OFFBOARDING",
      isActive: true,
    });

    if (!template) {
      res.status(404).json({ error: "Active workflow template not found" });
      return;
    }

    const timestamp = Date.now().toString().slice(-6);
    const caseNumber = `OFF-${timestamp}`;

    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const roleId = new mongoose.Types.ObjectId(req.user!.roleId);

    const offboardingCase = await OffboardingCase.create({
      caseNumber,
      employeeId: employee._id,
      workflowTemplateId: template._id,
      workflowVersion: template.version,
      employeeSnapshot: {
        employeeCode: employee.employeeCode,
        name: employee.name,
        email: employee.email,
        designation: employee.designation,
        department: employee.department,
        joiningDate: employee.joiningDate,
        managerName: employee.managerName,
      },
      resignationDate: new Date(resignationDate),
      lastWorkingDay: new Date(lastWorkingDay),
      reason: reason || "",
      status: "IN_PROGRESS",
      currentSequence: 1,
      initiatedBy: userId,
      initiatedAt: new Date(),
    });

    const stageDocs = template.stages.map((stage) => {
      const isSequenceOne = stage.sequence === 1;
      const now = new Date();
      const dueHours = stage.dueHours || 24;
      const dueAt = new Date(now.getTime() + dueHours * 60 * 60 * 1000);

      const accessRevocation =
        stage.stageCode === "ADMIN_SYSTEMS"
          ? [
              {
                system: "EMAIL" as const,
                accessIdentifier: employee.email,
                action: "DISABLE" as const,
                status: "PENDING" as const,
                executionMode: "MANUAL" as const,
              },
              {
                system: "APPLICATION" as const,
                accessIdentifier: employee.employeeCode,
                action: "REVOKE" as const,
                status: "PENDING" as const,
                executionMode: "MANUAL" as const,
              },
            ]
          : [];

      return {
        offboardingCaseId: offboardingCase._id,
        stageCode: stage.stageCode,
        stageName: stage.name,
        sequence: stage.sequence,
        executionMode: stage.executionMode,
        roleId: stage.roleId,
        assignedUserId: null,
        status: isSequenceOne ? "ACTIVE" : "PENDING",
        checklist: stage.checklist.map((item) => ({
          itemId: item.itemId,
          label: item.label,
          required: item.required,
          completed: false,
        })),
        remarks: "",
        activatedAt: isSequenceOne ? now : undefined,
        dueAt: isSequenceOne ? dueAt : undefined,
        accessRevocation,
      };
    });

    const createdStages = await WorkflowStage.insertMany(stageDocs);

    await WorkflowAuditLog.create({
      offboardingCaseId: offboardingCase._id,
      action: "OFFBOARDING_CREATED",
      performedBy: {
        userId,
        roleId,
      },
      remarks: `Offboarding initiated for ${employee.name}`,
      metadata: {
        caseNumber,
        employeeCode: employee.employeeCode,
      },
      timestamp: new Date(),
    });

    const activeStages = createdStages.filter((s) => s.status === "ACTIVE");
    for (const stage of activeStages) {
      await WorkflowAuditLog.create({
        offboardingCaseId: offboardingCase._id,
        stageId: stage._id,
        action: "STAGE_ACTIVATED",
        performedBy: {
          userId,
          roleId,
        },
        remarks: `Stage activated: ${stage.stageName}`,
        timestamp: new Date(),
      });

      const assignedUser = await User.findOne({ roleId: stage.roleId });
      if (assignedUser?.email) {
        const emailSent = await sendStageActivationEmail(
          assignedUser.email,
          stage.stageName,
          caseNumber
        );

        await WorkflowAuditLog.create({
          offboardingCaseId: offboardingCase._id,
          stageId: stage._id,
          action: emailSent ? "NOTIFICATION_SENT" : "NOTIFICATION_FAILED",
          performedBy: {
            userId,
            roleId,
          },
          remarks: emailSent
            ? `Activation notification sent to ${assignedUser.email}`
            : `Failed to send activation notification to ${assignedUser.email}`,
          timestamp: new Date(),
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Offboarding case initiated successfully",
      data: {
        case: offboardingCase,
        stages: createdStages,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to initiate offboarding case",
      details: error.message,
    });
  }
};

export const getCases = async (req: Request, res: Response): Promise<void> => {
  try {
    const cases = await OffboardingCase.find()
      .populate("employeeId")
      .populate("initiatedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: cases,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch offboarding cases",
      details: error.message,
    });
  }
};

export const getCaseById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid case ID" });
      return;
    }

    const offboardingCase = await OffboardingCase.findById(id)
      .populate("employeeId")
      .populate("initiatedBy", "name email");

    if (!offboardingCase) {
      res.status(404).json({ error: "Offboarding case not found" });
      return;
    }

    const stages = await WorkflowStage.find({ offboardingCaseId: id })
      .populate("roleId", "name code")
      .populate("assignedUserId", "name email")
      .populate("completedBy", "name email")
      .sort({ sequence: 1 });

    const auditLogs = await WorkflowAuditLog.find({ offboardingCaseId: id })
      .populate("performedBy.userId", "name email")
      .populate("performedBy.roleId", "name code")
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      data: {
        case: offboardingCase,
        stages,
        auditLogs,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch offboarding case details",
      details: error.message,
    });
  }
};
