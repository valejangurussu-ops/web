import React from "react";
import { Metadata } from "next";
import { AuthenticatedOnly } from "@/components/auth/RouteGuard";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { DreamsSection } from "@/components/profile/DreamsSection";
import { MissionsSection } from "@/components/profile/MissionsSection";

export const metadata: Metadata = {
  title: "Meu Perfil | Vale",
  description: "Seu perfil pessoal com sonhos, objetivos e missões",
};

export default function ProfilePage() {
  return (
    <AuthenticatedOnly
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h1>
            <p className="text-gray-600 mb-4">Você precisa estar logado para acessar seu perfil.</p>
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
        {/* Profile Header */}
        <div className="bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ProfileHeader />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Dreams and Objectives Section */}
            <DreamsSection />

            {/* Missions Section */}
            <MissionsSection />
          </div>
        </div>
      </div>
    </AuthenticatedOnly>
  );
}
