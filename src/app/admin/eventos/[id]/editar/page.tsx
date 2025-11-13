"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EventForm from "@/components/forms/EventForm";
import { Event, EventFormData } from "@/types/event";
import { eventService } from "@/services/eventService";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function EditarEvento() {
  const router = useRouter();
  const params = useParams();
  const eventId = parseInt(params.id as string);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const eventData = await eventService.getEventById(eventId);
        if (eventData) {
          setEvent(eventData);
        } else {
          setError("Evento não encontrado");
        }
      } catch (err) {
        console.error("Erro ao carregar evento:", err);
        setError("Erro ao carregar detalhes do evento para edição.");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const handleSubmit = async (eventData: EventFormData) => {
         try {
           setIsSubmitting(true);
           await eventService.updateEvent(eventId, eventData);
           router.push(`/admin/eventos/${eventId}`);
         } catch (error) {
           console.error("Erro ao atualizar evento:", error);
           throw error;
         } finally {
           setIsSubmitting(false);
         }
       };

       const handleCancel = () => {
         router.push(`/admin/eventos/${eventId}`);
       };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-500 dark:text-gray-400">Carregando evento para edição...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-red-500 dark:text-red-400">{error}</div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div>
      <PageBreadcrumb
        pageTitle="Editar Evento"
             breadcrumbs={[
               { label: "Eventos", href: "/admin/eventos" },
               { label: event.title, href: `/admin/eventos/${event.id}` },
               { label: "Editar", href: `/admin/eventos/${event.id}/editar` },
             ]}
      />
      <div className="space-y-6">
        <ComponentCard title={`Editar ${event.title}`}>
          <EventForm
            event={event}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
