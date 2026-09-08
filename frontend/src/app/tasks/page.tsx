"use client";

import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  UserCheck,
  ShieldAlert,
  Loader2,
  Layers,
} from "lucide-react";

interface ChecklistItem {
  itemId: string;
  label: string;
  required: boolean;
  completed: boolean;
  completedAt?: string;
}

interface AccessRevocationItem {
  system: "EMAIL" | "VPN" | "APPLICATION" | "AD" | "OTHER";
  accessIdentifier?: string;
  action: "DISABLE" | "DELETE" | "REVOKE";
  status: "PENDING" | "COMPLETED" | "FAILED";
  executionMode: "MANUAL" | "AUTOMATED";
  remarks?: string;
}

interface TaskStage {
  _id: string;
  stageCode: string;
  stageName: string;
  sequence: number;
  executionMode: "SEQUENTIAL" | "PARALLEL";
  roleId?: {
    _id: string;
    name: string;
    code: string;
  };
  status: "PENDING" | "ACTIVE" | "APPROVED" | "REJECTED" | "SKIPPED";
  checklist: ChecklistItem[];
  remarks?: string;
  activatedAt?: string;
  dueAt?: string;
  accessRevocation?: AccessRevocationItem[];
  offboardingCaseId?: {
    _id: string;
    caseNumber: string;
    employeeSnapshot?: {
      name?: string;
      employeeCode?: string;
      department?: string;
      designation?: string;
      email?: string;
      managerName?: string;
    };
    resignationDate: string;
    lastWorkingDay: string;
    status: string;
  };
}

export default function DepartmentTasksPage() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<TaskStage[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});
  const [remarks, setRemarks] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get("/tasks");
      if (response.data.success && Array.isArray(response.data.data)) {
        setTasks(response.data.data);
        if (response.data.data.length > 0) {
          const currentActive = response.data.data.find((t: TaskStage) => t._id === selectedTaskId);
          if (!currentActive) {
            setSelectedTaskId(response.data.data[0]._id);
            initializeTaskForm(response.data.data[0]);
          }
        } else {
          setSelectedTaskId(null);
        }
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error || "Failed to load departmental clearance tasks"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const initializeTaskForm = (task: TaskStage) => {
    const initialMap: Record<string, boolean> = {};
    task.checklist.forEach((item) => {
      initialMap[item.itemId] = item.completed;
    });
    setChecklistState(initialMap);
    setRemarks(task.remarks || "");
  };

  useEffect(() => {
    fetchTasks();
  }, [currentUser?.id, currentUser?.roleId]);

  const selectedTask = tasks.find((t) => t._id === selectedTaskId) || null;

  const handleSelectTask = (task: TaskStage) => {
    setSelectedTaskId(task._id);
    initializeTaskForm(task);
  };

  const handleChecklistToggle = (itemId: string, checked: boolean) => {
    setChecklistState((prev) => ({
      ...prev,
      [itemId]: checked,
    }));
  };

  const handleCompleteTask = async (status: "APPROVED" | "REJECTED") => {
    if (!selectedTask) return;

    if (status === "APPROVED") {
      const requiredIncomplete = selectedTask.checklist.some(
        (item) => item.required && !checklistState[item.itemId]
      );
      if (requiredIncomplete) {
        toast.add({
          title: "Incomplete Checklist",
          description: "Please complete all mandatory clearance items before approving.",
          type: "error",
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const updatedChecklist = selectedTask.checklist.map((item) => ({
        itemId: item.itemId,
        label: item.label,
        required: item.required,
        completed: Boolean(checklistState[item.itemId]),
      }));

      const accessRevocation =
        selectedTask.accessRevocation?.map((acc) => ({
          system: acc.system,
          accessIdentifier: acc.accessIdentifier,
          action: acc.action,
          status: "COMPLETED" as const,
          executionMode: acc.executionMode,
          remarks: remarks || "Access revoked during stage clearance",
        })) || [];

      const payload = {
        status,
        remarks,
        checklist: updatedChecklist,
        accessRevocation,
      };

      const response = await api.post(`/tasks/${selectedTask._id}/complete`, payload);

      if (response.data.success) {
        toast.add({
          title: status === "APPROVED" ? "Clearance Approved" : "Clearance Rejected",
          description: `Stage '${selectedTask.stageName}' marked as ${status}.`,
          type: "success",
        });

        await fetchTasks();
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.details ||
        "Failed to submit clearance decision";
      toast.add({
        title: "Submission Error",
        description: msg,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Department Clearance Workspace
            </h1>
            <Badge variant="outline" className="text-xs font-semibold">
              Role: {currentUser?.roleName || "Unassigned"}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and execute departmental clearance checklists and system access revocations.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchTasks}
          disabled={isLoading}
          className="text-xs h-9"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Tasks
        </Button>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 px-1">
            <span>Assigned Clearances ({tasks.length})</span>
            <span>Status</span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-lg border border-slate-200 bg-white space-y-2">
              <RefreshCw className="h-5 w-5 animate-spin text-slate-400" />
              <span className="text-xs text-slate-500">Loading tasks...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center rounded-lg border border-dashed border-slate-200 bg-white space-y-2">
              <CheckCircle2 className="h-7 w-7 text-slate-400 mx-auto" />
              <div className="text-xs font-semibold text-slate-800">No Pending Tasks</div>
              <div className="text-[11px] text-slate-500">
                All clearance tasks for {currentUser?.roleName || "your role"} are currently up to date.
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => {
                const empName =
                  task.offboardingCaseId?.employeeSnapshot?.name || "Employee";
                const empCode =
                  task.offboardingCaseId?.employeeSnapshot?.employeeCode || "—";
                const caseNum = task.offboardingCaseId?.caseNumber || "—";
                const isSelected = task._id === selectedTaskId;
                const isActive = task.status === "ACTIVE";

                return (
                  <div
                    key={task._id}
                    onClick={() => handleSelectTask(task)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 text-slate-900"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-slate-900"}`}>
                            {empName}
                          </span>
                          <span className={`text-[10px] font-mono ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                            ({empCode})
                          </span>
                        </div>
                        <div className={`text-[11px] ${isSelected ? "text-slate-300" : "text-slate-600"}`}>
                          {task.stageName} • Seq {task.sequence}
                        </div>
                        <div className={`text-[10px] font-mono ${isSelected ? "text-slate-400" : "text-slate-400"}`}>
                          Case: {caseNum} • LWD: {dayjs(task.offboardingCaseId?.lastWorkingDay).format("MMM DD, YYYY")}
                        </div>
                      </div>

                      <Badge
                        variant={isActive ? "default" : "outline"}
                        className={`text-[10px] font-semibold shrink-0 ${
                          isSelected && isActive
                            ? "bg-white text-slate-900"
                            : isActive
                            ? "bg-blue-600 text-white"
                            : "border-slate-300 text-slate-500"
                        }`}
                      >
                        {isActive ? "ACTIVE" : "PENDING"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="md:col-span-7">
          {selectedTask ? (
            <Card className="border-slate-200 shadow-none">
              <CardHeader className="py-4 px-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-bold text-slate-900">
                        {selectedTask.stageName}
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        Seq {selectedTask.sequence}
                      </Badge>
                      <Badge
                        variant={selectedTask.status === "ACTIVE" ? "default" : "outline"}
                        className="text-[10px]"
                      >
                        {selectedTask.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs text-slate-600">
                      Target Employee:{" "}
                      <span className="font-semibold text-slate-900">
                        {selectedTask.offboardingCaseId?.employeeSnapshot?.name}
                      </span>{" "}
                      ({selectedTask.offboardingCaseId?.employeeSnapshot?.employeeCode}) • Case{" "}
                      <span className="font-mono">{selectedTask.offboardingCaseId?.caseNumber}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Clearance Checklist Items
                    </Label>
                    <span className="text-[11px] text-slate-500">
                      {selectedTask.checklist.filter((i) => checklistState[i.itemId]).length} of{" "}
                      {selectedTask.checklist.length} completed
                    </span>
                  </div>

                  <div className="space-y-2 border border-slate-100 rounded-lg p-2.5 bg-slate-50/40">
                    {selectedTask.checklist.map((item) => {
                      const isChecked = Boolean(checklistState[item.itemId]);
                      const isDisabled = selectedTask.status !== "ACTIVE" || isSubmitting;

                      return (
                        <div
                          key={item.itemId}
                          onClick={() => {
                            if (!isDisabled) {
                              handleChecklistToggle(item.itemId, !isChecked);
                            }
                          }}
                          className={`flex items-start gap-3 p-2.5 rounded-md border transition-all ${
                            isDisabled ? "cursor-default" : "cursor-pointer"
                          } ${
                            isChecked
                              ? "border-emerald-200 bg-emerald-50/60"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <Checkbox
                            id={item.itemId}
                            checked={isChecked}
                            onCheckedChange={(checked) =>
                              handleChecklistToggle(item.itemId, Boolean(checked))
                            }
                            disabled={isDisabled}
                            className="mt-0.5"
                          />
                          <div className="space-y-0.5 min-w-0">
                            <label
                              htmlFor={item.itemId}
                              className={`text-xs font-medium cursor-pointer ${
                                isChecked ? "text-emerald-950 font-semibold" : "text-slate-800"
                              }`}
                            >
                              {item.label}
                            </label>
                            {item.required && (
                              <span className="text-[10px] text-rose-600 block">
                                Mandatory clearance item
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedTask.accessRevocation && selectedTask.accessRevocation.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Access Revocation Action List
                    </Label>
                    <div className="space-y-1.5">
                      {selectedTask.accessRevocation.map((acc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded border border-slate-200 bg-slate-50 text-xs"
                        >
                          <span className="font-semibold text-slate-800">
                            {acc.system}: {acc.accessIdentifier}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] bg-white">
                              {acc.action}
                            </Badge>
                            <span className="text-[11px] font-mono text-slate-600">{acc.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <Label htmlFor="remarks" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Remarks & Sign-off Notes
                  </Label>
                  <Textarea
                    id="remarks"
                    rows={3}
                    placeholder="Provide stage clearance remarks, verification notes, or reason if rejecting..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    disabled={selectedTask.status !== "ACTIVE" || isSubmitting}
                    className="text-xs resize-none"
                  />
                </div>

                {selectedTask.status === "ACTIVE" ? (
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCompleteTask("REJECTED")}
                      disabled={isSubmitting}
                      className="text-xs h-9 bg-rose-600 text-white hover:bg-rose-700"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1.5" />
                      Reject Clearance
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleCompleteTask("APPROVED")}
                      disabled={isSubmitting}
                      className="text-xs h-9 bg-slate-900 text-white hover:bg-slate-800"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                          Approve Clearance
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 rounded bg-slate-50 border border-slate-200 text-xs text-slate-600 text-center">
                    This task has status <strong>{selectedTask.status}</strong> and cannot be modified.
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-slate-200 bg-white">
              <FileText className="h-8 w-8 text-slate-300 mb-2" />
              <div className="text-xs font-semibold text-slate-700">No Stage Selected</div>
              <div className="text-[11px] text-slate-500 max-w-xs mt-1">
                Select a clearance task from the left list to review checklists and submit approval sign-offs.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
