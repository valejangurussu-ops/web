"use client";

import React from "react";

interface UserAvatarProps {
  name?: string;
  email?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showTooltip?: boolean;
}

export default function UserAvatar({
  name,
  email,
  size = "md",
  className = "",
  showTooltip = false
}: UserAvatarProps) {
  // Função para gerar iniciais do nome
  const getInitials = (fullName?: string, email?: string) => {
    if (fullName) {
      return fullName
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }

    if (email) {
      return email.charAt(0).toUpperCase();
    }

    return 'U';
  };

  // Função para gerar cor baseada no nome/email
  const getAvatarColor = (name?: string, email?: string) => {
    const text = name || email || 'user';
    let hash = 0;

    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];

    return colors[Math.abs(hash) % colors.length];
  };

  // Configurações de tamanho
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-16 w-16 text-lg",
    xl: "h-20 w-20 text-xl"
  };

  const initials = getInitials(name, email);
  const avatarColor = getAvatarColor(name, email);
  const displayName = name || email || 'Usuário';

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${avatarColor}
        rounded-full
        flex
        items-center
        justify-center
        text-white
        font-semibold
        shadow-sm
        ${className}
      `}
      title={showTooltip ? displayName : undefined}
    >
      {initials}
    </div>
  );
}

// Componente para avatar com ícone padrão
export function DefaultUserAvatar({
  size = "md",
  className = ""
}: Omit<UserAvatarProps, 'name' | 'email'>) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-11 w-11",
    lg: "h-16 w-16",
    xl: "h-20 w-20"
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-10 w-10"
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        bg-gray-300
        dark:bg-gray-600
        rounded-full
        flex
        items-center
        justify-center
        ${className}
      `}
    >
      <svg
        className={`${iconSizes[size]} text-gray-600 dark:text-gray-400`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    </div>
  );
}
