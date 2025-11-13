// import { supabase } from "@/lib/supabase";

export interface AdminStats {
  totalUsers: number;
  totalOrganizations: number;
  totalEvents: number;
  recentEvents: number;
  activeUsers: number;
}

class StatsService {
  async getAdminStats(): Promise<AdminStats> {
    try {
      // Dados mockados para desenvolvimento
      // TODO: Substituir por consultas reais ao Supabase quando a integração estiver funcionando
      const mockStats: AdminStats = {
        totalUsers: 1247,
        totalOrganizations: 23,
        totalEvents: 156,
        recentEvents: 12,
        activeUsers: 892
      };

      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));

      return mockStats;
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
      // Dados mockados para desenvolvimento
      const mockActivities = [
        {
          type: 'user',
          description: 'Novo usuário: Maria Silva',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 horas atrás
        },
        {
          type: 'event',
          description: 'Nova missão: Limpeza da Praia',
          date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 horas atrás
        },
        {
          type: 'organization',
          description: 'Nova organização: Green Earth',
          date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 horas atrás
        },
        {
          type: 'user',
          description: 'Novo usuário: João Santos',
          date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() // 8 horas atrás
        },
        {
          type: 'event',
          description: 'Nova missão: Aula de Programação',
          date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 horas atrás
        }
      ];

      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 400));

      return mockActivities;
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      return [];
    }
  }
}

export const statsService = new StatsService();
