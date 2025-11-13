import React from "react";
import { Metadata } from "next";
import { UserRoleManager } from "@/components/admin/UserRoleManager";

export const metadata: Metadata = {
  title: "Gerenciar Usuários | Admin",
  description: "Gerenciar usuários e permissões do sistema",
};

export default function AdminUsersPage() {
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
