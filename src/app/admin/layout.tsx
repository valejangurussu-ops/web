"use client";

import React from "react";
import { AdminAuthCheck } from "@/components/auth/AdminAuthCheck";
import AppSidebarWrapper from "@/layout/AppSidebarWrapper";
import ClientLayout from "./ClientLayout";
import BackdropWrapper from "@/layout/BackdropWrapper";
import { AuthDebug } from "@/components/debug/AuthDebug";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthCheck>
      <div className="min-h-screen xl:flex">
        <AppSidebarWrapper />
        <BackdropWrapper />
        <ClientLayout>{children}</ClientLayout>
        <AuthDebug showAuthLevel={false} />
      </div>
    </AdminAuthCheck>
  );
}
