-- Criar tabela users_events para associação entre usuários e eventos
CREATE TABLE IF NOT EXISTS public.users_events (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_events_user_id ON public.users_events(user_id);
CREATE INDEX IF NOT EXISTS idx_users_events_event_id ON public.users_events(event_id);
CREATE INDEX IF NOT EXISTS idx_users_events_status ON public.users_events(status);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.users_events ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam suas próprias associações
CREATE POLICY "Users can view their own event associations" ON public.users_events
  FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários criem suas próprias associações
CREATE POLICY "Users can create their own event associations" ON public.users_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem suas próprias associações
CREATE POLICY "Users can update their own event associations" ON public.users_events
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para permitir que usuários deletem suas próprias associações
CREATE POLICY "Users can delete their own event associations" ON public.users_events
  FOR DELETE USING (auth.uid() = user_id);

-- Política para permitir que admins vejam todas as associações
CREATE POLICY "Admins can view all event associations" ON public.users_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_users_events_updated_at
  BEFORE UPDATE ON public.users_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir alguns dados de exemplo (opcional)
-- INSERT INTO public.users_events (user_id, event_id, status) VALUES
-- ('user-uuid-here', 1, 'accepted'),
-- ('user-uuid-here', 2, 'pending');
