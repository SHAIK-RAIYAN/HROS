"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, FileText, ArrowRight } from "lucide-react";
import FadeIn from "@/components/FadeIn";

export default function Home() {
  return (
    <FadeIn className="max-w-4xl mx-auto py-12 space-y-8">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Employee Offboarding Automation
        </h1>
        <p className="text-sm text-slate-500">
          Enterprise clearance operations platform for HR administrators and departmental approvers.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 bg-white shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-slate-900">
              <Layers className="h-5 w-5" />
              <CardTitle className="text-base text-slate-900">HR Dashboard</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Initiate offboarding cases, monitor clearance status across sequences, and download generated documents.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Link href="/hr/dashboard" className="block w-full">
              <Button className="w-full text-xs h-9 bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center gap-1.5">
                Go to HR Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-slate-900">
              <FileText className="h-5 w-5" />
              <CardTitle className="text-base text-slate-900">Department Tasks</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Complete department-specific checklists, manage access revocations, and submit approval sign-offs.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Link href="/tasks" className="block w-full">
              <Button variant="outline" className="w-full text-xs h-9 flex items-center justify-center gap-1.5 border-slate-200 text-slate-900 hover:bg-slate-50">
                Go to Department Tasks
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </FadeIn>
  );
}
