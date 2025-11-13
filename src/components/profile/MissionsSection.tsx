"use client";

import React, { useEffect, useState, useCallback } from "react";
import { userEventService, UserEvent } from "@/services/userEventService";
import { useAuth } from "@/contexts/AuthContext";
import { MissionCard } from "./MissionCard";

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

export function MissionsSection() {
  const { user } = useAuth();
  const [userEvents, setUserEvents] = useState<UserEventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

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

  const activeMissions = userEvents.filter(event =>
    event.status === 'accepted' || event.status === 'pending'
  );

  const completedMissions = userEvents.filter(event =>
    event.status === 'completed'
  );

  const currentMissions = activeTab === 'active' ? activeMissions : completedMissions;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Minhas Missões</h2>
          <div className="animate-pulse">
            <div className="flex space-x-4 mb-6">
              <div className="h-8 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Minhas Missões</h2>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'active'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Ativas ({activeMissions.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'completed'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Concluídas ({completedMissions.length})
          </button>
        </div>

        {/* Mission Cards */}
        {currentMissions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">
              {activeTab === 'active'
                ? 'Nenhuma missão ativa no momento'
                : 'Nenhuma missão concluída ainda'
              }
            </p>
            {activeTab === 'active' && (
              <p className="text-gray-400 text-sm mt-2">
                Explore as missões disponíveis na página inicial
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentMissions.map((userEvent) => (
              <MissionCard
                key={userEvent.id}
                userEvent={userEvent}
                onStatusUpdate={loadUserEvents}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
