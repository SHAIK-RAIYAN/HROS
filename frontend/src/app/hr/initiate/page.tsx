"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import FadeIn from "@/components/FadeIn";

interface EmployeeOption {
  _id: string;
  employeeCode: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  joiningDate: string;
  managerName?: string;
}

const initiateSchema = z.object({
  employeeId: z.string().min(1, "Please select an employee"),
  resignationDate: z.string().min(1, "Resignation date is required"),
  lastWorkingDay: z.string().min(1, "Last working day is required"),
  reason: z.string().optional(),
});

type InitiateFormData = z.infer<typeof initiateSchema>;

export default function InitiateOffboardingPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOption | null>(null);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InitiateFormData>({
    resolver: zodResolver(initiateSchema),
    defaultValues: {
      employeeId: "",
      resignationDate: new Date().toISOString().split("T")[0],
      lastWorkingDay: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      reason: "",
    },
  });

  const selectedEmployeeId = watch("employeeId");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/employees");
        if (res.data.success && Array.isArray(res.data.data)) {
          setEmployees(res.data.data);
          if (res.data.data.length > 0) {
            setValue("employeeId", res.data.data[0]._id);
            setSelectedEmployee(res.data.data[0]);
          }
        }
      } catch (err: any) {
        setErrorMessage("Failed to load employee directory");
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, [setValue]);

  const handleEmployeeChange = (empId: string | null) => {
    if (!empId) return;
    setValue("employeeId", empId);
    const emp = employees.find((e) => e._id === empId) || null;
    setSelectedEmployee(emp);
  };

  const onSubmit = async (data: InitiateFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        employeeId: data.employeeId,
        resignationDate: data.resignationDate,
        lastWorkingDay: data.lastWorkingDay,
        reason: data.reason || "",
      };

      const response = await api.post("/offboarding/initiate", payload);

      if (response.data.success) {
        toast.add({
          title: "Offboarding Initiated",
          description: `Case ${response.data.data.case.caseNumber} created successfully.`,
          type: "success",
        });
        router.push("/hr/dashboard");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.details ||
        "Failed to initiate offboarding case.";
      setErrorMessage(msg);
      toast.add({
        title: "Initiation Failed",
        description: msg,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FadeIn className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link href="/hr/dashboard" className="hover:text-slate-900 transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              HR Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Initiate Offboarding</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Initiate Employee Offboarding
          </h1>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 space-y-6">
            <Card className="border-slate-200 bg-white shadow-none">
              <CardHeader className="py-4 px-5 border-b border-slate-100">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Offboarding Parameters
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Select employee and specify official resignation and last working timelines.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="employeeId" className="text-xs font-semibold text-slate-700">
                    Target Employee *
                  </Label>
                  <Select
                    value={selectedEmployeeId || ""}
                    onValueChange={handleEmployeeChange}
                    disabled={isLoadingEmployees}
                  >
                    <SelectTrigger id="employeeId" className="w-full text-xs h-9 border-slate-200 bg-white text-slate-900">
                      <SelectValue placeholder="Select an employee...">
                        {selectedEmployee
                          ? `${selectedEmployee.name} (${selectedEmployee.employeeCode}) — ${selectedEmployee.designation}`
                          : "Select an employee..."}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp._id} value={emp._id} className="text-xs">
                          {emp.name} ({emp.employeeCode}) — {emp.designation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.employeeId && (
                    <p className="text-xs text-rose-600">{errors.employeeId.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="resignationDate" className="text-xs font-semibold text-slate-700">
                      Resignation Date *
                    </Label>
                    <Input
                      id="resignationDate"
                      type="date"
                      className="h-9 text-xs border-slate-200 bg-white text-slate-900"
                      {...register("resignationDate")}
                    />
                    {errors.resignationDate && (
                      <p className="text-xs text-rose-600">{errors.resignationDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="lastWorkingDay" className="text-xs font-semibold text-slate-700">
                      Last Working Day *
                    </Label>
                    <Input
                      id="lastWorkingDay"
                      type="date"
                      className="h-9 text-xs border-slate-200 bg-white text-slate-900"
                      {...register("lastWorkingDay")}
                    />
                    {errors.lastWorkingDay && (
                      <p className="text-xs text-rose-600">{errors.lastWorkingDay.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reason" className="text-xs font-semibold text-slate-700">
                    Reason for Separation (Optional)
                  </Label>
                  <Textarea
                    id="reason"
                    rows={3}
                    placeholder="Enter resignation reason, internal notes, or remarks..."
                    className="text-xs resize-none border-slate-200 bg-white text-slate-900"
                    {...register("reason")}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-3">
              <Link href="/hr/dashboard">
                <Button type="button" variant="outline" size="sm" className="text-xs h-9 border-slate-200 text-slate-700 hover:bg-slate-50">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                size="sm"
                className="text-xs h-9 bg-slate-900 text-white hover:bg-slate-800"
                disabled={isSubmitting || isLoadingEmployees}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Initiating Workflow...
                  </>
                ) : (
                  "Initiate Clearance Workflow"
                )}
              </Button>
            </div>
          </div>

          <div className="md:col-span-5 space-y-6">
            <Card className="border-slate-200 shadow-none bg-slate-50/50">
              <CardHeader className="py-4 px-5 border-b border-slate-200">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Employee Snapshot Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {selectedEmployee ? (
                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-start gap-2.5 pb-3 border-b border-slate-200">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold shrink-0">
                        {selectedEmployee.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{selectedEmployee.name}</div>
                        <div className="text-slate-500 font-mono text-[11px]">{selectedEmployee.employeeCode}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] text-slate-500 block">Designation</span>
                        <span className="font-medium text-slate-800">{selectedEmployee.designation}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Department</span>
                        <span className="font-medium text-slate-800">{selectedEmployee.department}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Official Email</span>
                        <span className="font-medium text-slate-800 truncate block">{selectedEmployee.email || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Reporting Manager</span>
                        <span className="font-medium text-slate-800">{selectedEmployee.managerName || "—"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[11px] text-slate-500 block">Joining Date</span>
                        <span className="font-medium text-slate-800">
                          {selectedEmployee.joiningDate && !isNaN(new Date(selectedEmployee.joiningDate).getTime())
                            ? new Date(selectedEmployee.joiningDate).toISOString().split("T")[0]
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 text-center py-6">
                    No employee selected.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-none">
              <CardHeader className="py-3 px-5 border-b border-slate-100">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Triggered Workflow Stages
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center justify-between p-2 rounded bg-slate-100 border border-slate-200">
                  <span className="font-semibold text-slate-800">Seq 1: Reporting Manager</span>
                  <span className="text-[10px] text-slate-500">Sequential</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-700">Seq 2: Admin & Systems, Accounts, Personnel</span>
                  <span className="text-[10px] text-slate-500">Parallel</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-700">Seq 3: HR Final Clearance</span>
                  <span className="text-[10px] text-slate-500">Sequential</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </FadeIn>
  );
}
