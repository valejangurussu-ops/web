"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EventForm from "@/components/forms/EventForm";
import { EventFormData } from "@/types/event";
import { eventService } from "@/services/eventService";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function NovoEvento() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (eventData: EventFormData) => {
         try {
           setIsSubmitting(true);
           await eventService.createEvent(eventData, user?.id);
           router.push("/admin/eventos");
         } catch (error) {
           console.error("Erro ao criar evento:", error);
           throw error;
         } finally {
           setIsSubmitting(false);
         }
       };

       const handleCancel = () => {
         router.push("/admin/eventos");
       };

  return (
    <div>
      <PageBreadcrumb
        pageTitle="Novo Evento"
        breadcrumbs={[
          { label: "Eventos", href: "/admin/eventos" },
          { label: "Novo", href: "/admin/eventos/novo" }
        ]}
      />
      <div className="space-y-6">
        <ComponentCard title="Criar Novo Evento">
          <EventForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
