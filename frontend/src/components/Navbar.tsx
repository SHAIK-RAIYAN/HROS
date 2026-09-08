"use client";

import React from "react";
import Link from "next/link";
import { useAuth, MockUser } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldCheck, UserCheck, Layers, FileText } from "lucide-react";

export const Navbar: React.FC = () => {
  const { currentUser, availableUsers, loginAs } = useAuth();

  const handleUserChange = (userId: string | null) => {
    if (!userId) return;
    const selected = availableUsers.find((u) => u.id === userId);
    if (selected) {
      loginAs(selected);
    }
  };

  const getRoleBadgeVariant = (roleCode?: string) => {
    switch (roleCode) {
      case "HR":
        return "default";
      case "PROJECT_MANAGER":
        return "secondary";
      case "ADMIN_SYSTEMS":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight text-slate-900 dark:text-white">
                BlazeUp HROS
              </span>
              <span className="text-[10px] font-normal tracking-wide text-muted-foreground uppercase">
                Offboarding Automation
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link
              href="/hr/dashboard"
              className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Layers className="h-4 w-4" />
              HR Dashboard
            </Link>
            <Link
              href="/tasks"
              className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <FileText className="h-4 w-4" />
              Department Tasks
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-1.5">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold leading-none">
                {currentUser?.name || "Select User"}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {currentUser?.email || ""}
              </span>
            </div>

            {currentUser && (
              <Badge variant={getRoleBadgeVariant(currentUser.roleCode)} className="text-[10px] font-semibold">
                {currentUser.roleName}
              </Badge>
            )}

            <div className="w-[180px]">
              <Select
                value={currentUser?.id || ""}
                onValueChange={handleUserChange}
              >
                <SelectTrigger className="h-8 text-xs">
                  <UserCheck className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Switch Persona" />
                </SelectTrigger>
                <SelectContent align="end">
                  {availableUsers.map((user: MockUser) => (
                    <SelectItem key={user.id} value={user.id} className="text-xs">
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {user.roleName} ({user.email})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
