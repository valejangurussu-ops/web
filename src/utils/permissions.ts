import { supabase } from "@/lib/supabase";

export interface UserProfile {
  id: string;
  profile_type?: 'user' | 'admin' | 'organization';
}

export interface UserRole {
  role: 'user' | 'admin';
}

/**
 * Get user profile with profile_type
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, profile_type')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

/**
 * Get user's organization ID and profile_type in a single request
 * Uses the unified API endpoint to fetch both pieces of information
 */
export async function getUserOrganizationAndProfile(
  userId: string
): Promise<{ organizationId: number | null; profileType: string | null }> {
  try {
    // Use the unified API that returns both organization and profile_type
    const response = await fetch('/api/users/organizations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userIds: [userId] }),
    });

    if (response.ok) {
      const result = await response.json();
      const org = result.organizations?.[userId];
      if (org) {
        return {
          organizationId: org.id || null,
          profileType: org.profile_type || null
        };
      }
    }

    // Fallback: try direct lookup if API fails
    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      // Still need to get profile_type from users table as fallback
      const { data: userData } = await supabase
        .from('users')
        .select('profile_type')
        .eq('id', userId)
        .single();

      return {
        organizationId: data.id,
        profileType: userData?.profile_type || null
      };
    }

    return { organizationId: null, profileType: null };
  } catch (error) {
    console.error('Error in getUserOrganizationAndProfile:', error);
    return { organizationId: null, profileType: null };
  }
}

/**
 * Get user's organization ID
 * Checks both direct user_id link and metadata for additional users
 * @deprecated Consider using getUserOrganizationAndProfile for better performance
 */
export async function getUserOrganizationId(userId: string): Promise<number | null> {
  try {
    // First, try direct lookup (main organization user)
    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      return data.id;
    }

    // If not found, try via API for additional users (with metadata)
    // This is a fallback for users created via /api/organizations/[id]/users
    try {
      const response = await fetch('/api/users/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds: [userId] }),
      });

      if (response.ok) {
        const result = await response.json();
        const org = result.organizations?.[userId];
        if (org) {
          return org.id;
        }
      }
    } catch (apiError) {
      // Silently fail - this is expected if not in browser context
      console.log('API call failed (expected in some contexts):', apiError);
    }

    return null;
  } catch (error) {
    console.error('Error in getUserOrganizationId:', error);
    return null;
  }
}

/**
 * Check if user can create events
 */
export async function canCreateEvent(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  if (!profile) return false;

  // Full admins and organizations can create events
  return profile.profile_type === 'admin' || profile.profile_type === 'organization';
}

/**
 * Check if user can view participants of an event
 */
export async function canViewParticipants(userId: string, eventId: number): Promise<boolean> {
  const profile = await getUserProfile(userId);
  if (!profile) return false;

  // Full admins can view all participants
  if (profile.profile_type === 'admin') {
    return true;
  }

  // Organizations can only view participants of their events
  if (profile.profile_type === 'organization') {
    const orgId = await getUserOrganizationId(userId);
    if (!orgId) return false;

    try {
      const { data, error } = await supabase
        .from('events')
        .select('organization_id')
        .eq('id', eventId)
        .single();

      if (error || !data) return false;
      return data.organization_id === orgId;
    } catch (error) {
      console.error('Error checking event ownership:', error);
      return false;
    }
  }

  return false;
}

/**
 * Check if user can access admin panel
 */
export async function canAccessAdmin(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  if (!profile) return false;

  // Both full admins and organizations can access admin
  return profile.profile_type === 'admin' || profile.profile_type === 'organization';
}

/**
 * Check if user is a full admin (not organization)
 */
export async function isFullAdmin(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  if (!profile) return false;
  return profile.profile_type === 'admin';
}

/**
 * Check if user is an organization
 */
export async function isOrganization(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  if (!profile) return false;
  return profile.profile_type === 'organization';
}

/**
 * Check if user can edit/delete an event
 */
export async function canManageEvent(userId: string, eventId: number): Promise<boolean> {
  const profile = await getUserProfile(userId);
  if (!profile) return false;

  // Full admins can manage any event
  if (profile.profile_type === 'admin') {
    return true;
  }

  // Organizations can only manage their own events
  if (profile.profile_type === 'organization') {
    const orgId = await getUserOrganizationId(userId);
    if (!orgId) return false;

    try {
      const { data, error } = await supabase
        .from('events')
        .select('organization_id')
        .eq('id', eventId)
        .single();

      if (error || !data) return false;
      return data.organization_id === orgId;
    } catch (error) {
      console.error('Error checking event ownership:', error);
      return false;
    }
  }

  return false;
}
