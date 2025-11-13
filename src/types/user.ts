export interface User {
  id: string; // UUID do Supabase
  name: string;
  email: string;
  birthDate: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

// Tipo para dados do Supabase (snake_case)
export interface SupabaseUser {
  id: string;
  name: string;
  email: string;
  birth_date: string;
  phone: string;
  created_at: string;
  updated_at: string;
  auth_user_id?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  birthDate: string;
  phone: string;
}

export type UpdateUserData = Partial<UserFormData>;
