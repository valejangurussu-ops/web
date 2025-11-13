import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OrganizationsTable from "@/components/tables/OrganizationsTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Organizações | Vale Dashboard",
  description: "Gerenciamento de organizações do sistema",
};

export default function Organizacoes() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Organizações" />
      <div className="space-y-6">
        <ComponentCard title="Gerenciamento de Organizações">
          <OrganizationsTable />
        </ComponentCard>
      </div>
    </div>
  );
}
