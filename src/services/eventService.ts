import { Event, CreateEventData, UpdateEventData } from "@/types/event";
import { supabase } from "@/lib/supabase";
import { getUserOrganizationId, isOrganization } from "@/utils/permissions";

export const eventService = {
  async getAllEvents(userId?: string): Promise<Event[]> {
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          organization:organizations(id, name),
          category:event_categories(id, label, color)
        `);

      // Se userId fornecido, verificar se é organization admin e filtrar
      if (userId) {
        const orgId = await getUserOrganizationId(userId);
        if (orgId) {
          // Organization admin: ver apenas eventos da sua organização
          query = query.eq('organization_id', orgId);
        }
        // Super admin: vê todos os eventos (sem filtro)
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar eventos:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro no getAllEvents:', error);
      throw error;
    }
  },

  async getEventById(id: number): Promise<Event | undefined> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organization:organizations(id, name),
          category:event_categories(id, label, color)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar evento:', error);
        return undefined;
      }

      return data;
    } catch (error) {
      console.error('Erro no getEventById:', error);
      return undefined;
    }
  },

  async createEvent(eventData: CreateEventData, userId?: string): Promise<Event> {
    try {
      // Se userId fornecido e for organization admin, garantir que organization_id está definido
      if (userId) {
        const orgId = await getUserOrganizationId(userId);
        if (orgId && !eventData.organization_id) {
          eventData.organization_id = orgId;
        }
      }

      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select(`
          *,
          organization:organizations(id, name),
          category:event_categories(id, label, color)
        `)
        .single();

      if (error) {
        console.error('Erro ao criar evento:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no createEvent:', error);
      throw error;
    }
  },

  async updateEvent(id: number, eventData: UpdateEventData): Promise<Event | undefined> {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar evento:', error);
        return undefined;
      }

      return data;
    } catch (error) {
      console.error('Erro no updateEvent:', error);
      return undefined;
    }
  },

  async deleteEvent(id: number, userId?: string): Promise<boolean> {
    try {
      // Organization users cannot delete events
      if (userId) {
        const userIsOrganization = await isOrganization(userId);
        if (userIsOrganization) {
          console.error('Organization users cannot delete events');
          return false;
        }
      }

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir evento:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro no deleteEvent:', error);
      return false;
    }
  },
};
