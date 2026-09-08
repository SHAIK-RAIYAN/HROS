"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ArrowRight, UserCheck, Layers, FileText, CheckCircle2 } from "lucide-react";

export default function Home() {
  const { currentUser, isLoading } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 p-8 text-white shadow-md">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
            Hackathon Demo Shell
          </Badge>
          <Badge variant="outline" className="border-white/20 text-white">
            Next.js App Router + Express API
          </Badge>
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Employee Offboarding Automation
        </h1>
        <p className="max-w-2xl text-slate-300 text-sm sm:text-base">
          A centralized digital clearance workflow engine with multi-stage role approvals, parallel clearances, dynamic PDF letter generation, and audit tracking.
        </p>

        <div className="mt-2 flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs">
            <UserCheck className="h-4 w-4 text-emerald-400" />
            <span>Active Persona:</span>
            <span className="font-semibold text-white">
              {isLoading ? "Loading..." : currentUser ? `${currentUser.name} (${currentUser.roleName})` : "Not Selected"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <Layers className="h-5 w-5" />
              <CardTitle>HR Offboarding Dashboard</CardTitle>
            </div>
            <CardDescription>
              Initiate offboarding cases, monitor live clearance progress, track stage sequences, and access generated documents.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Case initiation with employee snapshot
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Real-time sequence tracking & status badges
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Downloadable PDF certificates (Resignation, NOC, Relieving)
              </li>
            </ul>
            <Link href="/hr/dashboard" className="block w-full">
              <Button className="w-full flex items-center justify-center gap-2">
                Open HR Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <FileText className="h-5 w-5" />
              <CardTitle>Department Clearance Portal</CardTitle>
            </div>
            <CardDescription>
              Role-based clearance interface for Project Managers, Admin & Systems, Accounts, Personnel, and HR Final.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Interactive checklist completion
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                IT Access revocation tracking (Admin & Systems)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Approve/Reject actions with mandatory remarks
              </li>
            </ul>
            <Link href="/tasks" className="block w-full">
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                View My Pending Tasks
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
