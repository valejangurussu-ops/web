"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthLevel } from "@/hooks/useAuthLevel";
import { useRouter } from "next/navigation";

interface AdminAuthCheckProps {
  children: React.ReactNode;
}

export function AdminAuthCheck({ children }: AdminAuthCheckProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useAuthLevel();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Aguarda o carregamento da autenticação
    if (authLoading || roleLoading) return;

    // Se não tem usuário, redireciona para login
    if (!user) {
      router.push("/signin");
      return;
    }

    // Se tem usuário mas não é admin, mostra acesso negado
    if (user && !isAdmin) {
      setHasChecked(true);
      return;
    }

    // Se é admin, permite acesso
    if (isAdmin) {
      setHasChecked(true);
    }
  }, [user, isAdmin, authLoading, roleLoading, router]);

  // Mostra loading enquanto verifica
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
          <p className="mt-4 text-lg text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Se não tem usuário, não renderiza nada (já redirecionou)
  if (!user) {
    return null;
  }

  // Se tem usuário mas não é admin, mostra acesso negado
  if (user && !isAdmin && hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">Apenas administradores podem acessar esta área.</p>
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

  // Se é admin, renderiza o conteúdo
  if (isAdmin && hasChecked) {
    return <>{children}</>;
  }

  // Fallback (não deveria chegar aqui)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
        <p className="mt-4 text-lg text-gray-600">Carregando...</p>
      </div>
    </div>
  );
}
