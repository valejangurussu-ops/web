"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { UserEvent } from "@/services/userEventService";
import { userEventService } from "@/services/userEventService";

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

interface MissionCardProps {
  userEvent: UserEventWithDetails;
  onStatusUpdate: () => void;
}

export function MissionCard({ userEvent, onStatusUpdate }: MissionCardProps) {
  const handleStatusUpdate = async (newStatus: UserEvent['status']) => {
    try {
      await userEventService.updateUserEventStatus(userEvent.id, newStatus);
      onStatusUpdate();
    } catch (error) {
      console.error('Erro ao atualizar status da missão:', error);
    }
  };

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

  // Imagens padrão baseadas no tipo de evento
  const getDefaultImage = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('programação') || titleLower.includes('código') || titleLower.includes('bootcamp')) {
      return '/images/cards/card-01.jpg';
    }
    if (titleLower.includes('violão') || titleLower.includes('música') || titleLower.includes('guitar')) {
      return '/images/cards/card-02.jpg';
    }
    if (titleLower.includes('curso') || titleLower.includes('aula') || titleLower.includes('educação')) {
      return '/images/cards/card-03.jpg';
    }
    return '/images/cards/card-01.jpg';
  };

  const eventImage = userEvent.event.image || getDefaultImage(userEvent.event.title);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Image */}
      <div className="relative h-48 w-full">
        <Image
          src={eventImage}
          alt={userEvent.event.title}
          fill
          className="object-cover"
          onError={(e) => {
            // Fallback para imagem padrão se a imagem falhar
            const target = e.target as HTMLImageElement;
            target.src = '/images/cards/card-01.jpg';
          }}
        />
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(userEvent.status)}`}>
            {getStatusLabel(userEvent.status)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {userEvent.event.title}
        </h3>

        {userEvent.event.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {userEvent.event.description}
          </p>
        )}

        {userEvent.event.location && (
          <p className="text-xs text-gray-500 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {userEvent.event.location}
          </p>
        )}

        <div className="flex items-center justify-between">
          <Link
            href={`/eventos/${userEvent.event.id}`}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            Ver detalhes
          </Link>

          {userEvent.status === 'accepted' && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleStatusUpdate('completed')}
                className="text-xs text-green-600 hover:text-green-700 font-medium"
              >
                Concluir
              </button>
              <button
                onClick={() => handleStatusUpdate('cancelled')}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
