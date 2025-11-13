"use client";

import React, { useEffect, useState, useCallback } from "react";
import { userEventService } from "@/services/userEventService";
import { useAuth } from "@/contexts/AuthContext";

interface UserStatsData {
  totalMissions: number;
  completedMissions: number;
  pendingMissions: number;
  acceptedMissions: number;
}

export function UserStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStatsData>({
    totalMissions: 0,
    completedMissions: 0,
    pendingMissions: 0,
    acceptedMissions: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadUserStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const userEvents = await userEventService.getUserEvents(user.id);

      const statsData = userEvents.reduce((acc, userEvent) => {
        acc.totalMissions++;

        switch (userEvent.status) {
          case 'completed':
            acc.completedMissions++;
            break;
          case 'pending':
            acc.pendingMissions++;
            break;
          case 'accepted':
            acc.acceptedMissions++;
            break;
        }

        return acc;
      }, {
        totalMissions: 0,
        completedMissions: 0,
        pendingMissions: 0,
        acceptedMissions: 0,
      });

      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadUserStats();
    }
  }, [user?.id, loadUserStats]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Estatísticas</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statItems = [
    {
      label: "Total de Missões",
      value: stats.totalMissions,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Missões Aceitas",
      value: stats.acceptedMissions,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Missões Concluídas",
      value: stats.completedMissions,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      label: "Missões Pendentes",
      value: stats.pendingMissions,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Suas Estatísticas</h3>
        <div className="space-y-4">
          {statItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">{item.label}</span>
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.bgColor} ${item.color}`}>
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {stats.totalMissions === 0 && (
          <div className="mt-6 text-center">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Você ainda não participou de nenhuma missão</p>
            <p className="text-xs text-gray-400 mt-1">Explore as missões disponíveis na página inicial</p>
          </div>
        )}
      </div>
    </div>
  );
}
