"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  RefreshCw,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Building,
  User,
  ExternalLink,
  History,
  CheckSquare,
  FileCheck,
} from "lucide-react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

interface ChecklistItem {
  itemId: string;
  label: string;
  required: boolean;
  completed: boolean;
  completedAt?: string;
}

interface AccessRevocationItem {
  system: string;
  accessIdentifier?: string;
  action: string;
  status: string;
  executionMode: string;
  performedAt?: string;
  remarks?: string;
}

interface StageDetail {
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
  completedAt?: string;
  dueAt?: string;
  completedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  accessRevocation?: AccessRevocationItem[];
}

interface AuditLogEntry {
  _id: string;
  action: string;
  performedBy?: {
    name?: string;
    userId?: { name: string; email: string };
    roleId?: { name: string; code: string };
  };
  remarks?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

interface CaseDetailData {
  case: {
    _id: string;
    caseNumber: string;
    employeeId?: {
      _id: string;
      name: string;
      employeeCode: string;
      department: string;
      designation: string;
      email: string;
      managerName?: string;
      joiningDate?: string;
    };
    employeeSnapshot?: {
      name?: string;
      employeeCode?: string;
      department?: string;
      designation?: string;
      email?: string;
      managerName?: string;
      joiningDate?: string;
    };
    resignationDate: string;
    lastWorkingDay: string;
    reason?: string;
    status: "INITIATED" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED" | "REJECTED";
    currentSequence: number;
    documentUrls?: {
      resignationAcceptance?: string | null;
      noc?: string | null;
      experienceRelieving?: string | null;
    };
    initiatedBy?: {
      name: string;
      email: string;
    };
    initiatedAt?: string;
    completedAt?: string;
  };
  stages: StageDetail[];
  auditLogs: AuditLogEntry[];
}

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params?.id as string;

  const [data, setData] = useState<CaseDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCaseDetails = async () => {
    if (!caseId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get(`/offboarding/${caseId}`);
      if (response.data.success && response.data.data) {
        setData(response.data.data);
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error || "Failed to load offboarding case details"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseDetails();
  }, [caseId]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            COMPLETED
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="h-3.5 w-3.5" />
            IN PROGRESS
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="h-3.5 w-3.5" />
            REJECTED
          </span>
        );
      case "INITIATED":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            INITIATED
          </span>
        );
    }
  };

  const getStageStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </span>
        );
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="h-3 w-3 animate-pulse" />
            Action Required
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Pending
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
        <span className="text-xs text-slate-500">Loading offboarding case details...</span>
      </div>
    );
  }

  if (errorMessage || !data) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto py-8">
        <Link href="/hr/dashboard">
          <Button variant="ghost" size="sm" className="text-xs">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>{errorMessage || "Case not found."}</span>
        </div>
      </div>
    );
  }

  const { case: c, stages, auditLogs } = data;
  const empName = c.employeeSnapshot?.name || c.employeeId?.name || "Employee";
  const empCode = c.employeeSnapshot?.employeeCode || c.employeeId?.employeeCode || "—";
  const empDept = c.employeeSnapshot?.department || c.employeeId?.department || "—";
  const empDesig = c.employeeSnapshot?.designation || c.employeeId?.designation || "—";
  const empEmail = c.employeeSnapshot?.email || c.employeeId?.email || "—";
  const managerName = c.employeeSnapshot?.managerName || c.employeeId?.managerName || "—";

  const isCompleted = c.status === "COMPLETED";

  const seq1Stages = stages.filter((s) => s.sequence === 1);
  const seq2Stages = stages.filter((s) => s.sequence === 2);
  const seq3Stages = stages.filter((s) => s.sequence === 3);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link href="/hr/dashboard" className="hover:text-slate-900 transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              HR Dashboard
            </Link>
            <span>/</span>
            <span className="font-mono text-slate-700">{c.caseNumber}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {empName}
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {c.caseNumber}
            </span>
            {getStatusBadge(c.status)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCaseDetails}
            disabled={isLoading}
            className="text-xs h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh State
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 p-4 rounded-lg border border-slate-200 bg-white text-xs">
        <div>
          <span className="text-slate-500 block text-[11px]">Employee Code</span>
          <span className="font-mono font-semibold text-slate-900">{empCode}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Designation</span>
          <span className="font-medium text-slate-900">{empDesig}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Department</span>
          <span className="font-medium text-slate-900">{empDept}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Reporting Manager</span>
          <span className="font-medium text-slate-900">{managerName}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Resignation Date</span>
          <span className="font-medium text-slate-900">{dayjs(c.resignationDate).format("MMM DD, YYYY")}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Last Working Day</span>
          <span className="font-medium text-slate-900">{dayjs(c.lastWorkingDay).format("MMM DD, YYYY")}</span>
        </div>
      </div>

      {isCompleted && c.documentUrls && (
        <Card className="border-emerald-200 bg-emerald-50/50 shadow-none">
          <CardHeader className="py-3 px-5 border-b border-emerald-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div>
                <CardTitle className="text-sm font-bold text-emerald-950">
                  Offboarding Completed & Documents Generated
                </CardTitle>
                <CardDescription className="text-xs text-emerald-800">
                  All clearance stages approved. Official signed PDF letters are generated and ready for distribution.
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="border-emerald-300 bg-emerald-100 text-emerald-900 text-xs font-semibold">
              Certified Complete
            </Badge>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {c.documentUrls.resignationAcceptance && (
                <div className="p-3.5 rounded-lg border border-emerald-200 bg-white flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <FileText className="h-5 w-5 text-slate-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-xs text-slate-900">Resignation Acceptance</div>
                      <div className="text-[11px] text-slate-500">Official acknowledgment letter</div>
                    </div>
                  </div>
                  <a
                    href={`${BACKEND_URL}${c.documentUrls.resignationAcceptance}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button variant="outline" size="sm" className="w-full text-xs h-8 gap-1.5 border-slate-300">
                      <Download className="h-3.5 w-3.5 text-slate-600" />
                      Download PDF
                    </Button>
                  </a>
                </div>
              )}

              {c.documentUrls.noc && (
                <div className="p-3.5 rounded-lg border border-emerald-200 bg-white flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-xs text-slate-900">NOC & Clearance Record</div>
                      <div className="text-[11px] text-slate-500">5-department signed certificate</div>
                    </div>
                  </div>
                  <a
                    href={`${BACKEND_URL}${c.documentUrls.noc}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button variant="outline" size="sm" className="w-full text-xs h-8 gap-1.5 border-slate-300">
                      <Download className="h-3.5 w-3.5 text-slate-600" />
                      Download PDF
                    </Button>
                  </a>
                </div>
              )}

              {c.documentUrls.experienceRelieving && (
                <div className="p-3.5 rounded-lg border border-emerald-200 bg-white flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <FileCheck className="h-5 w-5 text-indigo-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-xs text-slate-900">Experience & Relieving</div>
                      <div className="text-[11px] text-slate-500">Official release certification</div>
                    </div>
                  </div>
                  <a
                    href={`${BACKEND_URL}${c.documentUrls.experienceRelieving}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button variant="outline" size="sm" className="w-full text-xs h-8 gap-1.5 border-slate-300">
                      <Download className="h-3.5 w-3.5 text-slate-600" />
                      Download PDF
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200 shadow-none">
        <CardHeader className="py-3 px-5 border-b border-slate-100">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Clearance Workflow Progression
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">Sequence 1: Manager</span>
                <span className="text-[10px] text-slate-500">Sequential</span>
              </div>
              {seq1Stages.map((stage) => (
                <div key={stage._id} className="p-2.5 rounded bg-white border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs text-slate-900">{stage.stageName}</span>
                    {getStageStatusBadge(stage.status)}
                  </div>
                  {stage.completedBy && (
                    <div className="text-[10px] text-slate-500">
                      By {stage.completedBy.name} • {dayjs(stage.completedAt).format("MMM DD, HH:mm")}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">Sequence 2: Operational</span>
                <span className="text-[10px] text-slate-500">Parallel (3 Stages)</span>
              </div>
              <div className="space-y-2">
                {seq2Stages.map((stage) => (
                  <div key={stage._id} className="p-2.5 rounded bg-white border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs text-slate-900">{stage.stageName}</span>
                      {getStageStatusBadge(stage.status)}
                    </div>
                    {stage.completedBy && (
                      <div className="text-[10px] text-slate-500">
                        By {stage.completedBy.name} • {dayjs(stage.completedAt).format("MMM DD, HH:mm")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">Sequence 3: Final Certification</span>
                <span className="text-[10px] text-slate-500">Sequential</span>
              </div>
              {seq3Stages.map((stage) => (
                <div key={stage._id} className="p-2.5 rounded bg-white border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs text-slate-900">{stage.stageName}</span>
                    {getStageStatusBadge(stage.status)}
                  </div>
                  {stage.completedBy && (
                    <div className="text-[10px] text-slate-500">
                      By {stage.completedBy.name} • {dayjs(stage.completedAt).format("MMM DD, HH:mm")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="stages" className="w-full space-y-4">
        <TabsList className="bg-slate-100 border border-slate-200 p-0.5">
          <TabsTrigger value="stages" className="text-xs font-semibold px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-900">
            <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
            Department Clearance Checklists ({stages.length})
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs font-semibold px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-900">
            <History className="h-3.5 w-3.5 mr-1.5" />
            Audit Activity Timeline ({auditLogs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stages" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stages.map((stage) => (
              <Card key={stage._id} className="border-slate-200 shadow-none">
                <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50/70 flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{stage.stageName}</span>
                      <span className="text-[10px] font-mono text-slate-500">Seq {stage.sequence}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Role: {stage.roleId?.name || "System Role"}</div>
                  </div>
                  {getStageStatusBadge(stage.status)}
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Checklist Items</span>
                    <div className="space-y-1">
                      {stage.checklist.map((item) => (
                        <div
                          key={item.itemId}
                          className="flex items-center justify-between p-2 rounded border border-slate-100 bg-slate-50/50 text-xs"
                        >
                          <span className={item.completed ? "text-slate-900" : "text-slate-600"}>
                            {item.label}
                          </span>
                          {item.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          ) : (
                            <span className="text-[10px] font-medium text-slate-400">Pending</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {stage.accessRevocation && stage.accessRevocation.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Access Revocations</span>
                      <div className="space-y-1">
                        {stage.accessRevocation.map((acc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-slate-100 text-[11px]">
                            <span className="font-semibold text-slate-800">{acc.system}: {acc.accessIdentifier}</span>
                            <Badge variant="outline" className="text-[10px] bg-white">
                              {acc.action} • {acc.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {stage.remarks && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">Remarks</span>
                      <div className="p-2 rounded bg-slate-100 text-xs text-slate-800 font-normal italic">
                        &ldquo;{stage.remarks}&rdquo;
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="py-3 px-5 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Chronological Audit History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {auditLogs.map((log) => {
                  const actorName =
                    log.performedBy?.name ||
                    log.performedBy?.userId?.name ||
                    "System Engine";
                  const roleName =
                    log.performedBy?.roleId?.name || "BlazeUp HROS";

                  return (
                    <div key={log._id} className="p-3.5 hover:bg-slate-50/50 transition-colors flex items-start justify-between gap-4 text-xs">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-slate-900">{log.action}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-700 font-medium">{actorName} ({roleName})</span>
                        </div>
                        {log.remarks && (
                          <div className="text-slate-600 text-xs">{log.remarks}</div>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 shrink-0 font-mono">
                        {dayjs(log.timestamp).format("MMM DD, YYYY HH:mm:ss")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
