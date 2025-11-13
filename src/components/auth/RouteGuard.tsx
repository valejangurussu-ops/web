"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthLevel, AuthLevel } from "@/hooks/useAuthLevel";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredLevel: AuthLevel;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function RouteGuard({
  children,
  requiredLevel,
  redirectTo = "/signin",
  fallback
}: RouteGuardProps) {
  const { canAccess, loading } = useAuthLevel();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !canAccess(requiredLevel)) {
      router.push(redirectTo);
    }
  }, [canAccess, requiredLevel, redirectTo, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!canAccess(requiredLevel)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta página.</p>
          <button
            onClick={() => router.push("/")}
            className="bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Componentes específicos para cada nível
export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { isAdmin, loading } = useAuthLevel();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">Apenas administradores podem acessar esta área.</p>
          <button
            onClick={() => window.location.href = "/"}
            className="bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function UserOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RouteGuard requiredLevel="user" fallback={fallback}>
      {children}
    </RouteGuard>
  );
}

export function AuthenticatedOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RouteGuard requiredLevel="user" fallback={fallback}>
      {children}
    </RouteGuard>
  );
}
