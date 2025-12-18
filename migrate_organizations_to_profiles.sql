-- =============================================
-- MIGRATION: Organizations to Profile System
-- Execute this script in Supabase SQL Editor
-- =============================================

-- 1. Add profile_type column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS profile_type TEXT DEFAULT 'user'
CHECK (profile_type IN ('user', 'admin', 'organization'));

-- 2. Update existing admins to have profile_type='admin'
UPDATE public.users
SET profile_type = 'admin'
WHERE id IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
) AND profile_type = 'user';

-- 3. Add user_id column to organizations table
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Make user_id unique (one organization per user)
CREATE UNIQUE INDEX IF NOT EXISTS organizations_user_id_unique
ON public.organizations(user_id)
WHERE user_id IS NOT NULL;

-- 5. Create helper function to check if user is organization
CREATE OR REPLACE FUNCTION public.is_organization(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = is_organization.user_id
    AND profile_type = 'organization'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create helper function to get user's organization_id
CREATE OR REPLACE FUNCTION public.get_user_organization_id(user_id UUID DEFAULT auth.uid())
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT id FROM public.organizations
    WHERE organizations.user_id = get_user_organization_id.user_id
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Update RLS policies for events
-- Organizations can view their own events
DROP POLICY IF EXISTS "Organizations can view own events" ON public.events;
CREATE POLICY "Organizations can view own events" ON public.events
  FOR SELECT USING (
    organization_id = public.get_user_organization_id() OR
    public.is_admin()
  );

-- Organizations can create events (auto-assigned to their org)
DROP POLICY IF EXISTS "Organizations can create events" ON public.events;
CREATE POLICY "Organizations can create events" ON public.events
  FOR INSERT WITH CHECK (
    (public.is_organization() AND organization_id = public.get_user_organization_id()) OR
    public.is_admin()
  );

-- Organizations can update their own events
DROP POLICY IF EXISTS "Organizations can update own events" ON public.events;
CREATE POLICY "Organizations can update own events" ON public.events
  FOR UPDATE USING (
    (public.is_organization() AND organization_id = public.get_user_organization_id()) OR
    public.is_admin()
  );

-- Organizations can delete their own events
DROP POLICY IF EXISTS "Organizations can delete own events" ON public.events;
CREATE POLICY "Organizations can delete own events" ON public.events
  FOR DELETE USING (
    (public.is_organization() AND organization_id = public.get_user_organization_id()) OR
    public.is_admin()
  );

-- 8. Update RLS policies for users_events (participants)
-- Organizations can view participants of their events
DROP POLICY IF EXISTS "Organizations can view own event participants" ON public.users_events;
CREATE POLICY "Organizations can view own event participants" ON public.users_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = users_events.event_id
      AND (
        events.organization_id = public.get_user_organization_id() OR
        public.is_admin()
      )
    )
  );

-- 9. Update RLS policies for organizations
-- Organizations can view their own organization
DROP POLICY IF EXISTS "Organizations can view own organization" ON public.organizations;
CREATE POLICY "Organizations can view own organization" ON public.organizations
  FOR SELECT USING (
    user_id = auth.uid() OR
    public.is_admin()
  );

-- Organizations can update their own organization
DROP POLICY IF EXISTS "Organizations can update own organization" ON public.organizations;
CREATE POLICY "Organizations can update own organization" ON public.organizations
  FOR UPDATE USING (
    user_id = auth.uid() OR
    public.is_admin()
  );

-- 10. Update is_admin function to exclude organizations
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is admin but NOT organization
  RETURN EXISTS (
    SELECT 1 FROM public.users u
    LEFT JOIN public.user_roles ur ON ur.user_id = u.id
    WHERE u.id = is_admin.user_id
    AND (
      (ur.role = 'admin' AND u.profile_type = 'admin') OR
      (u.profile_type = 'admin')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create function to check if user is full admin (not organization)
CREATE OR REPLACE FUNCTION public.is_full_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users u
    LEFT JOIN public.user_roles ur ON ur.user_id = u.id
    WHERE u.id = is_full_admin.user_id
    AND (
      (ur.role = 'admin' AND u.profile_type = 'admin') OR
      (u.profile_type = 'admin')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
