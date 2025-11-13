"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export type AuthLevel = 'unauthenticated' | 'user' | 'admin';

interface UserRole {
  role: 'user' | 'admin';
}

export function useAuthLevel() {
  const { user, loading } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserRole(null);
      setRoleLoading(false);
      return;
    }

    const fetchUserRole = async () => {
      try {
        setRoleLoading(true);
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Erro ao buscar role do usuário:', error);
          setUserRole({ role: 'user' }); // Default para user
        } else {
          setUserRole(data || { role: 'user' });
        }
      } catch (error) {
        console.error('Erro ao buscar role do usuário:', error);
        setUserRole({ role: 'user' }); // Default para user
      } finally {
        setRoleLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const getAuthLevel = (): AuthLevel => {
    // Se ainda está carregando e não temos user, retorna unauthenticated
    if (loading && !user) return 'unauthenticated';

    // Se não tem user, retorna unauthenticated
    if (!user) return 'unauthenticated';

    // Se tem user mas ainda está carregando role, assume user por padrão
    if (roleLoading) return 'user';

    return userRole?.role === 'admin' ? 'admin' : 'user';
  };

  const authLevel = getAuthLevel();

  const canAccess = (requiredLevel: AuthLevel): boolean => {
    const levelHierarchy: Record<AuthLevel, number> = {
      'unauthenticated': 0,
      'user': 1,
      'admin': 2
    };

    return levelHierarchy[authLevel] >= levelHierarchy[requiredLevel];
  };

  const isAdmin = authLevel === 'admin';
  const isUser = authLevel === 'user';
  const isUnauthenticated = authLevel === 'unauthenticated';
  const isAuthenticated = authLevel !== 'unauthenticated';

  return {
    authLevel,
    canAccess,
    isAdmin,
    isUser,
    isUnauthenticated,
    isAuthenticated,
    loading: loading || roleLoading,
    userRole
  };
}
