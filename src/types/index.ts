export * from './database';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  province: string | null;
  center: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrainingRequest {
  id: string;
  title: string;
  description: string | null;
  specialization: string;
  province: string;
  requested_date: string;
  duration_hours: number;
  max_participants: number;
  requester_id: string;
  assigned_trainer_id: string | null;
  status: TrainingRequestStatus;
  approval_path: 'standard' | 'pm_alternative';
  created_at: string;
  updated_at: string;
  requester?: User;
  trainer?: User;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'individual' | 'group';
  chat_type?: 'direct' | 'announcement' | 'coordination' | 'training_team' | 'custom';
  participants: string[];
  last_message: string | null;
  last_message_at: string | null;
  is_archived: boolean;
  is_read_only?: boolean;
  allowed_roles?: string[];
  required_specialization?: string;
  auto_created?: boolean;
  created_by?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  training_request_id?: string;
  participantUsers?: User[];
  unreadCount?: number;
  chat_participants?: ChatParticipant[];
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  file_url?: string;
  reply_to?: string;
  is_read: boolean;
  is_deleted?: boolean;
  created_at: string;
  edited_at?: string;
  sender?: User;
}

export interface ChatParticipant {
  id: string;
  chat_room_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'viewer';
  joined_at: string;
  last_read_at: string;
  is_muted: boolean;
  user?: User;
}

export interface ChatRequest {
  id: string;
  requester_id: string;
  target_user_id: string;
  approver_id?: string;
  request_type: 'direct_chat' | 'group_join';
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  approved_at?: string;
  rejected_at?: string;
  requester?: User;
  target_user?: User;
  approver?: User;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  data: any;
  isRead: boolean;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: 'training' | 'meeting' | 'event';
  participants?: string[];
  location?: string;
}

export interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  retryCount: number;
}

export interface AppState {
  isOnline: boolean;
  isLoading: boolean;
  error: string | null;
  language: 'ar' | 'en';
  theme: 'light' | 'dark';
}

export interface AnalyticsData {
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  averageProcessingTime: number;
  provinceStats: Record<string, number>;
  trainerRatings: Record<string, number>;
}

export type UserRole =
  | 'trainee'
  | 'trainer'
  | 'coordinator'
  | 'supervisor'
  | 'manager'
  | 'admin';

export type TrainingRequestStatus =
  | 'under_review'
  | 'cc_approved'
  | 'sv_approved'
  | 'pm_approved'
  | 'tr_assigned'
  | 'final_approved'
  | 'completed'
  | 'rejected';

// Rating and Review Types
export interface TrainingRating {
  id: string;
  training_request_id: string;
  trainer_id: string;
  trainee_id: string;
  overall_rating: number; // 1-5 stars
  content_quality: number; // 1-5 stars
  delivery_quality: number; // 1-5 stars
  interaction_quality: number; // 1-5 stars
  organization_quality: number; // 1-5 stars
  review_text: string | null;
  is_anonymous: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  training_request?: TrainingRequest;
  trainer?: User;
  trainee?: User;
}

export interface TrainerStats {
  trainer_id: string;
  total_ratings: number;
  average_overall_rating: number;
  average_content_quality: number;
  average_delivery_quality: number;
  average_interaction_quality: number;
  average_organization_quality: number;
  total_trainings_completed: number;
  total_hours_trained: number;
  last_updated: string;
}

export interface RatingsSummary {
  total_ratings: number;
  average_rating: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recent_reviews: TrainingRating[];
}
