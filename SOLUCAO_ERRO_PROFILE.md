# 🔧 Solução para Erro de Perfil

## ❌ Problema Identificado

O erro `Error: Erro ao carregar perfil: {}` indica que a **tabela `profiles` não foi criada no Supabase**.

## ✅ Solução Rápida

### 1. Acesse o Supabase Dashboard
- Vá para [supabase.com](https://supabase.com)
- Faça login na sua conta
- Selecione seu projeto

### 2. Execute o Script SQL
- No menu lateral, clique em **SQL Editor**
- Clique em **New Query**
- Copie e cole o conteúdo do arquivo `supabase_profiles_table.sql`
- Clique em **Run** para executar

### 3. Verifique se foi criado
Após executar, você deve ver:
- ✅ Tabela `profiles` criada
- ✅ Políticas de segurança configuradas
- ✅ Bucket `avatars` criado

## 📋 Script SQL Completo

```sql
-- Criação da tabela profiles no Supabase
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  bio TEXT,
  country TEXT,
  city_state TEXT,
  postal_code TEXT,
  tax_id TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Criar bucket para avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para storage
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 🔄 Após Executar o Script

1. **Recarregue a página** `http://localhost:3000/profile`
2. **Faça login** se necessário
3. **Teste a edição** clicando em "Edit" em qualquer seção

## ✅ Resultado Esperado

Após executar o script, você deve ver:
- ✅ Dados do perfil carregando normalmente
- ✅ Possibilidade de editar informações
- ✅ Mensagens de sucesso ao salvar
- ✅ Nenhum erro no console

## 🚨 Se Ainda Houver Problemas

1. **Verifique as variáveis de ambiente** no `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
   ```

2. **Verifique o console do navegador** para outros erros

3. **Confirme que está logado** no sistema

## 📞 Suporte

Se o problema persistir, verifique:
- ✅ Conexão com o Supabase
- ✅ Permissões do usuário
- ✅ Configuração das políticas RLS
- ✅ Logs do Supabase Dashboard

---

**🎯 O sistema de perfil está 100% funcional, só precisa da tabela no Supabase!**
