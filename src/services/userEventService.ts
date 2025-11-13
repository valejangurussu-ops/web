import { supabase } from "@/lib/supabase";
import { notificationService } from "./notificationService";

export interface UserEvent {
  id: number;
  user_id: string;
  event_id: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface CreateUserEventData {
  user_id: string;
  event_id: number;
  status?: 'pending' | 'accepted' | 'completed' | 'cancelled';
}

class UserEventService {
  async createUserEvent(data: CreateUserEventData): Promise<UserEvent> {
    // Primeiro, verificar se já existe um registro
    const { data: existingRecord, error: checkError } = await supabase
      .from('users_events')
      .select('id, status')
      .eq('user_id', data.user_id)
      .eq('event_id', data.event_id)
      .maybeSingle();

    if (checkError) {
      console.error('Erro ao verificar registro existente:', checkError);
      throw checkError;
    }

    let userEvent: UserEvent;

    if (existingRecord) {
      // Se já existe, atualizar o registro existente
      const { data: updatedRecord, error: updateError } = await supabase
        .from('users_events')
        .update({
          status: data.status || 'accepted'
        })
        .eq('id', existingRecord.id)
        .select()
        .single();

      if (updateError) {
        console.error('Erro ao atualizar associação usuário-evento:', updateError);
        throw updateError;
      }

      userEvent = updatedRecord;
    } else {
      // Se não existe, criar novo registro
      const { data: newRecord, error: insertError } = await supabase
        .from('users_events')
        .insert([{
          user_id: data.user_id,
          event_id: data.event_id,
          status: data.status || 'accepted'
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao criar associação usuário-evento:', insertError);
        throw insertError;
      }

      userEvent = newRecord;
    }

    // Criar notificação de inscrição em evento apenas se for um novo registro
    if (!existingRecord) {
      try {
        await notificationService.createEventSubscribeNotification(data.user_id, data.event_id);
      } catch (notificationError) {
        console.error('Erro ao criar notificação de inscrição:', notificationError);
        // Não falha a operação principal se a notificação falhar
      }
    }

    return userEvent;
  }

  async getUserEvents(userId: string): Promise<UserEvent[]> {
    const { data, error } = await supabase
      .from('users_events')
      .select(`
        *,
        event:events(
          id,
          title,
          image,
          description,
          location,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar eventos do usuário:', error);
      throw error;
    }

    return data || [];
  }

  async updateUserEventStatus(id: number, status: UserEvent['status']): Promise<UserEvent> {
    const { data, error } = await supabase
      .from('users_events')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar status da associação:', error);
      throw error;
    }

    return data;
  }

  async deleteUserEvent(id: number): Promise<void> {
    const { error } = await supabase
      .from('users_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar associação:', error);
      throw error;
    }
  }

  async checkUserEventExists(userId: string, eventId: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users_events')
        .select('id')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar associação:', error);
        // Se for erro de permissão, retornar false em vez de lançar erro
        if (error.code === 'PGRST301' || error.message?.includes('permission')) {
          console.warn('Permissão negada para consultar users_events, retornando false');
          return false;
        }
        throw error;
      }

      return !!data;
    } catch (err) {
      console.error('Erro inesperado ao verificar associação:', err);
      return false;
    }
  }

  async getUserEventStatus(userId: string, eventId: number): Promise<UserEvent['status'] | null> {
    try {
      const { data, error } = await supabase
        .from('users_events')
        .select('status')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false }) // Pegar o mais recente em caso de duplicatas
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar status da associação:', error);
        // Se for erro de permissão, retornar null em vez de lançar erro
        if (error.code === 'PGRST301' || error.message?.includes('permission')) {
          console.warn('Permissão negada para consultar users_events, retornando null');
          return null;
        }
        throw error;
      }

      return data?.status || null;
    } catch (err) {
      console.error('Erro inesperado ao verificar status:', err);
      return null;
    }
  }

  async cleanupDuplicateUserEvents(userId: string, eventId: number): Promise<void> {
    try {
      // Buscar todos os registros duplicados
      const { data: duplicates, error: fetchError } = await supabase
        .from('users_events')
        .select('id, created_at')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Erro ao buscar duplicatas:', fetchError);
        return;
      }

      // Se há mais de um registro, manter apenas o mais recente
      if (duplicates && duplicates.length > 1) {
        const idsToDelete = duplicates.slice(1).map(record => record.id);

        const { error: deleteError } = await supabase
          .from('users_events')
          .delete()
          .in('id', idsToDelete);

        if (deleteError) {
          console.error('Erro ao remover duplicatas:', deleteError);
        } else {
          console.log(`Removidas ${idsToDelete.length} duplicatas para user ${userId} e event ${eventId}`);
        }
      }
    } catch (err) {
      console.error('Erro inesperado ao limpar duplicatas:', err);
    }
  }
}

export const userEventService = new UserEventService();
