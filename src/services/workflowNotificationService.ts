import { supabase } from './supabase';

/**
 * Workflow Notification Service
 * Handles training workflow notifications with support for alternative approval paths
 */

interface NotificationData {
  title: string;
  body: string;
  type: string;
  data?: any;
}

class WorkflowNotificationService {
  /**
   * Send notification for new training request
   */
  async sendNewTrainingRequestNotification(
    requestId: string,
    requestTitle: string,
    specialization: string,
    requesterName: string,
    approvalPath: 'standard' | 'pm_alternative'
  ): Promise<void> {
    try {
      console.log(`📝 Sending new training request notification for: ${requestTitle} (Path: ${approvalPath})`);

      let targetUserIds: string[] = [];

      if (approvalPath === 'pm_alternative') {
        // In alternative path, send notifications to supervisors directly
        const { data: supervisors, error } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'PROGRAM_SUPERVISOR');

        if (error) {
          console.error('❌ Failed to get supervisors:', error);
          return;
        }

        targetUserIds = supervisors?.map(sv => sv.id) || [];
      } else {
        // Standard path - send to Development Management Officers first
        const { data: ccUsers, error } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'DEVELOPMENT_MANAGEMENT_OFFICER');

        if (error) {
          console.error('❌ Failed to get CC users:', error);
          return;
        }

        targetUserIds = ccUsers?.map(cc => cc.id) || [];
      }

      if (targetUserIds.length === 0) {
        console.warn('⚠️ No target users found for notification');
        return;
      }

      const notification: NotificationData = {
        title: 'طلب تدريب جديد',
        body: `طلب تدريب جديد في ${specialization} من ${requesterName}`,
        type: 'training_request_new',
        data: {
          requestId,
          requestTitle,
          specialization,
          requesterName,
          approvalPath
        }
      };

      await this.sendNotificationToUsers(targetUserIds, notification);
      console.log(`✅ New training request notification sent to ${targetUserIds.length} users`);

    } catch (error) {
      console.error('❌ Failed to send new training request notification:', error);
    }
  }

  /**
   * Send notification for status change
   */
  async sendStatusChangeNotification(
    requestId: string,
    requestTitle: string,
    newStatus: string,
    oldStatus: string,
    approvalPath: 'standard' | 'pm_alternative',
    specialization?: string,
    requesterName?: string
  ): Promise<void> {
    try {
      console.log(`🔄 Sending status change notification: ${oldStatus} → ${newStatus} (Path: ${approvalPath})`);

      const targetUsers = await this.getTargetUsersForStatus(newStatus, approvalPath);

      if (targetUsers.length === 0) {
        console.warn('⚠️ No target users found for status change notification');
        return;
      }

      const notification = this.createStatusChangeNotification(
        requestId,
        requestTitle,
        newStatus,
        oldStatus,
        approvalPath,
        specialization,
        requesterName
      );

      if (notification) {
        await this.sendNotificationToUsers(targetUsers, notification);
        console.log(`✅ Status change notification sent to ${targetUsers.length} users`);
      }

    } catch (error) {
      console.error('❌ Failed to send status change notification:', error);
    }
  }

  /**
   * Get target users for a specific status based on approval path
   */
  private async getTargetUsersForStatus(
    status: string,
    approvalPath: 'standard' | 'pm_alternative'
  ): Promise<string[]> {
    let targetRole: string | null = null;

    if (approvalPath === 'pm_alternative') {
      // Alternative path workflow
      switch (status) {
        case 'sv_approved':
          targetRole = 'PROGRAM_SUPERVISOR';
          break;
        case 'pm_approved':
          targetRole = 'TRAINER'; // Notify trainers that they can apply
          break;
        default:
          return [];
      }
    } else {
      // Standard path workflow
      switch (status) {
        case 'under_review':
          targetRole = 'DEVELOPMENT_MANAGEMENT_OFFICER';
          break;
        case 'cc_approved':
          targetRole = 'PROGRAM_SUPERVISOR';
          break;
        case 'sv_approved':
          targetRole = 'TRAINER_PREPARATION_PROJECT_MANAGER';
          break;
        case 'pm_approved':
          targetRole = 'TRAINER'; // Notify trainers that they can apply
          break;
        default:
          return [];
      }
    }

    if (!targetRole) return [];

    const { data: users, error } = await supabase
      .from('users')
      .select('id')
      .eq('role', targetRole);

    if (error) {
      console.error(`❌ Failed to get users with role ${targetRole}:`, error);
      return [];
    }

    return users?.map(user => user.id) || [];
  }

  /**
   * Create status change notification
   */
  private createStatusChangeNotification(
    requestId: string,
    requestTitle: string,
    newStatus: string,
    oldStatus: string,
    approvalPath: 'standard' | 'pm_alternative',
    specialization?: string,
    requesterName?: string
  ): NotificationData | null {
    const statusMessages = {
      'standard': {
        'cc_approved': 'تمت موافقة مسؤول إدارة التنمية - في انتظار موافقة المشرف',
        'sv_approved': 'تمت موافقة المشرف - في انتظار موافقة مسؤول المشروع',
        'pm_approved': 'تمت الموافقة النهائية - يمكن للمدربين التقديم الآن',
        'tr_assigned': 'تم تعيين مدرب للطلب',
        'final_approved': 'تمت الموافقة النهائية على الطلب',
        'rejected': 'تم رفض الطلب'
      },
      'pm_alternative': {
        'sv_approved': 'طلب من مسؤول المشروع - في انتظار موافقة المشرف',
        'pm_approved': 'تمت الموافقة النهائية - يمكن للمدربين التقديم الآن',
        'tr_assigned': 'تم تعيين مدرب للطلب',
        'final_approved': 'تمت الموافقة النهائية على الطلب',
        'rejected': 'تم رفض الطلب'
      }
    };

    const message = statusMessages[approvalPath]?.[newStatus as keyof typeof statusMessages[typeof approvalPath]];
    
    if (!message) return null;

    return {
      title: 'تحديث حالة طلب التدريب',
      body: `${requestTitle}: ${message}`,
      type: 'training_request_status_change',
      data: {
        requestId,
        requestTitle,
        newStatus,
        oldStatus,
        approvalPath,
        specialization,
        requesterName
      }
    };
  }

  /**
   * Send notification to multiple users
   */
  private async sendNotificationToUsers(
    userIds: string[],
    notification: NotificationData
  ): Promise<void> {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title: notification.title,
      body: notification.body,
      type: notification.type,
      data: notification.data,
      is_read: false
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) {
      console.error('❌ Failed to insert notifications:', error);
      throw error;
    }
  }
}

export default new WorkflowNotificationService();
