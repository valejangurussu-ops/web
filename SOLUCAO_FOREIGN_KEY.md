# 🔗 Solução para Erro de Foreign Key

## 🚨 **Problema Identificado**

O erro `"Could not find a relationship between 'user_roles' and 'users'"` indica que a foreign key entre as tabelas não existe ou não está configurada corretamente.

## 🛠️ **Solução Passo a Passo**

### **Passo 1: Executar Script de Criação**

Execute o script `create_tables_simple.sql` no SQL Editor do Supabase:

```sql
-- Execute todo o conteúdo do arquivo create_tables_simple.sql
```

### **Passo 2: Verificar se Funcionou**

Execute esta query para verificar se as tabelas e foreign keys foram criadas:

```sql
-- Verificar foreign keys
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name = 'user_roles';
```

## 🔍 **O Que o Script Faz**

### **1. Cria Tabelas Necessárias**
```sql
-- Tabela users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### **2. Cria Foreign Key Correta**
```sql
-- Remove foreign key existente se houver
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Cria foreign key correta
ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
```

### **3. Configura RLS Básico**
```sql
-- Habilita RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (sem recursão)
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
```

### **4. Configura Triggers Automáticos**
```sql
-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para criar role automaticamente
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();
```

## 🧪 **Testando a Solução**

### **Teste 1: Verificar Estrutura**
```sql
-- Deve retornar as tabelas criadas
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('users', 'user_roles')
ORDER BY table_name, ordinal_position;
```

### **Teste 2: Verificar Foreign Key**
```sql
-- Deve retornar a foreign key criada
SELECT constraint_name, table_name, column_name, foreign_table_name, foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name = 'user_roles';
```

### **Teste 3: Testar Inserção**
```sql
-- Deve funcionar sem erro
INSERT INTO public.users (id, name, email, role)
VALUES (gen_random_uuid(), 'Test User', 'test@example.com', 'user');

-- Deve funcionar sem erro
INSERT INTO public.user_roles (user_id, role)
VALUES ((SELECT id FROM public.users LIMIT 1), 'user');
```

## 🚨 **Se Ainda Houver Problemas**

### **Opção 1: Verificar se as Tabelas Existem**
```sql
-- Verificar se as tabelas existem
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('users', 'user_roles');
```

### **Opção 2: Recriar Tudo do Zero**
```sql
-- Remover tabelas existentes
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Executar o script novamente
```

### **Opção 3: Verificar Permissões**
```sql
-- Verificar se você tem permissão para criar tabelas
SELECT has_table_privilege('public', 'CREATE');
```

## 🎯 **Resultado Esperado**

Após executar o script:

- ✅ Tabelas `users` e `user_roles` criadas
- ✅ Foreign key `user_roles_user_id_fkey` configurada
- ✅ RLS habilitado com políticas básicas
- ✅ Triggers automáticos funcionando
- ✅ Sem erros de relacionamento

## 📝 **Próximos Passos**

Após resolver o problema da foreign key:

1. **Execute as políticas RLS completas** (se necessário)
2. **Teste o sistema de roles** no frontend
3. **Configure o primeiro admin** usando o script `setup_first_admin.sql`

---

**🔧 Execute o script `create_tables_simple.sql` e o problema da foreign key será resolvido!**
