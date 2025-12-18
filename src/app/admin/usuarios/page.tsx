"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserRoleManager } from "@/components/admin/UserRoleManager";
import { useAuthLevel } from "@/hooks/useAuthLevel";

export default function AdminUsersPage() {
  const router = useRouter();
  const { isOrganization, loading } = useAuthLevel();

  useEffect(() => {
    if (!loading && isOrganization) {
      // Redirect organization users away from users page
      router.push("/admin");
    }
  }, [isOrganization, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (isOrganization) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
          <p className="mt-2 text-lg text-gray-600">
            Gerencie usuários e suas permissões no sistema
          </p>
        </div>

        <UserRoleManager />
      </div>
    </div>
  );
}
