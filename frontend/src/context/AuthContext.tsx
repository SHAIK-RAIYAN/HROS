"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  roleName: string;
  roleCode: string;
  roleId: string;
}

interface AuthContextType {
  currentUser: MockUser | null;
  availableUsers: MockUser[];
  isLoading: boolean;
  loginAs: (user: MockUser) => void;
  logout: () => void;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [availableUsers, setAvailableUsers] = useState<MockUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUsers = async (): Promise<void> => {
    try {
      const response = await api.get("/users");
      if (response.data.success && Array.isArray(response.data.data)) {
        const mappedUsers: MockUser[] = response.data.data.map((u: any) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          roleName: u.roleId?.name || "User",
          roleCode: u.roleId?.code || "USER",
          roleId: typeof u.roleId === "object" ? u.roleId?._id : u.roleId,
        }));

        setAvailableUsers(mappedUsers);

        const savedUserStr = localStorage.getItem("mockUser");
        if (savedUserStr) {
          try {
            const savedUser = JSON.parse(savedUserStr);
            const matching = mappedUsers.find((u) => u.id === savedUser.id);
            if (matching) {
              setCurrentUser(matching);
            } else if (mappedUsers.length > 0) {
              setCurrentUser(mappedUsers[0]);
              localStorage.setItem("mockUser", JSON.stringify(mappedUsers[0]));
            }
          } catch {
            if (mappedUsers.length > 0) {
              setCurrentUser(mappedUsers[0]);
              localStorage.setItem("mockUser", JSON.stringify(mappedUsers[0]));
            }
          }
        } else if (mappedUsers.length > 0) {
          const defaultHr = mappedUsers.find((u) => u.roleCode === "HR") || mappedUsers[0];
          setCurrentUser(defaultHr);
          localStorage.setItem("mockUser", JSON.stringify(defaultHr));
        }
      }
    } catch {
      const savedUserStr = localStorage.getItem("mockUser");
      if (savedUserStr) {
        try {
          setCurrentUser(JSON.parse(savedUserStr));
        } catch {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const loginAs = (user: MockUser): void => {
    setCurrentUser(user);
    localStorage.setItem("mockUser", JSON.stringify(user));
  };

  const logout = (): void => {
    setCurrentUser(null);
    localStorage.removeItem("mockUser");
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        availableUsers,
        isLoading,
        loginAs,
        logout,
        refreshUsers: fetchUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
