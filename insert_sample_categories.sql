-- =============================================
-- SCRIPT PARA INSERIR CATEGORIAS DE EXEMPLO
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- 1. Inserir categorias de exemplo
INSERT INTO public.event_categories (label, color) VALUES
  ('Tecnologia', '#3B82F6'),
  ('Cultura', '#8B5CF6'),
  ('Esportes', '#10B981'),
  ('Educação', '#F59E0B'),
  ('Saúde', '#EF4444'),
  ('Meio Ambiente', '#22C55E'),
  ('Arte', '#EC4899'),
  ('Música', '#F97316'),
  ('Voluntariado', '#06B6D4'),
  ('Negócios', '#6366F1')
ON CONFLICT (label) DO NOTHING;

-- 2. Verificar se as categorias foram inseridas
SELECT
  id,
  label,
  color,
  created_at
FROM public.event_categories
ORDER BY label;

-- 3. Contar quantas categorias existem
SELECT COUNT(*) as total_categories FROM public.event_categories;

-- =============================================
-- FIM DO SCRIPT
-- =============================================
