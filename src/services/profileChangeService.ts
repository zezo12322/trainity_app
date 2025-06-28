import { supabase } from './supabase';

export interface ProfileChangeRequest {
  id: string;
  user_id: string;
  field_name: string;
  current_value: string | null;
  requested_value: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  admin_notes?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
  approver?: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
}

export interface CreateChangeRequestData {
  field_name: string;
  current_value: string | null;
  requested_value: string;
  reason?: string;
}

export interface UpdateChangeRequestData {
  status: 'approved' | 'rejected';
  admin_notes?: string;
}

class ProfileChangeService {
  // إنشاء طلب تعديل جديد
  async createChangeRequest(data: CreateChangeRequestData): Promise<ProfileChangeRequest> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const requestData = {
        ...data,
        user_id: user.id,
        status: 'pending' as const,
      };

      const { data: request, error } = await supabase
        .from('profile_change_requests')
        .insert(requestData)
        .select(`
          *,
          user:profiles!profile_change_requests_user_id_fkey(id, email, full_name, role)
        `)
        .single();

      if (error) throw error;

      return this.transformRequest(request);
    } catch (error) {
      console.error('Error creating change request:', error);
      throw error;
    }
  }

  // الحصول على طلبات التعديل الخاصة بالمستخدم
  async getMyChangeRequests(): Promise<ProfileChangeRequest[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: requests, error } = await supabase
        .from('profile_change_requests')
        .select(`
          *,
          user:profiles!profile_change_requests_user_id_fkey(id, email, full_name, role),
          approver:profiles!profile_change_requests_approved_by_fkey(id, email, full_name, role)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return requests.map(this.transformRequest);
    } catch (error) {
      console.error('Error fetching my change requests:', error);
      throw error;
    }
  }

  // الحصول على جميع طلبات التعديل (للمسؤولين)
  async getAllChangeRequests(): Promise<ProfileChangeRequest[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // التحقق من صلاحيات المستخدم
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || !['admin', 'manager', 'supervisor'].includes(profile.role)) {
        throw new Error('Insufficient permissions');
      }

      const { data: requests, error } = await supabase
        .from('profile_change_requests')
        .select(`
          *,
          user:profiles!profile_change_requests_user_id_fkey(id, email, full_name, role),
          approver:profiles!profile_change_requests_approved_by_fkey(id, email, full_name, role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return requests.map(this.transformRequest);
    } catch (error) {
      console.error('Error fetching all change requests:', error);
      throw error;
    }
  }

  // الموافقة على أو رفض طلب تعديل
  async updateChangeRequestStatus(
    requestId: string, 
    data: UpdateChangeRequestData
  ): Promise<ProfileChangeRequest> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updateData = {
        ...data,
        approved_by: user.id,
        updated_at: new Date().toISOString()
      };

      const { data: request, error } = await supabase
        .from('profile_change_requests')
        .update(updateData)
        .eq('id', requestId)
        .select(`
          *,
          user:profiles!profile_change_requests_user_id_fkey(id, email, full_name, role),
          approver:profiles!profile_change_requests_approved_by_fkey(id, email, full_name, role)
        `)
        .single();

      if (error) throw error;

      // إذا تمت الموافقة، قم بتحديث الملف الشخصي
      if (data.status === 'approved') {
        await this.applyApprovedChange(request);
      }

      return this.transformRequest(request);
    } catch (error) {
      console.error('Error updating change request status:', error);
      throw error;
    }
  }

  // تطبيق التغيير المعتمد على الملف الشخصي
  private async applyApprovedChange(request: any): Promise<void> {
    try {
      const updateData: any = {};
      updateData[request.field_name] = request.requested_value;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', request.user_id);

      if (error) throw error;
    } catch (error) {
      console.error('Error applying approved change:', error);
      throw error;
    }
  }

  // التحقق من وجود طلب معلق لحقل معين
  async hasPendingRequest(fieldName: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('profile_change_requests')
        .select('id')
        .eq('user_id', user.id)
        .eq('field_name', fieldName)
        .eq('status', 'pending')
        .limit(1);

      if (error) throw error;

      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking pending request:', error);
      return false;
    }
  }

  // حذف طلب تعديل
  async deleteChangeRequest(requestId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profile_change_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting change request:', error);
      throw error;
    }
  }

  // تحويل البيانات من قاعدة البيانات إلى النموذج المطلوب
  private transformRequest(request: any): ProfileChangeRequest {
    return {
      id: request.id,
      user_id: request.user_id,
      field_name: request.field_name,
      current_value: request.current_value,
      requested_value: request.requested_value,
      status: request.status,
      reason: request.reason,
      admin_notes: request.admin_notes,
      approved_by: request.approved_by,
      created_at: request.created_at,
      updated_at: request.updated_at,
      user: request.user ? {
        id: request.user.id,
        email: request.user.email,
        full_name: request.user.full_name,
        role: request.user.role,
      } : undefined,
      approver: request.approver ? {
        id: request.approver.id,
        email: request.approver.email,
        full_name: request.approver.full_name,
        role: request.approver.role,
      } : undefined,
    };
  }

  // الاشتراك في التحديثات الفورية
  subscribeToMyRequests(callback: (requests: ProfileChangeRequest[]) => void): () => void {
    const subscription = supabase
      .channel('my_profile_change_requests')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'profile_change_requests'
        }, 
        () => {
          this.getMyChangeRequests().then(callback).catch(console.error);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  subscribeToAllRequests(callback: (requests: ProfileChangeRequest[]) => void): () => void {
    const subscription = supabase
      .channel('all_profile_change_requests')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'profile_change_requests'
        }, 
        () => {
          this.getAllChangeRequests().then(callback).catch(console.error);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}

export default new ProfileChangeService();
