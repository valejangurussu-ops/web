# 🔧 Solução para Recursão Infinita nas Políticas RLS

## 🚨 **Problema Identificado**

O erro `"infinite recursion detected in policy for relation \"user_roles\""` ocorre porque as políticas RLS estão fazendo referência circular à própria tabela `user_roles` para verificar se um usuário é admin.

## 🛠️ **Solução Passo a Passo**

### **Passo 1: Limpar Políticas Problemáticas**

Execute o script `cleanup_policies.sql` no SQL Editor do Supabase:

```sql
-- Execute todo o conteúdo do arquivo cleanup_policies.sql
```

### **Passo 2: Aplicar Políticas Corrigidas**

Execute o script `supabase_rls_policies_fixed.sql` no SQL Editor do Supabase:

```sql
-- Execute todo o conteúdo do arquivo supabase_rls_policies_fixed.sql
```

### **Passo 3: Verificar se Funcionou**

Execute esta query para verificar se não há mais recursão:

```sql
-- Verificar políticas criadas
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
```

## 🔍 **O Que Foi Corrigido**

### **Problema Original:**
```sql
-- ❌ PROBLEMÁTICO - Causa recursão infinita
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles  -- ← Recursão aqui!
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### **Solução Implementada:**
```sql
-- ✅ CORRIGIDO - Usa função sem recursão
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_admin());
```

## 🎯 **Principais Mudanças**

### **1. Função `is_admin()` Otimizada**
- ✅ Verifica primeiro na tabela `users` (mais simples)
- ✅ Fallback para `user_roles` apenas se necessário
- ✅ Evita recursão infinita

### **2. Políticas Simplificadas**
- ✅ Usa função `is_admin()` em vez de subqueries
- ✅ Separação clara entre políticas de usuário e admin
- ✅ Sem referências circulares

### **3. Estrutura Hierárquica**
- ✅ Usuários veem apenas seus próprios dados
- ✅ Admins veem todos os dados
- ✅ Verificação de admin centralizada

## 🧪 **Testando a Solução**

### **Teste 1: Verificar se não há recursão**
```sql
-- Deve executar sem erro
SELECT public.is_admin();
```

### **Teste 2: Verificar políticas**
```sql
-- Deve retornar políticas sem recursão
SELECT policyname, qual FROM pg_policies
WHERE tablename = 'user_roles';
```

### **Teste 3: Testar acesso**
```sql
-- Como usuário comum
SELECT * FROM public.user_roles; -- Deve retornar apenas seu próprio role

-- Como admin
SELECT * FROM public.user_roles; -- Deve retornar todos os roles
```

## 🚨 **Se Ainda Houver Problemas**

### **Opção 1: Desabilitar RLS Temporariamente**
```sql
-- Desabilitar RLS na tabela problemática
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Reabilitar após corrigir
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
```

### **Opção 2: Remover Todas as Políticas**
```sql
-- Remover todas as políticas da tabela
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
-- ... (remover todas as políticas)
```

### **Opção 3: Usar Políticas Mais Simples**
```sql
-- Política muito simples (sem verificação de admin)
CREATE POLICY "Simple user roles policy" ON public.user_roles
  FOR ALL USING (auth.uid() = user_id);
```

## 📝 **Prevenção Futura**

### **Regras para Evitar Recursão:**

1. **Nunca referencie a mesma tabela** nas políticas RLS
2. **Use funções auxiliares** para verificações complexas
3. **Teste sempre** as políticas antes de aplicar
4. **Use verificações simples** sempre que possível

### **Estrutura Recomendada:**
```sql
-- ✅ BOM - Usa função auxiliar
CREATE POLICY "Admin policy" ON table_name
  FOR SELECT USING (public.is_admin());

-- ❌ RUIM - Referência direta à mesma tabela
CREATE POLICY "Admin policy" ON table_name
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM table_name WHERE ...)
  );
```

## 🎉 **Resultado Esperado**

Após aplicar a solução:

- ✅ Sem erros de recursão infinita
- ✅ Políticas RLS funcionando corretamente
- ✅ Controle de acesso mantido
- ✅ Performance otimizada

---

**🔧 Execute os scripts na ordem correta e o problema será resolvido!**
