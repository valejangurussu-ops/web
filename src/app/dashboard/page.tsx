import React from "react";
import { Metadata } from "next";
import { AuthenticatedOnly } from "@/components/auth/RouteGuard";
import { UserMissions } from "@/components/dashboard/UserMissions";
import { UpcomingInfo } from "@/components/dashboard/UpcomingInfo";
import { UserStats } from "@/components/dashboard/UserStats";

export const metadata: Metadata = {
  title: "Dashboard | Vale",
  description: "Seu painel pessoal com missões e próximas informações",
};

export default function DashboardPage() {
  return (
    <AuthenticatedOnly
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h1>
            <p className="text-gray-600 mb-4">Você precisa estar logado para acessar o dashboard.</p>
            <a
              href="/signin"
              className="inline-block bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors"
            >
              Fazer Login
            </a>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Meu <span className="text-brand-500">Dashboard</span>
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Acompanhe suas missões e próximas informações
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats Section */}
            <div className="lg:col-span-1">
              <UserStats />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* User Missions */}
              <UserMissions />

              {/* Upcoming Information */}
              <UpcomingInfo />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedOnly>
  );
}
