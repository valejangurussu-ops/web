-- =============================================
-- SCRIPT PARA SISTEMA DE NOTIFICAÇÕES
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- 1. Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL CHECK (slug IN ('new_user', 'event_subscribe')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  meta_data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Adicionar campo de última visualização na tabela users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_notification_view TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Habilitar RLS na tabela de notificações
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para notificações
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all notifications" ON public.notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- 5. Função para criar notificação de novo usuário
CREATE OR REPLACE FUNCTION public.create_new_user_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (slug, user_id, meta_data)
  VALUES (
    'new_user',
    NEW.id,
    jsonb_build_object(
      'user_name', COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      'user_email', NEW.email,
      'welcome_message', 'Bem-vindo ao Vale! Explore nossas missões disponíveis.'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger para notificação de novo usuário
DROP TRIGGER IF EXISTS on_auth_user_created_notification ON auth.users;
CREATE TRIGGER on_auth_user_created_notification
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_new_user_notification();

-- 7. Função para criar notificação de inscrição em evento
CREATE OR REPLACE FUNCTION public.create_event_subscribe_notification(user_id UUID, event_id INTEGER)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
  event_data JSONB;
BEGIN
  -- Buscar dados do evento
  SELECT jsonb_build_object(
    'event_id', id,
    'event_title', title,
    'event_description', description,
    'event_location', location
  ) INTO event_data
  FROM public.events
  WHERE id = event_id;

  -- Criar notificação
  INSERT INTO public.notifications (slug, user_id, meta_data)
  VALUES (
    'event_subscribe',
    user_id,
    jsonb_build_object(
      'event', event_data,
      'message', 'Você se inscreveu em uma nova missão!',
      'action_url', '/eventos/' || event_id
    )
  ) RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Função para marcar notificações como lidas
CREATE OR REPLACE FUNCTION public.mark_notifications_as_read(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Marcar notificações como lidas
  UPDATE public.notifications
  SET is_read = TRUE, updated_at = NOW()
  WHERE user_id = mark_notifications_as_read.user_id AND is_read = FALSE;

  -- Atualizar timestamp de última visualização
  UPDATE public.users
  SET last_notification_view = NOW()
  WHERE id = mark_notifications_as_read.user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Função para obter notificações não lidas
CREATE OR REPLACE FUNCTION public.get_unread_notifications_count(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM public.notifications
  WHERE user_id = get_unread_notifications_count.user_id AND is_read = FALSE;

  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Função para obter notificações recentes
CREATE OR REPLACE FUNCTION public.get_recent_notifications(user_id UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  meta_data JSONB,
  is_read BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id,
    n.slug,
    n.meta_data,
    n.is_read,
    n.created_at
  FROM public.notifications n
  WHERE n.user_id = get_recent_notifications.user_id
  ORDER BY n.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_slug ON public.notifications(slug);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- 12. Verificar estrutura criada
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notifications'
ORDER BY ordinal_position;

-- 13. Verificar políticas criadas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'notifications';

-- =============================================
-- FIM DO SCRIPT
-- =============================================
