"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export type AuthLevel = 'unauthenticated' | 'user' | 'admin' | 'organization';

interface UserProfileData {
  role: 'user' | 'admin';
  profile_type: 'user' | 'admin' | 'organization';
}

export function useAuthLevel() {
  const { user, loading } = useAuth();
  const [userProfileData, setUserProfileData] = useState<UserProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserProfileData(null);
      setProfileLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setProfileLoading(true);
        // Fetch both role from user_roles and profile_type from users
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        const { data: profileTypeData, error: profileTypeError } = await supabase
          .from('users')
          .select('profile_type')
          .eq('id', user.id)
          .single();

        if (roleError && roleError.code !== 'PGRST116') {
          console.error('Erro ao buscar role do usuário:', roleError);
        }
        if (profileTypeError && profileTypeError.code !== 'PGRST116') {
          console.error('Erro ao buscar profile_type do usuário:', profileTypeError);
        }

        setUserProfileData({
          role: roleData?.role || 'user',
          profile_type: profileTypeData?.profile_type || 'user',
        });

      } catch (error) {
        console.error('Erro ao buscar dados do perfil do usuário:', error);
        setUserProfileData({ role: 'user', profile_type: 'user' }); // Default
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const getAuthLevel = (): AuthLevel => {
    if (loading && !user) return 'unauthenticated';
    if (!user) return 'unauthenticated';
    if (profileLoading) return 'user'; // Assume user while loading

    if (userProfileData?.profile_type === 'organization') return 'organization';
    if (userProfileData?.profile_type === 'admin') return 'admin';
    return 'user';
  };

  const authLevel = getAuthLevel();

  const canAccess = (requiredLevel: AuthLevel): boolean => {
    const levelHierarchy: Record<AuthLevel, number> = {
      'unauthenticated': 0,
      'user': 1,
      'organization': 2, // Organization has higher access than regular user
      'admin': 3         // Super admin has highest access
    };

    return levelHierarchy[authLevel] >= levelHierarchy[requiredLevel];
  };

  const isSuperAdmin = userProfileData?.profile_type === 'admin';
  const isOrganization = userProfileData?.profile_type === 'organization';
  const isAdmin = isSuperAdmin || isOrganization; // Both can access admin panel
  const isUser = authLevel === 'user';
  const isUnauthenticated = authLevel === 'unauthenticated';
  const isAuthenticated = authLevel !== 'unauthenticated';

  return {
    authLevel,
    canAccess,
    isAdmin,
    isSuperAdmin,
    isOrganization,
    isUser,
    isUnauthenticated,
    isAuthenticated,
    loading: loading || profileLoading,
    profileType: userProfileData?.profile_type,
    userRole: userProfileData?.role
  };
}
