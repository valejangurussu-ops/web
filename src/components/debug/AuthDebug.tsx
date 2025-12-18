"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthLevel } from "@/hooks/useAuthLevel";

export function AuthDebug({ showAuthLevel = false }: { showAuthLevel?: boolean }) {
  const { user, loading: authLoading } = useAuth();
  const { authLevel, isAdmin, loading: roleLoading, userRole } = useAuthLevel();

  if (!showAuthLevel) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug Auth</h3>
      <div className="space-y-1">
        <div>Auth Loading: {authLoading ? 'true' : 'false'}</div>
        <div>Role Loading: {roleLoading ? 'true' : 'false'}</div>
        <div>User ID: {user?.id || 'null'}</div>
        <div>User Email: {user?.email || 'null'}</div>
        <div>User Role: {userRole || 'null'}</div>
        <div>Auth Level: {authLevel}</div>
        <div>Is Admin: {isAdmin ? 'true' : 'false'}</div>
      </div>
    </div>
  );
}
