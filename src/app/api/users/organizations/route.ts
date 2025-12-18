import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eydyioxqgbldlydaexfa.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: NextRequest) {
  if (!supabaseServiceKey || supabaseServiceKey === 'your_service_role_key_here' || supabaseServiceKey.trim() === '') {
    return NextResponse.json(
      { error: 'Service Role Key not configured' },
      { status: 500 }
    );
  }

  try {
    const { userIds } = await request.json();

    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: 'userIds array is required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const organizationsMap: Record<string, { id: number; name: string; profile_type?: string }> = {};

    // Para cada userId, buscar organização e profile_type
    for (const userId of userIds) {
      // First, fetch profile_type from users table
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('profile_type')
        .eq('id', userId)
        .single();

      const profileType = userData?.profile_type || 'user';

      // Primeiro, tentar buscar pelo user_id (usuário principal)
      const { data: orgByUserId } = await supabaseAdmin
        .from('organizations')
        .select('id, name')
        .eq('user_id', userId)
        .single();

      if (orgByUserId) {
        organizationsMap[userId] = {
          ...orgByUserId,
          profile_type: profileType
        };
      } else {
        // Se não encontrou, verificar metadata do auth
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
        const organizationId = authUser?.user?.user_metadata?.organization_id;

        if (organizationId) {
          const { data: orgByMetadata } = await supabaseAdmin
            .from('organizations')
            .select('id, name')
            .eq('id', organizationId)
            .single();

          if (orgByMetadata) {
            organizationsMap[userId] = {
              ...orgByMetadata,
              profile_type: profileType
            };
          }
        } else {
          // Even if no organization found, still return profile_type
          organizationsMap[userId] = {
            id: 0,
            name: '',
            profile_type: profileType
          };
        }
      }
    }

    return NextResponse.json({
      success: true,
      organizations: organizationsMap
    });

  } catch (error) {
    console.error('Error fetching user organizations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
