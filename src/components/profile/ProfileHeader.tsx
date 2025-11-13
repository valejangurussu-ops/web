"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import UserAvatar from "../common/UserAvatar";

export function ProfileHeader() {
  const { user } = useAuth();
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="text-center">
        <div className="animate-pulse">
          <div className="mx-auto h-24 w-24 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  const displayName = profile?.name || user?.user_metadata?.full_name || "Usuário";

  return (
    <div className="text-center flex flex-col items-center justify-center">
      {/* Avatar */}
      <div className="mx-auto mb-4">
        <UserAvatar
          name={profile?.name}
          email={user?.email}
          size="xl"
          showTooltip={true}
        />
      </div>

      {/* Name */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {displayName}
      </h1>

      {/* Bio */}
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        &ldquo;Explorando o mundo ao meu redor e buscando aprender sempre.&rdquo;
      </p>
    </div>
  );
}
