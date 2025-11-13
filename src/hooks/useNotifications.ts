import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService, Notification } from '@/services/notificationService';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar notificações recentes
  const loadRecentNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const [recentNotifications, count] = await Promise.all([
        notificationService.getRecentNotifications(user.id, 10),
        notificationService.getUnreadCount(user.id)
      ]);

      setNotifications(recentNotifications);
      setUnreadCount(count);
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
      setError('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      const success = await notificationService.markAsRead(user.id);
      if (success) {
        setUnreadCount(0);
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, is_read: true }))
        );
      }
    } catch (err) {
      console.error('Erro ao marcar notificações como lidas:', err);
    }
  }, [user?.id]);

  // Marcar notificação específica como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const success = await notificationService.markNotificationAsRead(notificationId);
      if (success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, is_read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
    }
  }, []);

  // Carregar notificações quando o usuário muda
  useEffect(() => {
    if (user?.id) {
      loadRecentNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
    }
  }, [user?.id, loadRecentNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadRecentNotifications,
    markAllAsRead,
    markAsRead
  };
}
