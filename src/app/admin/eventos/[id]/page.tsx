"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Event } from "@/types/event";
import { eventService } from "@/services/eventService";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuthLevel } from "@/hooks/useAuthLevel";
import { useAuth } from "@/contexts/AuthContext";
import { participantService, Participant } from "@/services/participantService";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DetalhesEvento() {
  const router = useRouter();
  const params = useParams();
  const eventId = parseInt(params.id as string);
  const { isOrganization } = useAuthLevel();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(true);

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
        setError("Erro ao carregar detalhes do evento.");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  useEffect(() => {
    const loadParticipants = async () => {
      try {
        setLoadingParticipants(true);
        const data = await participantService.getEventParticipants(eventId);
        setParticipants(data);
      } catch (err) {
        console.error("Erro ao carregar participantes:", err);
        // Não definir erro aqui, apenas logar, pois não é crítico
      } finally {
        setLoadingParticipants(false);
      }
    };

    if (eventId) {
      loadParticipants();
    }
  }, [eventId]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
      accepted: { label: "Aceito", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      completed: { label: "Concluído", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
      cancelled: { label: "Cancelado", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const handleDeleteEvent = async () => {
    if (!event) return;

    if (confirm(`Tem certeza que deseja excluir o evento ${event.title}?`)) {
      try {
        const success = await eventService.deleteEvent(event.id, user?.id);
        if (success) {
          router.push("/admin/eventos");
        } else {
          alert("Erro ao excluir evento.");
        }
      } catch (err) {
        console.error("Erro ao excluir evento:", err);
        alert("Erro ao excluir evento.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-500 dark:text-gray-400">Carregando evento...</div>
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
        pageTitle="Detalhes do Evento"
        breadcrumbs={[
          { label: "Eventos", href: "/admin/eventos" },
          { label: event.title, href: `/admin/eventos/${event.id}` }
        ]}
      />
      <div className="space-y-6">
        {/* Informações Básicas */}
        <ComponentCard title="Informações Básicas">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              {event.image && (
                <div className="w-full h-64 rounded-lg overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    width={400}
                    height={256}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Título
                </label>
                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                  {event.title}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Organização
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {event.organization ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                      {event.organization.name}
                    </span>
                  ) : (
                    <span className="text-gray-400">Não associado</span>
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Categoria
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {event.category ? (
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: event.category.color }}
                    >
                      {event.category.label}
                    </span>
                  ) : (
                    <span className="text-gray-400">Não categorizado</span>
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Local
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {event.location}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Criado em
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(event.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Descrição */}
        <ComponentCard title="Descrição">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        </ComponentCard>

        {/* Instruções */}
        {event.instructions && (
          <ComponentCard title="Instruções">
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {event.instructions}
              </p>
            </div>
          </ComponentCard>
        )}

        {/* Participantes Inscritos */}
        <ComponentCard title={`Usuários Inscritos (${participants.length})`}>
          {loadingParticipants ? (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400">Carregando participantes...</div>
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum usuário inscrito neste evento ainda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Nome
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Email
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Status
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Data de Inscrição
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {participant.user?.name || "Usuário não encontrado"}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {participant.user?.email || "N/A"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        {getStatusBadge(participant.status)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {new Date(participant.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {participants.length > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => router.push(`/admin/eventos/${eventId}/participantes`)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                Ver todos os participantes →
              </button>
            </div>
          )}
        </ComponentCard>

        {/* Ações */}
        <ComponentCard title="Ações">
          <div className="flex space-x-4">
            <button
              onClick={() => router.push(`/admin/eventos/${event.id}/editar`)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Editar
            </button>
            {!isOrganization && (
              <button
                onClick={handleDeleteEvent}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Excluir
              </button>
            )}
            <button
              onClick={() => router.push("/admin/eventos")}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Voltar
            </button>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
