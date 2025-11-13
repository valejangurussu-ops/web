"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Event } from "@/types/event";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-lg dark:border-gray-800 dark:bg-white/[0.03] hover:border-brand-500/20">
      {/* Event Image */}
      {event.image && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={event.image}
            alt={event.title}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            fill
            unoptimized
          />
          {event.category?.color && (
            <div className="absolute top-3 left-3">
              <span
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: event.category.color }}
              >
                {event.category.label}
              </span>
            </div>
          )}

        </div>
      )}

      {/* Event Content */}
      <div className="p-6">
        {/* Event Title */}
        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
          <Link
            href={`/eventos/${event.id}`}
            className="transition-colors duration-200 hover:text-brand-500"
          >
            {event.title}
          </Link>
        </h3>

        {/* Event Description */}
        {event.description && (
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {event.description}
          </p>
        )}

        <div className="space-y-2 mb-4">
          {event.organization && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>

              <span className="truncate">{event.organization.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Link
            href={`/eventos/${event.id}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 hover:text-brand-700 transition-colors duration-200 dark:bg-brand-900/20 dark:border-brand-800 dark:text-brand-400 dark:hover:bg-brand-900/30"
          >
            Ver Detalhes
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
