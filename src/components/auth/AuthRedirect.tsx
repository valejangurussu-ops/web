"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthLevel } from "@/hooks/useAuthLevel";

interface AuthRedirectProps {
  children: React.ReactNode;
  redirectTo?: string;
  allowedLevels?: ('unauthenticated' | 'user' | 'admin')[];
}

export function AuthRedirect({
  children,
  redirectTo = "/signin",
  allowedLevels = ['user', 'admin']
}: AuthRedirectProps) {
  const { authLevel, loading } = useAuthLevel();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !allowedLevels.includes(authLevel)) {
      router.push(redirectTo);
    }
  }, [authLevel, allowedLevels, redirectTo, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!allowedLevels.includes(authLevel)) {
    return null; // Será redirecionado
  }

  return <>{children}</>;
}
