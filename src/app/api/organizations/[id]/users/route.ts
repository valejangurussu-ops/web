import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eydyioxqgbldlydaexfa.supabase.co';
// Service Role Key - get from Supabase Dashboard -> Settings -> API -> service_role key
// IMPORTANT: This key has full admin access. Never expose it in frontend code.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    console.log('POST /api/organizations/[id]/users - Starting');

    // Handle params as Promise (Next.js 15) or object (Next.js 14)
    const resolvedParams = params instanceof Promise ? await params : params;
    console.log('Resolved params:', resolvedParams);

    const organizationId = parseInt(resolvedParams.id);
    console.log('Organization ID:', organizationId);

    if (isNaN(organizationId)) {
      return NextResponse.json(
        { error: 'Invalid organization ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);
    const { name, email, password } = body;

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

    console.log('Supabase admin client created');

    // Test the service key by trying a simple operation
    // If key is invalid, this will fail with "Invalid API key" error

    // Verify organization exists
    console.log('Checking organization exists...');
    const { data: organization, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('id, user_id')
      .eq('id', organizationId)
      .single();

    if (orgError) {
      console.error('Organization error:', orgError);

      // Check if it's an authentication error (invalid key)
      if (orgError.message?.includes('Invalid API key') || orgError.message?.includes('JWT')) {
        return NextResponse.json(
          {
            error: 'Invalid Service Role Key',
            details: 'The SUPABASE_SERVICE_ROLE_KEY in .env.local is incorrect or invalid',
            hint: 'Verify the service_role key from Supabase Dashboard -> Settings -> API',
            solution: 'Update SUPABASE_SERVICE_ROLE_KEY in .env.local with the correct key and restart the server'
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Organization not found', details: orgError.message },
        { status: 404 }
      );
    }

    if (!organization) {
      console.error('Organization not found');
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    console.log('Organization found:', organization);

    // Use provided password or generate a random one
    const userPassword = password && password.trim()
      ? password.trim()
      : Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12) + 'A1!';

    // Validate password if provided
    if (password && password.trim() && password.trim().length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    console.log('Creating auth user...');

    // Create auth user with organization link in metadata
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: userPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: name,
        profile_type: 'organization',
        organization_id: organizationId
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

    // Wait a bit for trigger to potentially create the profile
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if profile was created by trigger
    const { data: existingProfile } = await supabaseAdmin
      .from('users')
      .select('id, profile_type')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      // Profile exists, update it with organization type
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          profile_type: 'organization'
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return NextResponse.json(
          { error: 'Failed to update user profile', details: updateError.message },
          { status: 500 }
        );
      }
    } else {
      // Profile doesn't exist, create it
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
    }

    // Create or update user role (admin role for organization users)
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

    // User metadata already set during creation, no need to update

    // Get the created user
    const { data: createdUser, error: userFetchError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, profile_type, created_at')
      .eq('id', userId)
      .single();

    if (userFetchError) {
      console.error('Error fetching created user:', userFetchError);
      // Still return success since user was created, just couldn't fetch it
      // Return basic user info
      return NextResponse.json({
        success: true,
        user: {
          id: userId,
          name,
          email,
          profile_type: 'organization',
          created_at: new Date().toISOString()
        },
        message: 'Organization user created successfully.'
      });
    }

    return NextResponse.json({
      success: true,
      user: createdUser,
      message: 'Organization user created successfully.'
    });

  } catch (error) {
    console.error('Unexpected error in POST:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error stack:', errorStack);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Validate environment variables
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('GET: Missing environment variables');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // Validate service key - check if it's missing, placeholder, or empty
  if (!supabaseServiceKey || supabaseServiceKey === 'your_service_role_key_here' || supabaseServiceKey.trim() === '') {
    console.error('GET: Service Role Key not configured or is placeholder');
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
    console.log('GET /api/organizations/[id]/users - Starting');

    // Handle params as Promise (Next.js 15) or object (Next.js 14)
    const resolvedParams = params instanceof Promise ? await params : params;
    console.log('GET: Resolved params:', resolvedParams);

    const organizationId = parseInt(resolvedParams.id);
    console.log('GET: Organization ID:', organizationId);

    if (isNaN(organizationId)) {
      return NextResponse.json(
        { error: 'Invalid organization ID' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get organization's main user
    console.log('GET: Querying organization with ID:', organizationId);

    // First, let's check if we can query organizations at all
    const { data: allOrgs, error: listError } = await supabaseAdmin
      .from('organizations')
      .select('id, name')
      .limit(10);

    if (listError) {
      console.error('GET: Error listing organizations:', listError);

      // Check if it's an authentication error (invalid key)
      if (listError.message?.includes('Invalid API key') || listError.message?.includes('JWT')) {
        return NextResponse.json(
          {
            error: 'Invalid Service Role Key',
            details: 'The SUPABASE_SERVICE_ROLE_KEY in .env.local is incorrect or invalid',
            hint: 'Verify the service_role key from Supabase Dashboard -> Settings -> API',
            solution: 'Update SUPABASE_SERVICE_ROLE_KEY in .env.local with the correct key and restart the server'
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to query organizations', details: listError.message, code: listError.code },
        { status: 500 }
      );
    }

    console.log('GET: Available organizations:', allOrgs);

    const { data: organization, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('id, user_id')
      .eq('id', organizationId)
      .single();

    if (orgError) {
      console.error('GET: Organization query error:', orgError);
      console.error('GET: Error code:', orgError.code);
      console.error('GET: Error message:', orgError.message);
      console.error('GET: Error details:', orgError.details);
      return NextResponse.json(
        {
          error: 'Organization not found',
          details: orgError.message,
          code: orgError.code,
          availableOrganizations: allOrgs?.map(org => ({ id: org.id, name: org.name }))
        },
        { status: 404 }
      );
    }

    if (!organization) {
      console.error('GET: Organization not found for ID:', organizationId);
      return NextResponse.json(
        {
          error: 'Organization not found',
          availableOrganizations: allOrgs?.map(org => ({ id: org.id, name: org.name }))
        },
        { status: 404 }
      );
    }

    console.log('GET: Organization found:', organization);

    // Get organization's main user ID
    const mainUserId = organization.user_id;

    // Get all users of type organization
    // For now, we'll get users with profile_type='organization'
    // In the future, we should add organization_id column to users table
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, profile_type, created_at')
      .eq('profile_type', 'organization')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching organization users:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Get users that belong to this organization
    // Check if user's auth metadata has organization_id matching this organization
    // Also include the main user
    interface OrganizationUser {
      id: string;
      name: string;
      email: string;
      profile_type?: string;
      created_at: string;
    }
    const organizationUsers: OrganizationUser[] = [];

    // Get all auth users in batch to check metadata
    const userIds = (users || []).map(u => u.id);
    const authUsersMap = new Map();

    // Fetch auth users in parallel (limited batch)
    const batchSize = 10;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      const authPromises = batch.map(id =>
        supabaseAdmin.auth.admin.getUserById(id).then(result => ({ id, data: result.data }))
      );
      const results = await Promise.all(authPromises);
      results.forEach(({ id, data }) => {
        if (data?.user) {
          authUsersMap.set(id, data.user);
        }
      });
    }

    // Filter users by organization_id in metadata
    for (const user of users || []) {
      // Always include main user
      if (user.id === mainUserId) {
        organizationUsers.push(user);
        continue;
      }

      // Check auth metadata for organization_id
      const authUser = authUsersMap.get(user.id);
      if (authUser?.user_metadata?.organization_id === organizationId) {
        organizationUsers.push(user);
      }
    }

    return NextResponse.json({
      success: true,
      users: organizationUsers
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
