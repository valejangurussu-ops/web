import { supabase } from "@/lib/supabase";

export interface Notification {
  id: string;
  slug: 'new_user' | 'event_subscribe';
  user_id: string;
  meta_data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationData {
  slug: 'new_user' | 'event_subscribe';
  user_id: string;
  meta_data: Record<string, unknown>;
}

class NotificationService {
  // Obter notificações recentes do usuário
  async getRecentNotifications(userId: string, limit: number = 10): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }

    return data || [];
  }

  // Obter contagem de notificações não lidas
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Erro ao contar notificações não lidas:', error);
      return 0;
    }

    return count || 0;
  }

  // Marcar notificações como lidas
  async markAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('mark_notifications_as_read', {
        user_id: userId
      });

      if (error) {
        console.error('Erro ao marcar notificações como lidas:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao marcar notificações como lidas:', error);
      return false;
    }
  }

  // Marcar notificação específica como lida
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return false;
    }

    return true;
  }

  // Criar notificação de inscrição em evento
  async createEventSubscribeNotification(userId: string, eventId: number): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('create_event_subscribe_notification', {
        user_id: userId,
        event_id: eventId
      });

      if (error) {
        console.error('Erro ao criar notificação de inscrição:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar notificação de inscrição:', error);
      return null;
    }
  }

  // Criar notificação personalizada
  async createNotification(notificationData: CreateNotificationData): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar notificação:', error);
      return null;
    }

    return data;
  }

  // Obter todas as notificações do usuário (com paginação)
  async getAllNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ notifications: Notification[]; total: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Erro ao buscar notificações:', error);
      return { notifications: [], total: 0 };
    }

    return {
      notifications: data || [],
      total: count || 0
    };
  }

  // Deletar notificação
  async deleteNotification(notificationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Erro ao deletar notificação:', error);
      return false;
    }

    return true;
  }

  // Deletar todas as notificações lidas do usuário
  async deleteReadNotifications(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('is_read', true);

    if (error) {
      console.error('Erro ao deletar notificações lidas:', error);
      return false;
    }

    return true;
  }
}

export const notificationService = new NotificationService();
