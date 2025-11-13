import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EventCategoriesTable from "@/components/tables/EventCategoriesTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Categorias | Vale Dashboard",
  description: "Gerenciamento de categorias de eventos",
};

export default function Categorias() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Categorias" />
      <div className="space-y-6">
        <ComponentCard title="Gerenciamento de Categorias">
          <EventCategoriesTable />
        </ComponentCard>
      </div>
    </div>
  );
}
