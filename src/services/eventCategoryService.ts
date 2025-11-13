import { EventCategory, CreateEventCategoryData, UpdateEventCategoryData } from "@/types/eventCategory";
import { supabase } from "@/lib/supabase";

export const eventCategoryService = {
  async getAllCategories(): Promise<EventCategory[]> {
    try {
      const { data, error } = await supabase
        .from('event_categories')
        .select('*')
        .order('label', { ascending: true });

      if (error) {
        console.error('Erro ao buscar categorias:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro no getAllCategories:', error);
      throw error;
    }
  },

  async getCategoryById(id: number): Promise<EventCategory | undefined> {
    try {
      const { data, error } = await supabase
        .from('event_categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar categoria:', error);
        return undefined;
      }

      return data;
    } catch (error) {
      console.error('Erro no getCategoryById:', error);
      return undefined;
    }
  },

  async createCategory(categoryData: CreateEventCategoryData): Promise<EventCategory> {
    try {
      const { data, error } = await supabase
        .from('event_categories')
        .insert(categoryData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar categoria:', error);

        // Tratar erros específicos
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Já existe uma categoria com este nome');
        } else if (error.code === '23502') { // Not null violation
          throw new Error('Todos os campos são obrigatórios');
        } else {
          throw new Error(error.message || 'Erro ao criar categoria');
        }
      }

      return data;
    } catch (error) {
      console.error('Erro no createCategory:', error);
      throw error;
    }
  },

  async updateCategory(id: number, categoryData: UpdateEventCategoryData): Promise<EventCategory | null> {
    try {
      const { data, error } = await supabase
        .from('event_categories')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar categoria:', error);

        // Tratar erros específicos
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Já existe uma categoria com este nome');
        } else if (error.code === '23502') { // Not null violation
          throw new Error('Todos os campos são obrigatórios');
        } else {
          throw new Error(error.message || 'Erro ao atualizar categoria');
        }
      }

      return data;
    } catch (error) {
      console.error('Erro no updateCategory:', error);
      throw error;
    }
  },

  async deleteCategory(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('event_categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir categoria:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro no deleteCategory:', error);
      return false;
    }
  },
};
