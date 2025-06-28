export const COLORS = {
  primary: '#1E40AF',
  secondary: '#7C3AED',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Light theme
  light: {
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    card: '#FFFFFF',
  },
  
  // Dark theme
  dark: {
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    border: '#374151',
    card: '#1F2937',
  },
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

export const SIZES = {
  // Padding & Margin
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  
  // Font sizes
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  h5: 16,
  h6: 14,
  body: 16,
  caption: 12,
  
  // Icon sizes
  iconSmall: 16,
  iconMedium: 24,
  iconLarge: 32,
  
  // Border radius
  radiusSmall: 4,
  radiusMedium: 8,
  radiusLarge: 12,
  radiusXLarge: 16,
};

export const USER_ROLES = {
  TRAINER_PREPARATION_PROJECT_MANAGER: 'TRAINER_PREPARATION_PROJECT_MANAGER',
  PROGRAM_SUPERVISOR: 'PROGRAM_SUPERVISOR',
  DEVELOPMENT_MANAGEMENT_OFFICER: 'DEVELOPMENT_MANAGEMENT_OFFICER',
  PROVINCIAL_DEVELOPMENT_OFFICER: 'PROVINCIAL_DEVELOPMENT_OFFICER',
} as const;

export const TRAINING_REQUEST_STATUS = {
  UNDER_REVIEW: 'under_review',
  CC_APPROVED: 'cc_approved',
  SV_APPROVED: 'sv_approved',
  PM_APPROVED: 'pm_approved',
  TR_ASSIGNED: 'tr_assigned',
  FINAL_APPROVED: 'final_approved',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
} as const;

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
} as const;

export const CHAT_ROOM_TYPES = {
  INDIVIDUAL: 'individual',
  GROUP: 'group',
} as const;

export const NOTIFICATION_TYPES = {
  TRAINING_REQUEST_CREATED: 'training_request_created',
  TRAINING_REQUEST_APPROVED: 'training_request_approved',
  TRAINING_REQUEST_REJECTED: 'training_request_rejected',
  TRAINER_ASSIGNED: 'trainer_assigned',
  NEW_MESSAGE: 'new_message',
  SYSTEM_UPDATE: 'system_update',
} as const;

export const CALENDAR_EVENT_TYPES = {
  TRAINING: 'training',
  MEETING: 'meeting',
  EVENT: 'event',
} as const;

export const PROVINCES = [
  'الرياض',
  'مكة المكرمة',
  'المدينة المنورة',
  'القصيم',
  'المنطقة الشرقية',
  'عسير',
  'تبوك',
  'حائل',
  'الحدود الشمالية',
  'جازان',
  'نجران',
  'الباحة',
  'الجوف',
];

export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_DATA: 'user_data',
  LANGUAGE: 'language',
  THEME: 'theme',
  OFFLINE_ACTIONS: 'offline_actions',
  CACHED_DATA: 'cached_data',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USERS: '/users',
  TRAINING_REQUESTS: '/training-requests',
  CHAT_ROOMS: '/chat-rooms',
  CHAT_MESSAGES: '/chat-messages',
  NOTIFICATIONS: '/notifications',
  ANALYTICS: '/analytics',
} as const;

export const LANGUAGES = {
  ARABIC: 'ar',
  ENGLISH: 'en',
} as const;

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;
