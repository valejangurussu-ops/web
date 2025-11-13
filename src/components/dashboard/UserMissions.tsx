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

export function UserMissions() {
  const { user } = useAuth();
  const [userEvents, setUserEvents] = useState<UserEventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'accepted' | 'completed' | 'pending'>('all');

  const loadUserEvents = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const events = await userEventService.getUserEvents(user.id);
      setUserEvents(events as UserEventWithDetails[]);
    } catch (error) {
      console.error('Erro ao carregar missões do usuário:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadUserEvents();
    }
  }, [user?.id, loadUserEvents]);

  const handleStatusUpdate = async (eventId: number, newStatus: UserEvent['status']) => {
    try {
      await userEventService.updateUserEventStatus(eventId, newStatus);
      await loadUserEvents(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao atualizar status da missão:', error);
    }
  };

  const filteredEvents = userEvents.filter(event => {
    if (filter === 'all') return true;
    return event.status === filter;
  });

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
          <h3 className="text-lg font-medium text-gray-900 mb-4">Minhas Missões</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse border rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Minhas Missões</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                filter === 'all'
                  ? 'bg-brand-100 text-brand-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('accepted')}
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                filter === 'accepted'
                  ? 'bg-brand-100 text-brand-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Aceitas
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                filter === 'completed'
                  ? 'bg-brand-100 text-brand-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Concluídas
            </button>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">
              {filter === 'all'
                ? 'Você ainda não participou de nenhuma missão'
                : `Nenhuma missão ${getStatusLabel(filter as UserEvent['status']).toLowerCase()} encontrada`
              }
            </p>
            {filter === 'all' && (
              <Link
                href="/"
                className="mt-2 inline-flex items-center text-sm text-brand-600 hover:text-brand-500"
              >
                Explorar missões disponíveis
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((userEvent) => (
              <div key={userEvent.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {userEvent.event.title}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(userEvent.status)}`}>
                        {getStatusLabel(userEvent.status)}
                      </span>
                    </div>

                    {userEvent.event.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {userEvent.event.description}
                      </p>
                    )}

                    {userEvent.event.location && (
                      <p className="text-xs text-gray-500 mb-2">
                        📍 {userEvent.event.location}
                      </p>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>
                        Aceita em: {new Date(userEvent.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <Link
                      href={`/eventos/${userEvent.event.id}`}
                      className="text-xs text-brand-600 hover:text-brand-500 font-medium"
                    >
                      Ver detalhes
                    </Link>

                    {userEvent.status === 'accepted' && (
                      <button
                        onClick={() => handleStatusUpdate(userEvent.id, 'completed')}
                        className="text-xs text-green-600 hover:text-green-500 font-medium"
                      >
                        Marcar como concluída
                      </button>
                    )}

                    {userEvent.status === 'accepted' && (
                      <button
                        onClick={() => handleStatusUpdate(userEvent.id, 'cancelled')}
                        className="text-xs text-red-600 hover:text-red-500 font-medium"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
