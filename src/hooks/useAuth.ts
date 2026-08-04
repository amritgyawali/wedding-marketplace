"use client";

import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    role: session?.user?.role as UserRole | undefined,
    isCouple: session?.user?.role === UserRole.COUPLE,
    isVendor: session?.user?.role === UserRole.VENDOR,
    isAdmin: session?.user?.role === UserRole.ADMIN,
  };
}
