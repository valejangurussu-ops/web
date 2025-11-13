import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EventsTable from "@/components/tables/EventsTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Eventos | Vale Dashboard",
  description: "Gerenciamento de eventos do sistema",
};

export default function Eventos() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Eventos" />
      <div className="space-y-6">
        <ComponentCard title="Gerenciamento de Eventos">
          <EventsTable />
        </ComponentCard>
      </div>
    </div>
  );
}
