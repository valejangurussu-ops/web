-- =============================================
-- POLÍTICAS RLS CORRIGIDAS (SEM RECURSÃO)
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- 1. Remover políticas problemáticas primeiro
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;

-- 2. Criar função para verificar se usuário é admin (sem recursão)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar na tabela users primeiro (mais simples)
  IF EXISTS (
    SELECT 1 FROM public.users
    WHERE id = is_admin.user_id AND role = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;

  -- Fallback: verificar na tabela user_roles
  IF EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = is_admin.user_id AND role = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar políticas simples para user_roles (sem recursão)
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own role" ON public.user_roles
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. Políticas para admins usando a função (sem recursão)
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert any role" ON public.user_roles
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update any role" ON public.user_roles
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete any role" ON public.user_roles
  FOR DELETE USING (public.is_admin());

-- 5. Atualizar tabela users para incluir role
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- 6. Políticas para users (usando função sem recursão)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.users;

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.users
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON public.users
  FOR UPDATE USING (public.is_admin());

-- 7. Políticas para events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;

CREATE POLICY "Events are viewable by everyone" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert events" ON public.events
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update events" ON public.events
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete events" ON public.events
  FOR DELETE USING (public.is_admin());

-- 8. Políticas para users_events
ALTER TABLE public.users_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own events" ON public.users_events;
DROP POLICY IF EXISTS "Users can insert own events" ON public.users_events;
DROP POLICY IF EXISTS "Users can update own events" ON public.users_events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.users_events;

CREATE POLICY "Users can view own events" ON public.users_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user events" ON public.users_events
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Authenticated users can insert own events" ON public.users_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events" ON public.users_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all user events" ON public.users_events
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Users can delete own events" ON public.users_events
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete all user events" ON public.users_events
  FOR DELETE USING (public.is_admin());

-- 9. Políticas para event_categories
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.event_categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.event_categories;

CREATE POLICY "Categories are viewable by everyone" ON public.event_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert categories" ON public.event_categories
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update categories" ON public.event_categories
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete categories" ON public.event_categories
  FOR DELETE USING (public.is_admin());

-- 10. Políticas para organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Organizations are viewable by everyone" ON public.organizations;
DROP POLICY IF EXISTS "Admins can manage organizations" ON public.organizations;

CREATE POLICY "Organizations are viewable by everyone" ON public.organizations
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert organizations" ON public.organizations
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update organizations" ON public.organizations
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete organizations" ON public.organizations
  FOR DELETE USING (public.is_admin());

-- 11. Função para obter role do usuário
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
BEGIN
  -- Verificar na tabela users primeiro
  IF EXISTS (SELECT 1 FROM public.users WHERE id = get_user_role.user_id) THEN
    RETURN (
      SELECT role FROM public.users
      WHERE id = get_user_role.user_id
    );
  END IF;

  -- Fallback: verificar na tabela user_roles
  RETURN (
    SELECT role FROM public.user_roles
    WHERE user_id = get_user_role.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Trigger para criar role padrão quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 13. Trigger para criar role automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- 14. Atualizar função handle_new_user para incluir role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 15. Função para promover usuário a admin (apenas para super admins)
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem promover usuários';
  END IF;

  -- Atualizar role do usuário na tabela users
  UPDATE public.users
  SET role = 'admin', updated_at = NOW()
  WHERE id = target_user_id;

  -- Atualizar role na tabela user_roles também
  UPDATE public.user_roles
  SET role = 'admin', updated_at = NOW()
  WHERE user_id = target_user_id;

  -- Se não existir na user_roles, criar
  IF NOT FOUND THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin');
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Função para rebaixar admin a usuário comum
CREATE OR REPLACE FUNCTION public.demote_to_user(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem rebaixar usuários';
  END IF;

  -- Não permitir rebaixar a si mesmo
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Você não pode rebaixar a si mesmo';
  END IF;

  -- Atualizar role do usuário na tabela users
  UPDATE public.users
  SET role = 'user', updated_at = NOW()
  WHERE id = target_user_id;

  -- Atualizar role na tabela user_roles também
  UPDATE public.user_roles
  SET role = 'user', updated_at = NOW()
  WHERE user_id = target_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. Verificar políticas criadas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================
-- FIM DO SCRIPT
-- =============================================
