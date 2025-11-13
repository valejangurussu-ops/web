import { Event, CreateEventData, UpdateEventData } from "@/types/event";
import { supabase } from "@/lib/supabase";

export const eventService = {
  async getAllEvents(): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organization:organizations(id, name),
          category:event_categories(id, label, color)
        `)
        .order('created_at', { ascending: false });

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

  async createEvent(eventData: CreateEventData): Promise<Event> {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
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

  async deleteEvent(id: number): Promise<boolean> {
    try {
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
