# 🔐 Implementação de Controle de Acesso no Supabase

Este documento explica como implementar as mesmas regras de controle de acesso do frontend no Supabase usando Row Level Security (RLS).

## 📋 Passos para Implementação

### 1. **Execute o Script de Políticas RLS**

Execute o arquivo `supabase_rls_policies.sql` no SQL Editor do Supabase:

```sql
-- Execute todo o conteúdo do arquivo supabase_rls_policies.sql
```

### 2. **Configure o Primeiro Admin**

1. Registre-se normalmente no sistema
2. Execute o script `setup_first_admin.sql` no SQL Editor
3. **IMPORTANTE**: Substitua `'SEU_EMAIL_AQUI'` pelo seu email real
4. Execute o script

### 3. **Verifique as Políticas**

Após executar os scripts, verifique se as políticas foram criadas:

```sql
-- Verificar todas as políticas criadas
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

## 🛡️ Políticas Implementadas

### **Tabela `users`**
- ✅ Usuários podem ver apenas seu próprio perfil
- ✅ Admins podem ver todos os perfis
- ✅ Usuários podem atualizar apenas seu próprio perfil
- ✅ Admins podem atualizar todos os perfis

### **Tabela `events`**
- ✅ Todos podem visualizar eventos (público)
- ✅ Apenas admins podem criar/editar/deletar eventos

### **Tabela `users_events`**
- ✅ Usuários podem ver apenas suas próprias associações
- ✅ Admins podem ver todas as associações
- ✅ Usuários autenticados podem aceitar eventos
- ✅ Usuários podem gerenciar apenas suas próprias associações
- ✅ Admins podem gerenciar todas as associações

### **Tabela `event_categories`**
- ✅ Todos podem visualizar categorias (público)
- ✅ Apenas admins podem criar/editar/deletar categorias

### **Tabela `organizations`**
- ✅ Todos podem visualizar organizações (público)
- ✅ Apenas admins podem criar/editar/deletar organizações

### **Tabela `user_roles`**
- ✅ Usuários podem ver apenas seu próprio role
- ✅ Admins podem ver todos os roles
- ✅ Apenas admins podem gerenciar roles

## 🔧 Funções Criadas

### **`is_admin(user_id)`**
Verifica se um usuário é administrador.

### **`get_user_role(user_id)`**
Retorna o role de um usuário.

### **`promote_to_admin(target_user_id)`**
Promove um usuário a administrador (apenas admins podem executar).

### **`demote_to_user(target_user_id)`**
Rebaixa um admin a usuário comum (apenas admins podem executar).

## 🎯 Níveis de Acesso Implementados

### **🔓 Unauthenticated (Não Autenticado)**
- ✅ Pode visualizar eventos públicos
- ❌ Não pode aceitar eventos
- ❌ Não pode acessar perfil
- ❌ Não pode acessar admin

### **👤 User (Usuário Comum)**
- ✅ Pode visualizar eventos públicos
- ✅ Pode aceitar eventos
- ✅ Pode acessar perfil
- ✅ Pode gerenciar suas próprias associações
- ❌ Não pode acessar admin
- ❌ Não pode criar/editar eventos

### **👑 Admin (Administrador)**
- ✅ Pode fazer tudo que usuários comuns fazem
- ✅ Pode acessar área administrativa
- ✅ Pode criar/editar/deletar eventos
- ✅ Pode gerenciar usuários e roles
- ✅ Pode ver todos os dados

## 🧪 Testando as Políticas

### **Teste 1: Usuário Não Autenticado**
```sql
-- Deve retornar apenas eventos públicos
SELECT * FROM public.events;

-- Deve falhar (não autenticado)
SELECT * FROM public.users_events;
```

### **Teste 2: Usuário Comum**
```sql
-- Deve retornar apenas suas próprias associações
SELECT * FROM public.users_events;

-- Deve falhar (não é admin)
INSERT INTO public.events (title, description) VALUES ('Test', 'Test');
```

### **Teste 3: Admin**
```sql
-- Deve retornar todas as associações
SELECT * FROM public.users_events;

-- Deve funcionar (é admin)
INSERT INTO public.events (title, description) VALUES ('Test', 'Test');
```

## 🚨 Troubleshooting

### **Problema: "Acesso negado" mesmo sendo admin**
- Verifique se o role foi definido corretamente na tabela `user_roles`
- Execute: `SELECT * FROM public.user_roles WHERE user_id = 'SEU_USER_ID';`

### **Problema: Políticas não funcionam**
- Verifique se RLS está habilitado: `SELECT * FROM pg_tables WHERE tablename = 'events';`
- Verifique se as políticas existem: `SELECT * FROM pg_policies WHERE tablename = 'events';`

### **Problema: Funções não encontradas**
- Execute novamente o script `supabase_rls_policies.sql`
- Verifique se as funções foram criadas: `SELECT * FROM pg_proc WHERE proname = 'is_admin';`

## 📝 Notas Importantes

1. **Sempre teste as políticas** após implementação
2. **Mantenha backup** das políticas antes de modificações
3. **Monitore logs** do Supabase para erros de RLS
4. **Use o Dashboard do Supabase** para verificar políticas visualmente

## 🔄 Atualizações Futuras

Para adicionar novos níveis de acesso:

1. Adicione o novo role na tabela `user_roles`
2. Crie políticas específicas para o novo role
3. Atualize as funções de verificação
4. Atualize o frontend para reconhecer o novo role

---

**✅ Após implementar, seu sistema terá controle de acesso completo tanto no frontend quanto no backend!**
