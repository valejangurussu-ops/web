"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeaderWrapper from "@/layout/AppHeaderWrapper";
import React from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div
      className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
    >
      {/* Header */}
      <AppHeaderWrapper />
      {/* Page Content */}
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
    </div>
  );
}
