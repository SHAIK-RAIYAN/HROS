"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, MockUser } from "@/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldCheck, UserCheck } from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, availableUsers, loginAs } = useAuth();
  const isTasksPath = pathname?.startsWith("/tasks");

  const handleUserChange = (userId: string | null) => {
    if (!userId) return;
    const selected = availableUsers.find((u) => u.id === userId);
    if (selected) {
      loginAs(selected);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-sm text-slate-900">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-900 text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span>BlazeUp HROS</span>
          </Link>

          <nav className="flex items-center gap-4 text-xs font-medium">
            <Link
              href="/hr/dashboard"
              className="text-slate-600 transition-colors hover:text-slate-900"
            >
              HR Dashboard
            </Link>
            <Link
              href="/tasks"
              className="text-slate-600 transition-colors hover:text-slate-900"
            >
              Tasks
            </Link>
          </nav>
        </div>

        {isTasksPath && (
          <div className="flex items-center gap-2">
            <div className="w-[230px]">
              <Select
                value={currentUser?.id || ""}
                onValueChange={handleUserChange}
              >
                <SelectTrigger className="h-8 text-xs border-slate-200">
                  <UserCheck className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                  <SelectValue placeholder="Select Persona">
                    {currentUser ? `${currentUser.name} (${currentUser.roleName})` : "Select Persona"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="end">
                  {availableUsers.map((user: MockUser) => (
                    <SelectItem key={user.id} value={user.id} className="text-xs">
                      {user.name} ({user.roleName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
