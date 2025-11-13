"use client";

import React, { useEffect, useState, useCallback } from "react";
import { userEventService, UserEvent } from "@/services/userEventService";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface UserEventWithDetails extends UserEvent {
  event: {
    id: number;
    title: string;
    image: string | null;
    description: string | null;
    location: string | null;
    created_at: string;
  };
}

interface UpcomingInfo {
  upcomingMissions: UserEventWithDetails[];
  recentActivity: UserEventWithDetails[];
  recommendations: unknown[]; // Pode ser expandido no futuro
}

export function UpcomingInfo() {
  const { user } = useAuth();
  const [upcomingInfo, setUpcomingInfo] = useState<UpcomingInfo>({
    upcomingMissions: [],
    recentActivity: [],
    recommendations: [],
  });
  const [loading, setLoading] = useState(true);

  const loadUpcomingInfo = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const userEvents = await userEventService.getUserEvents(user.id);
      const eventsWithDetails = userEvents as UserEventWithDetails[];

      // Missões próximas (aceitas e pendentes)
      const upcomingMissions = eventsWithDetails.filter(
        event => event.status === 'accepted' || event.status === 'pending'
      );

      // Atividade recente (últimas 5 missões)
      const recentActivity = eventsWithDetails
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      setUpcomingInfo({
        upcomingMissions,
        recentActivity,
        recommendations: [], // Pode ser implementado no futuro
      });
    } catch (error) {
      console.error('Erro ao carregar próximas informações:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadUpcomingInfo();
    }
  }, [user?.id, loadUpcomingInfo]);

  const getStatusColor = (status: UserEvent['status']) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: UserEvent['status']) => {
    switch (status) {
      case 'accepted':
        return 'Aceita';
      case 'completed':
        return 'Concluída';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Próximas Informações</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Próximas Informações</h3>

        <div className="space-y-6">
          {/* Missões Próximas */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <svg className="mr-2 h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Missões em Andamento
            </h4>

            {upcomingInfo.upcomingMissions.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Nenhuma missão em andamento</p>
                <Link
                  href="/"
                  className="mt-2 inline-flex items-center text-sm text-brand-600 hover:text-brand-500"
                >
                  Explorar missões disponíveis
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingInfo.upcomingMissions.map((userEvent) => (
                  <div key={userEvent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-gray-900">{userEvent.event.title}</h5>
                      {userEvent.event.location && (
                        <p className="text-xs text-gray-500 mt-1">📍 {userEvent.event.location}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(userEvent.status)}`}>
                        {getStatusLabel(userEvent.status)}
                      </span>
                      <Link
                        href={`/eventos/${userEvent.event.id}`}
                        className="text-xs text-brand-600 hover:text-brand-500"
                      >
                        Ver
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Atividade Recente */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <svg className="mr-2 h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Atividade Recente
            </h4>

            {upcomingInfo.recentActivity.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Nenhuma atividade recente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingInfo.recentActivity.map((userEvent) => (
                  <div key={userEvent.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-gray-900">{userEvent.event.title}</h5>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(userEvent.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(userEvent.status)}`}>
                        {getStatusLabel(userEvent.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recomendações (placeholder para futuro) */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <svg className="mr-2 h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Próximas Funcionalidades
            </h4>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h5 className="text-sm font-medium text-blue-800">Em breve</h5>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Recomendações personalizadas de missões</li>
                      <li>Notificações de novas missões</li>
                      <li>Calendário de eventos</li>
                      <li>Histórico detalhado de participação</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
