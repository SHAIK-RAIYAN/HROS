"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, RefreshCw, Eye, AlertCircle, FileCheck2, Clock, CheckCircle, XCircle } from "lucide-react";
import FadeIn from "@/components/FadeIn";

interface OffboardingCaseItem {
  _id: string;
  caseNumber: string;
  employeeId?: {
    _id: string;
    name: string;
    employeeCode: string;
    department: string;
    designation: string;
    email: string;
  };
  employeeSnapshot?: {
    name?: string;
    employeeCode?: string;
    department?: string;
    designation?: string;
  };
  resignationDate: string;
  lastWorkingDay: string;
  currentSequence: number;
  status: "INITIATED" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED" | "REJECTED";
  createdAt: string;
  initiatedBy?: {
    name: string;
    email: string;
  };
}

export default function HrDashboardPage() {
  const [cases, setCases] = useState<OffboardingCaseItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCases = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get("/offboarding");
      if (response.data.success && Array.isArray(response.data.data)) {
        setCases(response.data.data);
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error || "Failed to fetch offboarding cases"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="h-3 w-3" />
            COMPLETED
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="h-3 w-3" />
            IN_PROGRESS
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="h-3 w-3" />
            REJECTED
          </span>
        );
      case "INITIATED":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            INITIATED
          </span>
        );
    }
  };

  const filteredCases = cases.filter((item) => {
    const employeeName =
      item.employeeSnapshot?.name || item.employeeId?.name || "";
    const employeeCode =
      item.employeeSnapshot?.employeeCode || item.employeeId?.employeeCode || "";
    const caseNumber = item.caseNumber || "";

    const matchesSearch =
      employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCount = cases.length;
  const inProgressCount = cases.filter((c) => c.status === "IN_PROGRESS" || c.status === "INITIATED").length;
  const completedCount = cases.filter((c) => c.status === "COMPLETED").length;
  const rejectedCount = cases.filter((c) => c.status === "REJECTED").length;

  return (
    <FadeIn className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Offboarding Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor, track, and manage active departmental clearance workflows.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCases}
            disabled={isLoading}
            className="text-xs h-9 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/hr/initiate">
            <Button size="sm" className="text-xs h-9 bg-slate-900 text-white hover:bg-slate-800">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Initiate Offboarding
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200 bg-white shadow-none">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Cases</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-none">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">In Progress</div>
            <div className="text-2xl font-bold text-amber-800 mt-1">{inProgressCount}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-none">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Completed</div>
            <div className="text-2xl font-bold text-emerald-800 mt-1">{completedCount}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-none">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Rejected</div>
            <div className="text-2xl font-bold text-rose-800 mt-1">{rejectedCount}</div>
          </CardContent>
        </Card>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by case #, employee name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs border-slate-200"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {["ALL", "IN_PROGRESS", "COMPLETED", "REJECTED"].map((st) => (
              <Button
                key={st}
                variant={statusFilter === st ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(st)}
                className={`text-xs h-8 px-3 border-slate-200 ${
                  statusFilter === st
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {st.replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-none">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="hover:bg-transparent border-slate-200">
                <TableHead className="w-[120px] text-xs font-bold text-slate-700">Case ID</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Employee</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Resignation Date</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Last Working Day</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Sequence</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Status</TableHead>
                <TableHead className="text-right text-xs font-bold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-slate-500">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-slate-400" />
                    Loading offboarding cases...
                  </TableCell>
                </TableRow>
              ) : filteredCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-slate-500">
                    <FileCheck2 className="h-6 w-6 mx-auto mb-2 text-slate-400" />
                    No active offboarding cases found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCases.map((item) => {
                  const empName =
                    item.employeeSnapshot?.name || item.employeeId?.name || "Unknown";
                  const empCode =
                    item.employeeSnapshot?.employeeCode || item.employeeId?.employeeCode || "—";
                  const empDept =
                    item.employeeSnapshot?.department || item.employeeId?.department || "";

                  return (
                    <TableRow key={item._id} className="border-slate-200 hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-slate-900">
                        {item.caseNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-xs text-slate-900">{empName}</span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {empCode} {empDept ? `• ${empDept}` : ""}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-700">
                        {dayjs(item.resignationDate).format("MMM DD, YYYY")}
                      </TableCell>
                      <TableCell className="text-xs text-slate-700">
                        {dayjs(item.lastWorkingDay).format("MMM DD, YYYY")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px] font-mono font-medium border-slate-200 text-slate-700">
                          Seq {item.currentSequence}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(item.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/hr/cases/${item._id}`}>
                          <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100">
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View Case
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </FadeIn>
  );
}
