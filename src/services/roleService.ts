import { supabase } from "@/lib/supabase";

export interface UserRole {
  id: string;
  user_id: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface CreateUserRoleData {
  user_id: string;
  role: 'user' | 'admin';
}

class RoleService {
  // Obter role de um usuário
  async getUserRole(userId: string): Promise<UserRole | null> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar role do usuário:', error);
      return null;
    }

    return data;
  }

  // Obter role do usuário atual
  async getCurrentUserRole(): Promise<UserRole | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    return this.getUserRole(user.id);
  }

  // Verificar se usuário é admin
  async isAdmin(userId?: string): Promise<boolean> {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!targetUserId) return false;

    const userRole = await this.getUserRole(targetUserId);
    return userRole?.role === 'admin';
  }

  // Promover usuário a admin (apenas admins podem fazer isso)
  async promoteToAdmin(targetUserId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('promote_to_admin', {
        target_user_id: targetUserId
      });

      if (error) {
        console.error('Erro ao promover usuário a admin:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao promover usuário a admin:', error);
      return false;
    }
  }

  // Rebaixar admin a usuário comum (apenas admins podem fazer isso)
  async demoteToUser(targetUserId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('demote_to_user', {
        target_user_id: targetUserId
      });

      if (error) {
        console.error('Erro ao rebaixar usuário:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao rebaixar usuário:', error);
      return false;
    }
  }

  // Listar todos os usuários com seus roles (apenas admins)
  async getAllUsersWithRoles(): Promise<(UserRole & {
    user: {
      name: string;
      email: string;
      profile_type?: string;
    };
    organization?: {
      id: number;
      name: string;
    } | null;
  })[]> {
    // Primeiro, buscar todos os usuários
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, profile_type')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Erro ao buscar usuários:', usersError);
      return [];
    }

    // Buscar todas as organizações de uma vez para melhor performance
    const organizationUserIds = (allUsers || [])
      .filter(user => user.profile_type === 'organization')
      .map(user => user.id);

    const organizationsMap: Record<string, { id: number; name: string }> = {};

    if (organizationUserIds.length > 0) {
      // Buscar organizações pelo user_id (usuários principais)
      const { data: orgsByUserId, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, user_id')
        .in('user_id', organizationUserIds);

      if (orgError) {
        console.error('Erro ao buscar organizações:', orgError);
      } else if (orgsByUserId) {
        orgsByUserId.forEach(org => {
          if (org.user_id) {
            organizationsMap[org.user_id] = { id: org.id, name: org.name };
          }
        });
      }
    }

    // Para cada usuário, buscar a role e organização
    const usersWithRolesAndOrgs = await Promise.all(
      (allUsers || []).map(async (user) => {
        // Buscar role do usuário
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // Buscar organização do mapa (se for do tipo organization)
        const organization = user.profile_type === 'organization'
          ? (organizationsMap[user.id] || null)
          : null;

        // Se não tem role, criar um objeto padrão
        const userRole: UserRole = roleData || {
          id: '',
          user_id: user.id,
          role: 'user' as const,
          created_at: '',
          updated_at: ''
        };

        return {
          ...userRole,
          user: {
            name: user.name,
            email: user.email,
            profile_type: user.profile_type || 'user'
          },
          organization
        };
      })
    );

    return usersWithRolesAndOrgs;
  }

  // Criar role para usuário (apenas admins)
  async createUserRole(data: CreateUserRoleData): Promise<UserRole | null> {
    const { data: userRole, error } = await supabase
      .from('user_roles')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar role do usuário:', error);
      return null;
    }

    return userRole;
  }

  // Atualizar role do usuário (apenas admins)
  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<boolean> {
    try {
      if (role === 'admin') {
        return await this.promoteToAdmin(userId);
      } else {
        return await this.demoteToUser(userId);
      }
    } catch (error) {
      console.error('Erro ao atualizar role do usuário:', error);
      return false;
    }
  }

  // Verificar se usuário atual pode gerenciar roles
  async canManageRoles(): Promise<boolean> {
    return await this.isAdmin();
  }
}

export const roleService = new RoleService();
