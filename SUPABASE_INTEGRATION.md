# Integração Supabase com Migrations

## 📋 Visão Geral

Este projeto agora está integrado com Supabase usando o sistema de migrations para gerenciar o banco de dados de forma versionada e controlada.

## 🚀 Configuração

### 1. Instalação

```bash
# Instalar Supabase CLI localmente
npm install --save-dev supabase

# Inicializar Supabase no projeto
npx supabase init
```

### 2. Estrutura de Arquivos

```
supabase/
├── config.toml          # Configuração do Supabase
├── migrations/          # Migrations do banco de dados
│   └── 20250927023433_create_users_table.sql
└── seed.sql            # Dados de exemplo
```

## 🗄️ Migrations

### Criar Nova Migration

```bash
# Criar nova migration
npx supabase migration new nome_da_migration

# Aplicar migrations
npx supabase db push
```

### Estrutura da Migration

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_nome_da_migration.sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  birth_date DATE NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Authenticated users can view all users" ON public.users
  FOR SELECT USING (auth.role() = 'authenticated');
```

## 🔧 Scripts Disponíveis

```json
{
  "scripts": {
    "db:migrate": "npx supabase db push",
    "db:reset": "npx supabase db reset",
    "db:generate": "npx supabase gen types typescript --local > src/types/supabase.ts",
    "db:studio": "npx supabase studio"
  }
}
```

### Comandos

```bash
# Aplicar migrations
npm run db:migrate

# Resetar banco de dados
npm run db:reset

# Gerar tipos TypeScript
npm run db:generate

# Abrir Supabase Studio
npm run db:studio
```

## 📊 Tabela Users

### Schema

```sql
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  birth_date DATE NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Políticas RLS

- **SELECT**: Usuários autenticados podem ver todos os usuários
- **INSERT**: Usuários autenticados podem inserir usuários
- **UPDATE**: Usuários autenticados podem atualizar usuários
- **DELETE**: Usuários autenticados podem deletar usuários

## 🔄 Integração com Frontend

### Tipos TypeScript

```typescript
// src/types/user.ts
export interface User {
  id: string; // UUID do Supabase
  name: string;
  email: string;
  birthDate: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupabaseUser {
  id: string;
  name: string;
  email: string;
  birth_date: string;
  phone: string;
  created_at: string;
  updated_at: string;
}
```

### Serviço de Usuários

```typescript
// src/services/userService.ts
import { supabase } from "@/lib/supabase";

export const userService = {
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(convertSupabaseUserToUser) || [];
  },

  async createUser(userData: CreateUserData): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(convertUserToSupabase(userData))
      .select()
      .single();

    if (error) throw error;
    return convertSupabaseUserToUser(data);
  }
};
```

## 🚀 Deploy

### 1. Configurar Variáveis de Ambiente

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 2. Aplicar Migrations no Produção

```bash
# Conectar ao projeto remoto
npx supabase link --project-ref seu-project-ref

# Aplicar migrations
npx supabase db push
```

### 3. Verificar Deploy

```bash
# Verificar status
npx supabase status

# Ver logs
npx supabase logs
```

## 🔍 Monitoramento

### Supabase Studio

```bash
# Abrir interface web
npm run db:studio
```

### Logs

```bash
# Ver logs em tempo real
npx supabase logs --follow
```

## 📝 Próximos Passos

1. **Configurar autenticação** com Supabase Auth
2. **Implementar RLS** mais granular
3. **Adicionar validações** no banco de dados
4. **Criar índices** para performance
5. **Implementar backup** automático

## 🐛 Troubleshooting

### Erro de Conexão

```bash
# Verificar status
npx supabase status

# Reiniciar serviços
npx supabase stop
npx supabase start
```

### Migration Falhou

```bash
# Verificar logs
npx supabase logs

# Resetar banco
npx supabase db reset
```

### Tipos Não Atualizados

```bash
# Regenerar tipos
npm run db:generate
```

## 📚 Recursos

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Migrations Guide](https://supabase.com/docs/guides/database/migrations)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
