import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eydyioxqgbldlydaexfa.supabase.co';
// Service Role Key - get from Supabase Dashboard -> Settings -> API -> service_role key
// IMPORTANT: This key has full admin access. Never expose it in frontend code.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: NextRequest) {
  // Validate environment variables
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    });
    return NextResponse.json(
      { error: 'Server configuration error. Please contact administrator.' },
      { status: 500 }
    );
  }

  // Validate service key - check if it's missing, placeholder, or empty
  if (!supabaseServiceKey || supabaseServiceKey === 'your_service_role_key_here' || supabaseServiceKey.trim() === '') {
    console.error('Service Role Key not configured or is placeholder');
    return NextResponse.json(
      {
        error: 'Service Role Key not configured',
        details: 'The SUPABASE_SERVICE_ROLE_KEY is missing, empty, or still has the placeholder value in .env.local',
        hint: 'Get it from Supabase Dashboard -> Settings -> API -> service_role key (different from anon key)',
        solution: 'Add SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key to .env.local and restart the server'
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, whatsapp, location, location_link, slogan, website } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Generate a random password (organization will need to reset it)
    const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12) + 'A1!';

    // Create auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: randomPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: name,
        profile_type: 'organization'
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json(
        { error: 'Failed to create user account', details: authError.message },
        { status: 500 }
      );
    }

    if (!authUser.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    const userId = authUser.user.id;

    // Create user profile with organization type
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        name: name,
        email: email,
        profile_type: 'organization'
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      // Try to clean up auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: 'Failed to create user profile', details: profileError.message },
        { status: 500 }
      );
    }

    // Create or update user role (admin role for organizations)
    // Use upsert to handle case where role already exists
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'admin'
      }, {
        onConflict: 'user_id'
      });

    if (roleError) {
      console.error('Error creating/updating user role:', roleError);
      // Clean up
      await supabaseAdmin.from('users').delete().eq('id', userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: 'Failed to create user role', details: roleError.message },
        { status: 500 }
      );
    }

    // Create organization record
    const { data: organization, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name,
        whatsapp: whatsapp || null,
        location: location || null,
        location_link: location_link || null,
        slogan: slogan || null,
        website: website || null,
        user_id: userId
      })
      .select()
      .single();

    if (orgError) {
      console.error('Error creating organization:', orgError);
      // Clean up
      await supabaseAdmin.from('user_roles').delete().eq('user_id', userId);
      await supabaseAdmin.from('users').delete().eq('id', userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: 'Failed to create organization', details: orgError.message },
        { status: 500 }
      );
    }

    // Send password reset email (so organization can set their own password)
    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email
    });

    if (resetError) {
      console.error('Error generating password reset link:', resetError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      organization,
      message: 'Organization created successfully. Password reset email sent.'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
