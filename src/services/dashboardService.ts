import { supabase } from './supabase';
import { TrainingRequest } from '../types';
import trainingRequestService from './trainingRequestService';

export interface DashboardTraining {
  id: string;
  title: string;
  specialization: string;
  time: string;
  date: string;
  icon: string;
  color: string;
  status: string;
  province: string;
  duration_hours: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'training' | 'meeting' | 'deadline';
  color: string;
}

export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  completedTrainings: number;
  upcomingTrainings: number;
}

class DashboardService {
  /**
   * Get upcoming trainings for the current user
   */
  async getUpcomingTrainings(): Promise<DashboardTraining[]> {
    try {
      const upcomingRequests = await trainingRequestService.getUpcomingTrainings();
      
      return upcomingRequests.map(request => this.transformToTraining(request));
    } catch (error) {
      console.error('Error fetching upcoming trainings:', error);
      return [];
    }
  }

  /**
   * Get calendar events for a specific month
   */
  async getCalendarEvents(year: number, month: number): Promise<Record<string, CalendarEvent[]>> {
    try {
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
      
      const events = await trainingRequestService.getTrainingCalendarEvents(startDate, endDate);
      
      const calendarEvents: Record<string, CalendarEvent[]> = {};
      
      events.forEach(event => {
        const dateKey = event.date;
        if (!calendarEvents[dateKey]) {
          calendarEvents[dateKey] = [];
        }
        
        calendarEvents[dateKey].push({
          id: event.id,
          title: event.title,
          date: event.date,
          type: 'training',
          color: this.getStatusColor(event.status)
        });
      });
      
      return calendarEvents;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return {};
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const [totalRequests, pendingRequests, completedTrainings, upcomingTrainings] = await Promise.all([
        this.getTotalRequestsCount(user.id),
        this.getPendingRequestsCount(user.id),
        this.getCompletedTrainingsCount(user.id),
        this.getUpcomingTrainingsCount(user.id)
      ]);

      return {
        totalRequests,
        pendingRequests,
        completedTrainings,
        upcomingTrainings
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalRequests: 0,
        pendingRequests: 0,
        completedTrainings: 0,
        upcomingTrainings: 0
      };
    }
  }

  /**
   * Get recent notifications
   */
  async getRecentNotifications(limit: number = 5): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      return notifications || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Transform training request to dashboard training
   */
  private transformToTraining(request: TrainingRequest): DashboardTraining {
    const date = new Date(request.requested_date);
    const timeString = this.formatTrainingTime(date, request.duration_hours);
    
    return {
      id: request.id,
      title: request.specialization,
      specialization: request.specialization,
      time: timeString,
      date: request.requested_date,
      icon: this.getTrainingIcon(request.specialization),
      color: this.getStatusColor(request.status),
      status: request.status,
      province: request.province,
      duration_hours: request.duration_hours
    };
  }

  /**
   * Format training time display
   */
  private formatTrainingTime(date: Date, durationHours: number): string {
    const startHour = 10; // Default start time
    const endHour = startHour + durationHours;
    
    return `${startHour}:00 - ${endHour}:00`;
  }

  /**
   * Get icon for training specialization
   */
  private getTrainingIcon(specialization: string): string {
    const iconMap: Record<string, string> = {
      'القيادة': 'people',
      'إدارة المشاريع': 'briefcase',
      'التطوير المهني': 'school',
      'التدريب التقني': 'construct',
      'المهارات الشخصية': 'person',
      'الإدارة': 'business',
      'التسويق': 'trending-up',
      'المالية': 'calculator',
      'الموارد البشرية': 'people-circle',
      'التكنولوجيا': 'laptop'
    };
    
    return iconMap[specialization] || 'book';
  }

  /**
   * Get color for training status
   */
  private getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'under_review': '#FF9500',
      'cc_approved': '#007AFF',
      'sv_approved': '#5856D6',
      'pm_approved': '#00C7BE',
      'tr_assigned': '#34C759',
      'completed': '#32D74B',
      'rejected': '#FF3B30'
    };
    
    return colorMap[status] || '#8E8E93';
  }

  /**
   * Get total requests count for user
   */
  private async getTotalRequestsCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from('training_requests')
      .select('id', { count: 'exact' })
      .eq('requester_id', userId);
    
    return count || 0;
  }

  /**
   * Get pending requests count for user
   */
  private async getPendingRequestsCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from('training_requests')
      .select('id', { count: 'exact' })
      .eq('requester_id', userId)
      .not('status', 'in', '(completed,rejected)');
    
    return count || 0;
  }

  /**
   * Get completed trainings count for user
   */
  private async getCompletedTrainingsCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from('training_requests')
      .select('id', { count: 'exact' })
      .eq('requester_id', userId)
      .eq('status', 'completed');
    
    return count || 0;
  }

  /**
   * Get upcoming trainings count for user
   */
  private async getUpcomingTrainingsCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from('training_requests')
      .select('id', { count: 'exact' })
      .eq('requester_id', userId)
      .in('status', ['pm_approved', 'tr_assigned'])
      .gte('requested_date', new Date().toISOString().split('T')[0]);
    
    return count || 0;
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Get marked dates for calendar
   */
  getMarkedDates(events: Record<string, CalendarEvent[]>): Record<string, any> {
    const markedDates: Record<string, any> = {};
    
    // Mark today
    const today = new Date().toISOString().split('T')[0];
    markedDates[today] = {
      selected: true,
      selectedColor: '#007AFF',
    };
    
    // Mark dates with events
    Object.keys(events).forEach(date => {
      if (date !== today) {
        markedDates[date] = {
          marked: true,
          dotColor: '#34C759',
        };
      } else {
        markedDates[date] = {
          ...markedDates[date],
          marked: true,
          dotColor: '#FFFFFF',
        };
      }
    });
    
    return markedDates;
  }
}

export default new DashboardService();
