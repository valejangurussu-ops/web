import { Organization, CreateOrganizationData, UpdateOrganizationData } from "@/types/organization";
import { supabase } from "@/lib/supabase";

export const organizationService = {
  async getAllOrganizations(): Promise<Organization[]> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar organizações:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro no getAllOrganizations:', error);
      throw error;
    }
  },

  async getOrganizationById(id: number): Promise<Organization | undefined> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar organização:', error);
        return undefined;
      }

      return data;
    } catch (error) {
      console.error('Erro no getOrganizationById:', error);
      return undefined;
    }
  },

  async createOrganization(organizationData: CreateOrganizationData): Promise<Organization> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert([organizationData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar organização:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no createOrganization:', error);
      throw error;
    }
  },

  async updateOrganization(id: number, organizationData: UpdateOrganizationData): Promise<Organization | undefined> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update(organizationData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar organização:', error);
        return undefined;
      }

      return data;
    } catch (error) {
      console.error('Erro no updateOrganization:', error);
      return undefined;
    }
  },

  async deleteOrganization(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir organização:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro no deleteOrganization:', error);
      return false;
    }
  },
};
