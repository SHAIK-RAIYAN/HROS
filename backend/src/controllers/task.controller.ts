import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  User,
  WorkflowStage,
  OffboardingCase,
  WorkflowAuditLog,
} from "../models";
import {
  sendStageActivationEmail,
  sendOffboardingCompleteEmail,
} from "../services/email.service";
import { generateOffboardingDocuments } from "../services/pdf.service";

export const getPendingTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const roleId = new mongoose.Types.ObjectId(req.user!.roleId);

    const stages = await WorkflowStage.find({
      roleId,
      status: { $in: ["ACTIVE", "PENDING"] },
    })
      .populate("offboardingCaseId")
      .populate("roleId", "name code")
      .sort({ sequence: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: stages,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch pending tasks",
      details: error.message,
    });
  }
};

export const completeTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, checklist, remarks, accessRevocation } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid stage ID" });
      return;
    }

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      res.status(400).json({
        error: "Invalid or missing status. Allowed values: APPROVED, REJECTED",
      });
      return;
    }

    const stage = await WorkflowStage.findById(id);
    if (!stage) {
      res.status(404).json({ error: "Workflow stage not found" });
      return;
    }

    if (stage.status !== "ACTIVE") {
      res.status(400).json({
        error: `Cannot complete stage with status '${stage.status}'. Stage must be 'ACTIVE'.`,
      });
      return;
    }

    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const roleId = new mongoose.Types.ObjectId(req.user!.roleId);

    if (checklist && Array.isArray(checklist)) {
      const checklistMap = new Map<string, boolean>();
      for (const item of checklist) {
        if (item.itemId) {
          checklistMap.set(item.itemId, Boolean(item.completed));
        }
      }

      stage.checklist = stage.checklist.map((item) => {
        const isCompleted = checklistMap.has(item.itemId)
          ? checklistMap.get(item.itemId)!
          : item.completed;

        return {
          itemId: item.itemId,
          label: item.label,
          required: item.required,
          completed: isCompleted,
          completedAt: isCompleted ? (item.completedAt || new Date()) : undefined,
        };
      });
    }

    if (accessRevocation && Array.isArray(accessRevocation)) {
      stage.accessRevocation = accessRevocation.map((item: any) => ({
        system: item.system,
        accessIdentifier: item.accessIdentifier,
        action: item.action,
        status: item.status || "COMPLETED",
        executionMode: item.executionMode || "MANUAL",
        performedBy: userId,
        performedAt: new Date(),
        remarks: item.remarks || "",
      }));
    }

    stage.status = status;
    stage.remarks = remarks !== undefined ? remarks : stage.remarks;
    stage.completedBy = userId;
    stage.completedAt = new Date();

    await stage.save();

    await WorkflowAuditLog.create({
      offboardingCaseId: stage.offboardingCaseId,
      stageId: stage._id,
      action: status,
      performedBy: {
        userId,
        roleId,
      },
      remarks: remarks || `Stage ${stage.stageName} ${status.toLowerCase()}`,
      metadata: {
        stageCode: stage.stageCode,
        sequence: stage.sequence,
      },
      timestamp: new Date(),
    });

    const offboardingCase = await OffboardingCase.findById(stage.offboardingCaseId);
    if (!offboardingCase) {
      res.status(404).json({ error: "Associated offboarding case not found" });
      return;
    }

    if (status === "REJECTED") {
      offboardingCase.status = "REJECTED";
      await offboardingCase.save();

      await WorkflowAuditLog.create({
        offboardingCaseId: offboardingCase._id,
        stageId: stage._id,
        action: "REJECTED",
        performedBy: {
          userId,
          roleId,
        },
        remarks: `Workflow rejected at stage: ${stage.stageName}`,
        timestamp: new Date(),
      });
    } else if (status === "APPROVED") {
      const allStagesInSequence = await WorkflowStage.find({
        offboardingCaseId: stage.offboardingCaseId,
        sequence: stage.sequence,
      });

      const isSequenceFullyApproved = allStagesInSequence.every(
        (s) => s.status === "APPROVED"
      );

      if (isSequenceFullyApproved) {
        const remainingStages = await WorkflowStage.find({
          offboardingCaseId: stage.offboardingCaseId,
          sequence: { $gt: stage.sequence },
        }).sort({ sequence: 1 });

        if (remainingStages.length > 0) {
          const nextSequence = remainingStages[0].sequence;
          offboardingCase.currentSequence = nextSequence;
          await offboardingCase.save();

          const now = new Date();
          const dueAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

          await WorkflowStage.updateMany(
            {
              offboardingCaseId: stage.offboardingCaseId,
              sequence: nextSequence,
            },
            {
              $set: {
                status: "ACTIVE",
                activatedAt: now,
                dueAt,
              },
            }
          );

          const newlyActivatedStages = await WorkflowStage.find({
            offboardingCaseId: stage.offboardingCaseId,
            sequence: nextSequence,
          });

          for (const nextStage of newlyActivatedStages) {
            await WorkflowAuditLog.create({
              offboardingCaseId: offboardingCase._id,
              stageId: nextStage._id,
              action: "STAGE_ACTIVATED",
              performedBy: {
                userId,
                roleId,
              },
              remarks: `Stage activated: ${nextStage.stageName}`,
              timestamp: new Date(),
            });

            const assignedUser = await User.findOne({ roleId: nextStage.roleId });
            if (assignedUser?.email) {
              const emailSent = await sendStageActivationEmail(
                assignedUser.email,
                nextStage.stageName,
                offboardingCase.caseNumber
              );

              await WorkflowAuditLog.create({
                offboardingCaseId: offboardingCase._id,
                stageId: nextStage._id,
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
        } else {
          const employeeName =
            offboardingCase.employeeSnapshot?.name || "Employee";

          const documentUrls = await generateOffboardingDocuments(
            employeeName,
            offboardingCase.resignationDate,
            offboardingCase.lastWorkingDay,
            offboardingCase.caseNumber
          );

          offboardingCase.documentUrls = documentUrls;
          offboardingCase.status = "COMPLETED";
          offboardingCase.completedAt = new Date();
          await offboardingCase.save();

          await WorkflowAuditLog.create({
            offboardingCaseId: offboardingCase._id,
            action: "DOCUMENT_GENERATED",
            performedBy: {
              userId,
              roleId,
            },
            remarks: "Offboarding documents generated (Resignation Acceptance, NOC, Relieving Letter)",
            metadata: {
              documentUrls,
            },
            timestamp: new Date(),
          });

          await WorkflowAuditLog.create({
            offboardingCaseId: offboardingCase._id,
            action: "WORKFLOW_COMPLETED",
            performedBy: {
              userId,
              roleId,
            },
            remarks: "All offboarding clearance stages completed successfully",
            timestamp: new Date(),
          });

          const hrUser = await User.findById(offboardingCase.initiatedBy);
          const hrEmail = hrUser?.email || "hr@terralogic.com";

          const emailSent = await sendOffboardingCompleteEmail(
            hrEmail,
            employeeName,
            offboardingCase.caseNumber
          );

          await WorkflowAuditLog.create({
            offboardingCaseId: offboardingCase._id,
            action: emailSent ? "NOTIFICATION_SENT" : "NOTIFICATION_FAILED",
            performedBy: {
              userId,
              roleId,
            },
            remarks: emailSent
              ? `Completion notification sent to HR (${hrEmail})`
              : `Failed to send completion notification to HR (${hrEmail})`,
            timestamp: new Date(),
          });
        }
      }
    }

    const updatedCase = await OffboardingCase.findById(stage.offboardingCaseId);

    res.status(200).json({
      success: true,
      message: `Task ${status.toLowerCase()} successfully`,
      data: {
        stage,
        caseStatus: updatedCase?.status,
        currentSequence: updatedCase?.currentSequence,
        documentUrls: updatedCase?.documentUrls,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to complete task",
      details: error.message,
    });
  }
};
