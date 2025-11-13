-- =============================================
-- SCRIPT PARA CONFIGURAR PRIMEIRO ADMIN
-- Execute este script no SQL Editor do Supabase
-- Substitua 'SEU_EMAIL_AQUI' pelo email do primeiro admin
-- =============================================

-- 1. Substitua 'SEU_EMAIL_AQUI' pelo email do primeiro admin
DO $$
DECLARE
    admin_email TEXT := 'SEU_EMAIL_AQUI'; -- ALTERE AQUI
    admin_user_id UUID;
BEGIN
    -- Buscar ID do usuário pelo email
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = admin_email;

    -- Se usuário não existir, criar
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário com email % não encontrado. Certifique-se de que o usuário já se registrou.', admin_email;
    END IF;

    -- Atualizar role para admin na tabela user_roles
    UPDATE public.user_roles
    SET role = 'admin', updated_at = NOW()
    WHERE user_id = admin_user_id;

    -- Se não existir registro, criar
    IF NOT FOUND THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin');
    END IF;

    -- Atualizar role na tabela users também
    UPDATE public.users
    SET role = 'admin', updated_at = NOW()
    WHERE id = admin_user_id;

    RAISE NOTICE 'Usuário % promovido a administrador com sucesso!', admin_email;
END $$;

-- 2. Verificar se a promoção foi bem-sucedida
SELECT
    u.email,
    ur.role,
    ur.created_at,
    ur.updated_at
FROM public.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin';

-- =============================================
-- FIM DO SCRIPT
-- =============================================
