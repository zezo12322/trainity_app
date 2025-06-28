import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../services/i18n';
import { useProfileChangeStore } from '../stores/profileChangeStore';
import { ProfileChangeRequest } from '../services/profileChangeService';

interface ProfileChangeRequestsScreenProps {
  navigation: any;
}

const ProfileChangeRequestsScreen: React.FC<ProfileChangeRequestsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const rtl = isRTL();
  const { 
    allRequests, 
    isLoading, 
    error, 
    fetchAllRequests, 
    updateRequestStatus 
  } = useProfileChangeStore();

  const [activeTab, setActiveTab] = useState<'pending' | 'processed'>('pending');

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const pendingRequests = allRequests.filter(req => req.status === 'pending');
  const processedRequests = allRequests.filter(req => req.status !== 'pending');

  const getFieldDisplayName = (fieldName: string) => {
    switch (fieldName) {
      case 'full_name': return 'الاسم الكامل';
      case 'email': return 'البريد الإلكتروني';
      case 'phone': return 'رقم الهاتف';
      case 'province': return 'المحافظة';
      case 'center': return 'المركز';
      default: return fieldName;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'approved': return '#34C759';
      case 'rejected': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'معلق';
      case 'approved': return 'موافق عليه';
      case 'rejected': return 'مرفوض';
      default: return status;
    }
  };

  const handleApprove = async (request: ProfileChangeRequest) => {
    Alert.alert(
      'الموافقة على الطلب',
      `هل أنت متأكد من الموافقة على تعديل ${getFieldDisplayName(request.field_name)}؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'موافق',
          onPress: async () => {
            try {
              await updateRequestStatus(request.id, {
                status: 'approved',
                admin_notes: 'تمت الموافقة على الطلب'
              });
              Alert.alert('تم', 'تمت الموافقة على الطلب بنجاح');
            } catch (error) {
              Alert.alert('خطأ', 'فشل في الموافقة على الطلب');
            }
          }
        }
      ]
    );
  };

  const handleReject = async (request: ProfileChangeRequest) => {
    Alert.prompt(
      'رفض الطلب',
      'يرجى إدخال سبب الرفض:',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'رفض',
          onPress: async (reason) => {
            try {
              await updateRequestStatus(request.id, {
                status: 'rejected',
                admin_notes: reason || 'تم رفض الطلب'
              });
              Alert.alert('تم', 'تم رفض الطلب');
            } catch (error) {
              Alert.alert('خطأ', 'فشل في رفض الطلب');
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const renderRequest = ({ item }: { item: ProfileChangeRequest }) => (
    <View style={styles.requestCard}>
      <View style={[styles.requestHeader, rtl && styles.requestHeaderRTL]}>
        <View style={styles.requestInfo}>
          <Text style={[styles.userName, rtl && styles.textRTL]}>
            {item.user?.full_name || 'مستخدم غير معروف'}
          </Text>
          <Text style={[styles.fieldName, rtl && styles.textRTL]}>
            {getFieldDisplayName(item.field_name)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.requestContent}>
        <View style={styles.valueRow}>
          <Text style={[styles.label, rtl && styles.textRTL]}>القيمة الحالية:</Text>
          <Text style={[styles.currentValue, rtl && styles.textRTL]}>
            {item.current_value || 'غير محدد'}
          </Text>
        </View>
        <View style={styles.valueRow}>
          <Text style={[styles.label, rtl && styles.textRTL]}>القيمة المطلوبة:</Text>
          <Text style={[styles.requestedValue, rtl && styles.textRTL]}>
            {item.requested_value}
          </Text>
        </View>
        {item.reason && (
          <View style={styles.valueRow}>
            <Text style={[styles.label, rtl && styles.textRTL]}>السبب:</Text>
            <Text style={[styles.reason, rtl && styles.textRTL]}>
              {item.reason}
            </Text>
          </View>
        )}
      </View>

      {item.status === 'pending' && (
        <View style={[styles.actionButtons, rtl && styles.actionButtonsRTL]}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprove(item)}
          >
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>موافق</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleReject(item)}
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>رفض</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.admin_notes && (
        <View style={styles.adminNotes}>
          <Text style={[styles.adminNotesLabel, rtl && styles.textRTL]}>ملاحظات المسؤول:</Text>
          <Text style={[styles.adminNotesText, rtl && styles.textRTL]}>
            {item.admin_notes}
          </Text>
        </View>
      )}
    </View>
  );

  const currentRequests = activeTab === 'pending' ? pendingRequests : processedRequests;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name={rtl ? "chevron-forward" : "chevron-back"} size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={[styles.title, rtl && styles.textRTL]}>طلبات تعديل الملف الشخصي</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, rtl && styles.tabContainerRTL]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText, rtl && styles.textRTL]}>
            معلقة ({pendingRequests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'processed' && styles.activeTab]}
          onPress={() => setActiveTab('processed')}
        >
          <Text style={[styles.tabText, activeTab === 'processed' && styles.activeTabText, rtl && styles.textRTL]}>
            تمت المعالجة ({processedRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAllRequests}>
            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Requests List */}
      {!isLoading && !error && (
        <FlatList
          data={currentRequests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={64} color="#8E8E93" />
              <Text style={styles.emptyText}>
                {activeTab === 'pending'
                  ? 'لا توجد طلبات معلقة'
                  : 'لا توجد طلبات تمت معالجتها'
                }
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  textRTL: {
    textAlign: 'right',
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  tabContainerRTL: {
    flexDirection: 'row-reverse',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#007AFF',
  },
  listContainer: {
    padding: 20,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  requestInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  fieldName: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestContent: {
    marginBottom: 12,
  },
  valueRow: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  currentValue: {
    fontSize: 14,
    color: '#8E8E93',
  },
  requestedValue: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  reason: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButtonsRTL: {
    flexDirection: 'row-reverse',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: '#34C759',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  adminNotes: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  adminNotesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  adminNotesText: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default ProfileChangeRequestsScreen;
