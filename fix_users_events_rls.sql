-- =============================================
-- CORREÇÃO ESPECÍFICA PARA USERS_EVENTS RLS
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- 1. Verificar se a tabela users_events existe e tem RLS habilitado
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'users_events';

-- 2. Verificar políticas existentes para users_events
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users_events';

-- 3. Remover todas as políticas existentes para users_events
DROP POLICY IF EXISTS "Users can view own events" ON public.users_events;
DROP POLICY IF EXISTS "Admins can view all user events" ON public.users_events;
DROP POLICY IF EXISTS "Authenticated users can insert own events" ON public.users_events;
DROP POLICY IF EXISTS "Users can update own events" ON public.users_events;
DROP POLICY IF EXISTS "Admins can update all user events" ON public.users_events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.users_events;
DROP POLICY IF EXISTS "Admins can delete all user events" ON public.users_events;

-- 4. Garantir que RLS está habilitado
ALTER TABLE public.users_events ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas mais simples e diretas
-- Política para SELECT: usuários podem ver seus próprios eventos
CREATE POLICY "users_events_select_own" ON public.users_events
  FOR SELECT USING (auth.uid() = user_id);

-- Política para SELECT: admins podem ver todos os eventos
CREATE POLICY "users_events_select_admin" ON public.users_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política para INSERT: usuários autenticados podem inserir seus próprios eventos
CREATE POLICY "users_events_insert_own" ON public.users_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE: usuários podem atualizar seus próprios eventos
CREATE POLICY "users_events_update_own" ON public.users_events
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para UPDATE: admins podem atualizar qualquer evento
CREATE POLICY "users_events_update_admin" ON public.users_events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política para DELETE: usuários podem deletar seus próprios eventos
CREATE POLICY "users_events_delete_own" ON public.users_events
  FOR DELETE USING (auth.uid() = user_id);

-- Política para DELETE: admins podem deletar qualquer evento
CREATE POLICY "users_events_delete_admin" ON public.users_events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Verificar se as políticas foram criadas corretamente
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users_events'
ORDER BY policyname;

-- 7. Testar se a consulta funciona (substitua pelos IDs reais)
-- SELECT status FROM public.users_events
-- WHERE user_id = 'beaa55ff-6fb9-4f69-a917-de3ae41ff303'
-- AND event_id = 11;

-- =============================================
-- FIM DO SCRIPT
-- =============================================
