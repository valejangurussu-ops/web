-- =============================================
-- ADICIONAR COLUNA UPDATED_AT NA TABELA USERS_EVENTS
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- 1. Verificar estrutura atual da tabela users_events
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users_events'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Adicionar coluna updated_at se não existir
ALTER TABLE public.users_events
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Remover trigger existente se houver
DROP TRIGGER IF EXISTS update_users_events_updated_at ON public.users_events;

-- 5. Criar trigger para atualizar updated_at em UPDATE
CREATE TRIGGER update_users_events_updated_at
  BEFORE UPDATE ON public.users_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Atualizar registros existentes com updated_at = created_at
UPDATE public.users_events
SET updated_at = created_at
WHERE updated_at IS NULL;

-- 7. Verificar se a coluna foi adicionada corretamente
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users_events'
  AND table_schema = 'public'
  AND column_name = 'updated_at';

-- 8. Testar o trigger com um update
-- UPDATE public.users_events
-- SET status = 'accepted'
-- WHERE id = (SELECT id FROM public.users_events LIMIT 1);

-- =============================================
-- FIM DO SCRIPT
-- =============================================
