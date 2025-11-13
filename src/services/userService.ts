import { User, UserFormData, SupabaseUser } from "@/types/user";
import { supabase } from "@/lib/supabase";

// Função para converter dados do Supabase para o formato do frontend
const convertSupabaseUserToUser = (supabaseUser: SupabaseUser): User => {
  return {
    id: supabaseUser.id,
    name: supabaseUser.name,
    email: supabaseUser.email,
    birthDate: supabaseUser.birth_date,
    phone: supabaseUser.phone,
    createdAt: supabaseUser.created_at,
    updatedAt: supabaseUser.updated_at,
  };
};


export const userService = {
  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          birth_date,
          phone,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        throw error;
      }

      return data?.map(convertSupabaseUserToUser) || [];
    } catch (error) {
      console.error('Erro no getAllUsers:', error);
      throw error;
    }
  },

  async getUserById(id: string): Promise<User | undefined> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar usuário:', error);
        return undefined;
      }

      return convertSupabaseUserToUser(data);
    } catch (error) {
      console.error('Erro no getUserById:', error);
      return undefined;
    }
  },


  async updateUser(id: string, userData: Partial<UserFormData>): Promise<User | undefined> {
    try {
      // Atualizar perfil diretamente na tabela users
      const { data, error } = await supabase
        .from('users')
        .update({
          name: userData.name,
          birth_date: userData.birthDate,
          phone: userData.phone
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        return undefined;
      }

      return convertSupabaseUserToUser(data);
    } catch (error) {
      console.error('Erro no updateUser:', error);
      return undefined;
    }
  },

  async deleteUser(): Promise<boolean> {
    try {
      // Para usuários de autenticação, não permitimos deletar via interface
      // Apenas administradores podem fazer isso
      console.warn('Deleção de usuários de autenticação não permitida via interface');
      return false;
    } catch (error) {
      console.error('Erro no deleteUser:', error);
      return false;
    }
  },

  // Função para obter usuário atual
  async getCurrentUser(): Promise<User | undefined> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return undefined;
      }

      return await this.getUserById(user.id);
    } catch (error) {
      console.error('Erro no getCurrentUser:', error);
      return undefined;
    }
  },
};
