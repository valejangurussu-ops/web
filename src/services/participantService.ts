import { supabase } from "@/lib/supabase";
import { getUserOrganizationId, canViewParticipants } from "@/utils/permissions";

export interface Participant {
  id: number;
  user_id: string;
  event_id: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

class ParticipantService {
  async getEventParticipants(eventId: number): Promise<Participant[]> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check permissions
      const canView = await canViewParticipants(user.id, eventId);
      if (!canView) {
        throw new Error('You do not have permission to view participants of this event');
      }

      const { data, error } = await supabase
        .from('users_events')
        .select(`
          *,
          user:users(id, name, email)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching participants:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getEventParticipants:', error);
      throw error;
    }
  }

  async getParticipantCount(eventId: number): Promise<number> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check permissions
      const canView = await canViewParticipants(user.id, eventId);
      if (!canView) {
        return 0;
      }

      const { count, error } = await supabase
        .from('users_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      if (error) {
        console.error('Error counting participants:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getParticipantCount:', error);
      return 0;
    }
  }

  async updateParticipantStatus(
    participantId: number,
    status: 'pending' | 'accepted' | 'completed' | 'cancelled'
  ): Promise<Participant> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get participant to check event ownership
      const { data: participant, error: fetchError } = await supabase
        .from('users_events')
        .select('event_id')
        .eq('id', participantId)
        .single();

      if (fetchError || !participant) {
        throw new Error('Participant not found');
      }

      // Check permissions
      const canView = await canViewParticipants(user.id, participant.event_id);
      if (!canView) {
        throw new Error('You do not have permission to update this participant');
      }

      const { data, error } = await supabase
        .from('users_events')
        .update({ status })
        .eq('id', participantId)
        .select(`
          *,
          user:users(id, name, email)
        `)
        .single();

      if (error) {
        console.error('Error updating participant status:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateParticipantStatus:', error);
      throw error;
    }
  }
}

export const participantService = new ParticipantService();
