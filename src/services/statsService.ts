import { supabase } from "@/lib/supabase";

export interface AdminStats {
  totalUsers: number;
  totalOrganizations: number;
  totalEvents: number;
  recentEvents: number;
  engagementRate: number;
}

class StatsService {
  async getAdminStats(): Promise<AdminStats> {
    try {
      // Get total users
      const { count: totalUsers, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        console.error('Erro ao contar usuários:', usersError);
      }

      // Get total organizations
      const { count: totalOrganizations, error: orgsError } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true });

      if (orgsError) {
        console.error('Erro ao contar organizações:', orgsError);
      }

      // Get total events
      const { count: totalEvents, error: eventsError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      if (eventsError) {
        console.error('Erro ao contar eventos:', eventsError);
      }

      // Get recent events (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: recentEvents, error: recentEventsError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (recentEventsError) {
        console.error('Erro ao contar eventos recentes:', recentEventsError);
      }

      // Calculate engagement rate (users who accepted at least one mission)
      const { data: usersWithEvents, error: engagementError } = await supabase
        .from('users_events')
        .select('user_id');

      if (engagementError) {
        console.error('Erro ao calcular taxa de engajamento:', engagementError);
      }

      // Get unique user IDs
      const uniqueUserIds = new Set(usersWithEvents?.map(item => item.user_id) || []);
      const engagedUsers = uniqueUserIds.size;
      const totalUsersCount = totalUsers || 0;
      const engagementRate = totalUsersCount > 0
        ? Math.round((engagedUsers / totalUsersCount) * 100)
        : 0;

      return {
        totalUsers: totalUsers || 0,
        totalOrganizations: totalOrganizations || 0,
        totalEvents: totalEvents || 0,
        recentEvents: recentEvents || 0,
        engagementRate
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  async getEventStatsByCategory(): Promise<Array<{category: string, count: number}>> {
    try {
      // Dados mockados para desenvolvimento
      const mockCategoryStats = [
        { category: 'Meio Ambiente', count: 45 },
        { category: 'Educação', count: 32 },
        { category: 'Saúde', count: 28 },
        { category: 'Cultura', count: 23 },
        { category: 'Esporte', count: 18 },
        { category: 'Tecnologia', count: 10 }
      ];

      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 300));

      return mockCategoryStats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas por categoria:', error);
      return [];
    }
  }

  async getRecentActivity(): Promise<Array<{type: string, description: string, date: string}>> {
    try {
      const activities: Array<{type: string, description: string, date: string}> = [];

      // Get recent users (last 10)
      const { data: recentUsers, error: usersError } = await supabase
        .from('users')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!usersError && recentUsers) {
        recentUsers.forEach(user => {
          activities.push({
            type: 'user',
            description: `Novo usuário: ${user.name || 'Sem nome'}`,
            date: user.created_at
          });
        });
      }

      // Get recent events (last 10)
      const { data: recentEvents, error: eventsError } = await supabase
        .from('events')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!eventsError && recentEvents) {
        recentEvents.forEach(event => {
          activities.push({
            type: 'event',
            description: `Nova missão: ${event.title}`,
            date: event.created_at
          });
        });
      }

      // Get recent organizations (last 10)
      const { data: recentOrgs, error: orgsError } = await supabase
        .from('organizations')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!orgsError && recentOrgs) {
        recentOrgs.forEach(org => {
          activities.push({
            type: 'organization',
            description: `Nova organização: ${org.name}`,
            date: org.created_at
          });
        });
      }

      // Sort by date (most recent first) and limit to 10
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return activities.slice(0, 10);
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      return [];
    }
  }
}

export const statsService = new StatsService();
