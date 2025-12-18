"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { participantService, Participant } from "@/services/participantService";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function EventParticipants() {
  const params = useParams();
  const router = useRouter();
  const eventId = parseInt(params.id as string);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadParticipants = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await participantService.getEventParticipants(eventId);
        setParticipants(data);
      } catch (err) {
        console.error("Erro ao carregar participantes:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar participantes");
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-500 dark:text-gray-400">Carregando participantes...</div>
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

  return (
    <div>
      <PageBreadcrumb
        pageTitle="Participantes do Evento"
        breadcrumbs={[
          { label: "Eventos", href: "/admin/eventos" },
          { label: `Evento #${eventId}`, href: `/admin/eventos/${eventId}` },
          { label: "Participantes", href: `/admin/eventos/${eventId}/participantes` }
        ]}
      />
      <div className="space-y-6">
        <ComponentCard title={`Participantes (${participants.length})`}>
          {participants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum participante encontrado para este evento.
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
        </ComponentCard>

        <div className="flex justify-end">
          <button
            onClick={() => router.push(`/admin/eventos/${eventId}`)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Voltar ao Evento
          </button>
        </div>
      </div>
    </div>
  );
}
