-- =============================================
-- SCRIPT DE LIMPEZA DAS POLÍTICAS PROBLEMÁTICAS
-- Execute este script PRIMEIRO no SQL Editor do Supabase
-- =============================================

-- 1. Remover todas as políticas da tabela user_roles
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete any role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update own role" ON public.user_roles;

-- 2. Remover políticas problemáticas de outras tabelas
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can view all user events" ON public.users_events;
DROP POLICY IF EXISTS "Admins can update all user events" ON public.users_events;
DROP POLICY IF EXISTS "Admins can delete all user events" ON public.users_events;

-- 3. Remover funções problemáticas
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.get_user_role(UUID);
DROP FUNCTION IF EXISTS public.promote_to_admin(UUID);
DROP FUNCTION IF EXISTS public.demote_to_user(UUID);

-- 4. Verificar se as políticas foram removidas
SELECT
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'user_roles';

-- 5. Verificar se as funções foram removidas
SELECT
  proname,
  proargnames
FROM pg_proc
WHERE proname IN ('is_admin', 'get_user_role', 'promote_to_admin', 'demote_to_user');

-- =============================================
-- FIM DO SCRIPT DE LIMPEZA
-- =============================================
