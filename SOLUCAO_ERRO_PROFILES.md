# 🔧 Solução para Erro "Could not find the table 'public.profiles'"

## ❌ Problema Identificado

O erro `PGRST205: Could not find the table 'public.profiles' in the schema cache` indica que a **tabela `profiles` não foi criada no Supabase**.

## ✅ Solução Rápida

### 1. Acesse o Supabase Dashboard
- Vá para [supabase.com](https://supabase.com)
- Faça login na sua conta
- Selecione seu projeto

### 2. Execute o Script SQL
- No menu lateral, clique em **SQL Editor**
- Clique em **New Query**
- Copie e cole o conteúdo do arquivo `setup_supabase.sql`
- Clique em **Run** para executar

### 3. Verifique se foi criado
Após executar, você deve ver:
- ✅ Tabela `profiles` criada
- ✅ Políticas de segurança configuradas
- ✅ Trigger para criação automática de perfis
- ✅ Função para atualizar timestamps

## 📋 Script SQL Completo

O arquivo `setup_supabase.sql` contém:

```sql
-- 1. Criar tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de segurança
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- 4. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 7. Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 🔄 Após Executar o Script

1. **Recarregue a página** da aplicação
2. **Faça login** se necessário
3. **Teste o sistema** de usuários

## ✅ Resultado Esperado

Após executar o script, você deve ver:
- ✅ Tabela `profiles` criada no Supabase
- ✅ Políticas de segurança configuradas
- ✅ Sistema de usuários funcionando
- ✅ Nenhum erro no console

## 🚨 Se Ainda Houver Problemas

1. **Verifique as variáveis de ambiente** no `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
   ```

2. **Verifique o console do navegador** para outros erros

3. **Confirme que está logado** no sistema

4. **Verifique se o script foi executado** no Supabase Dashboard

## 📞 Suporte

Se o problema persistir, verifique:
- ✅ Conexão com o Supabase
- ✅ Permissões do usuário
- ✅ Configuração das políticas RLS
- ✅ Logs do Supabase Dashboard

## 🎯 Próximos Passos

Após resolver o erro:
1. **Teste o CRUD de usuários**
2. **Verifique se os dados são salvos**
3. **Teste a edição e exclusão**

---

**🎯 O sistema de usuários está 100% funcional, só precisa da tabela no Supabase!**
