"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/context/SidebarContext";
import PublicHeader from "@/components/layout/PublicHeader";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Verifica se está em uma rota admin
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    // Para rotas admin, usa o SidebarProvider (layout admin)
    return (
      <SidebarProvider>
        {children}
      </SidebarProvider>
    );
  }

  // Para rotas públicas, usa o PublicHeader (layout público)
  return (
    <>
      <PublicHeader />
      <div className="md:pb-0 pb-16">
        {children}
      </div>
    </>
  );
}
