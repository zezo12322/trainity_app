import { supabase } from './supabase';
import { TrainingRequest } from '../types';
import workflowNotificationService from './workflowNotificationService';

export interface CreateTrainingRequestData {
  specialization: string;
  province: string;
  requested_date: string;
  duration_hours: number;
  max_participants: number;
  notes?: string;
}

export interface UpdateTrainingRequestData {
  specialization?: string;
  province?: string;
  requested_date?: string;
  duration_hours?: number;
  max_participants?: number;
  notes?: string;
  status?: string;
  assigned_trainer_id?: string;
}

class TrainingRequestService {
  async createRequest(data: CreateTrainingRequestData): Promise<TrainingRequest> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user profile to determine role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error('User profile not found');

      // Determine approval path based on user role
      const approvalPath = profile.role === 'TRAINER_PREPARATION_PROJECT_MANAGER' ? 'pm_alternative' : 'standard';
      const initialStatus = profile.role === 'TRAINER_PREPARATION_PROJECT_MANAGER' ? 'sv_approved' : 'under_review';

      const requestData = {
        ...data,
        title: `طلب تدريب - ${data.specialization}`,
        description: data.notes || null,
        requester_id: user.id,
        status: initialStatus,
        approval_path: approvalPath,
      };

      const { data: request, error } = await supabase
        .from('training_requests')
        .insert(requestData)
        .select(`
          *,
          requester:profiles!training_requests_requester_id_fkey(*),
          trainer:profiles!training_requests_assigned_trainer_id_fkey(*)
        `)
        .single();

      if (error) throw error;

      const transformedRequest = this.transformRequest(request);

      // Send notification for new request
      try {
        await workflowNotificationService.sendNewTrainingRequestNotification(
          transformedRequest.id,
          transformedRequest.title,
          transformedRequest.specialization,
          profile.full_name || 'Unknown User',
          approvalPath
        );
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Don't throw here - request creation should succeed even if notification fails
      }

      return transformedRequest;
    } catch (error) {
      console.error('Error creating training request:', error);
      throw error;
    }
  }

  async getMyRequests(): Promise<TrainingRequest[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: requests, error } = await supabase
        .from('training_requests')
        .select('*')
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return requests.map(this.transformRequest);
    } catch (error) {
      console.error('Error fetching my requests:', error);
      throw error;
    }
  }

  async getAllRequests(): Promise<TrainingRequest[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || !['coordinator', 'supervisor', 'manager', 'admin'].includes(profile.role)) {
        throw new Error('Insufficient permissions');
      }

      const { data: requests, error } = await supabase
        .from('training_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return requests.map(this.transformRequest);
    } catch (error) {
      console.error('Error fetching all requests:', error);
      throw error;
    }
  }

  async updateRequest(id: string, data: UpdateTrainingRequestData): Promise<TrainingRequest> {
    try {
      const { data: request, error } = await supabase
        .from('training_requests')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      return this.transformRequest(request);
    } catch (error) {
      console.error('Error updating training request:', error);
      throw error;
    }
  }

  async deleteRequest(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('training_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting training request:', error);
      throw error;
    }
  }

  async assignTrainer(requestId: string, trainerId: string): Promise<TrainingRequest> {
    return this.updateRequest(requestId, {
      assigned_trainer_id: trainerId,
      status: 'tr_assigned'
    });
  }

  async updateStatus(requestId: string, status: string): Promise<TrainingRequest> {
    try {
      // Get current request to check old status and approval path
      const currentRequest = await this.getRequestById(requestId);
      if (!currentRequest) throw new Error('Request not found');

      const oldStatus = currentRequest.status;
      const updatedRequest = await this.updateRequest(requestId, { status });

      // Send status change notification
      try {
        await workflowNotificationService.sendStatusChangeNotification(
          updatedRequest.id,
          updatedRequest.title,
          status,
          oldStatus,
          updatedRequest.approval_path,
          updatedRequest.specialization,
          'Unknown User' // We could fetch requester name if needed
        );
      } catch (notificationError) {
        console.error('Error sending status change notification:', notificationError);
        // Don't throw here - status update should succeed even if notification fails
      }

      return updatedRequest;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  }

  async getRequestById(id: string): Promise<TrainingRequest | null> {
    try {
      const { data: request, error } = await supabase
        .from('training_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return this.transformRequest(request);
    } catch (error) {
      console.error('Error fetching request by ID:', error);
      throw error;
    }
  }

  async getTrainerRequests(): Promise<TrainingRequest[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: requests, error } = await supabase
        .from('training_requests')
        .select('*')
        .eq('assigned_trainer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return requests.map(this.transformRequest);
    } catch (error) {
      console.error('Error fetching trainer requests:', error);
      throw error;
    }
  }

  private transformRequest(request: any): TrainingRequest {
    return {
      id: request.id,
      title: request.title,
      description: request.description,
      specialization: request.specialization,
      province: request.province,
      requested_date: request.requested_date,
      duration_hours: request.duration_hours,
      max_participants: request.max_participants,
      requester_id: request.requester_id,
      assigned_trainer_id: request.assigned_trainer_id,
      status: request.status,
      approval_path: request.approval_path || 'standard',
      created_at: request.created_at,
      updated_at: request.updated_at,
      // We'll load user details separately if needed
      requester: undefined,
      trainer: undefined,
    };
  }

  /**
   * Get upcoming trainings for dashboard
   */
  async getUpcomingTrainings(): Promise<TrainingRequest[]> {
    try {
      const { data, error } = await supabase
        .from('training_requests')
        .select(`
          *,
          requester:profiles!training_requests_requester_id_fkey(full_name, role),
          trainer:profiles!training_requests_assigned_trainer_id_fkey(full_name, role)
        `)
        .in('status', ['pm_approved', 'tr_assigned'])
        .gte('requested_date', new Date().toISOString().split('T')[0])
        .order('requested_date', { ascending: true })
        .limit(10);

      if (error) throw error;

      return data?.map(this.transformRequest) || [];
    } catch (error) {
      console.error('Error fetching upcoming trainings:', error);
      throw error;
    }
  }

  /**
   * Get training calendar events
   */
  async getTrainingCalendarEvents(startDate: string, endDate: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('training_requests')
        .select(`
          id,
          title,
          specialization,
          requested_date,
          duration_hours,
          status,
          province
        `)
        .in('status', ['pm_approved', 'tr_assigned', 'completed'])
        .gte('requested_date', startDate)
        .lte('requested_date', endDate)
        .order('requested_date', { ascending: true });

      if (error) throw error;

      return data?.map(training => ({
        id: training.id,
        title: training.specialization,
        date: training.requested_date,
        duration: training.duration_hours,
        status: training.status,
        province: training.province
      })) || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }



  // Real-time subscriptions
  subscribeToMyRequests(callback: (requests: TrainingRequest[]) => void): () => void {
    const subscription = supabase
      .channel('my_training_requests')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'training_requests'
        },
        () => {
          this.getMyRequests().then(callback).catch(console.error);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  subscribeToAllRequests(callback: (requests: TrainingRequest[]) => void): () => void {
    const subscription = supabase
      .channel('all_training_requests')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'training_requests'
        },
        () => {
          this.getAllRequests().then(callback).catch(console.error);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}

export default new TrainingRequestService();
