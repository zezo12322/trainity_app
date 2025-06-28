import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../services/i18n';
import { useTrainingRequestStore } from '../stores/trainingRequestStore';
import { useAuthStore } from '../stores/authStore';
import { TrainingRequest } from '../types';

export const TrainingRequestDetailScreen: React.FC<any> = ({
  route,
  navigation,
}) => {
  const { t } = useTranslation();
  const rtl = isRTL();
  const { requestId } = route.params;
  const { user } = useAuthStore();
  const { getRequestById, updateStatus, assignTrainer, isLoading } = useTrainingRequestStore();

  const [request, setRequest] = useState<TrainingRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      const requestData = await getRequestById(requestId);
      setRequest(requestData);
    } catch (error) {
      console.error('Error loading request:', error);
      Alert.alert(t('common.error'), 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!request) return;

    try {
      await updateStatus(request.id, newStatus);
      setRequest(prev => prev ? { ...prev, status: newStatus as any } : null);
      Alert.alert(t('common.success'), 'Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert(t('common.error'), 'Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under_review': return '#007AFF';
      case 'cc_approved':
      case 'sv_approved':
      case 'pm_approved': return '#34C759';
      case 'tr_assigned': return '#AF52DE';
      case 'completed': return '#32D74B';
      case 'rejected': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const canUpdateStatus = () => {
    if (!user || !request) return false;

    const isAlternativePath = request.approval_path === 'pm_alternative';

    // Standard path
    if (!isAlternativePath) {
      switch (user.role) {
        case 'coordinator':
          return request.status === 'under_review';
        case 'supervisor':
          return request.status === 'cc_approved';
        case 'manager':
          return request.status === 'sv_approved';
        case 'admin':
          return true;
        default:
          return false;
      }
    }
    // Alternative path (when PM is the requester)
    else {
      switch (user.role) {
        case 'supervisor':
          return request.status === 'sv_approved';
        case 'admin':
          return true;
        default:
          return false;
      }
    }
  };

  const getNextStatus = () => {
    if (!request) return null;

    const isAlternativePath = request.approval_path === 'pm_alternative';

    if (!isAlternativePath) {
      // Standard path
      switch (request.status) {
        case 'under_review': return 'cc_approved';
        case 'cc_approved': return 'sv_approved';
        case 'sv_approved': return 'pm_approved';
        case 'pm_approved': return 'tr_assigned';
        case 'tr_assigned': return 'completed';
        default: return null;
      }
    } else {
      // Alternative path
      switch (request.status) {
        case 'sv_approved': return 'pm_approved';
        case 'pm_approved': return 'tr_assigned';
        case 'tr_assigned': return 'completed';
        default: return null;
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Request not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, rtl && styles.headerRTL]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name={rtl ? "chevron-forward" : "chevron-back"}
            size={24}
            color="#007AFF"
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, rtl && styles.textRTL]}>
          {t('trainingRequests.requestDetails')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View style={[styles.statusContainer, rtl && styles.statusContainerRTL]}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
              {t(`trainingRequests.statuses.${request.status}`)}
            </Text>
          </View>
        </View>

        {/* Request Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, rtl && styles.textRTL]}>
            {t('trainingRequests.requestInfo')}
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, rtl && styles.textRTL]}>
              {t('trainingRequests.title')}:
            </Text>
            <Text style={[styles.infoValue, rtl && styles.textRTL]}>
              {request.title}
            </Text>
          </View>

          {request.description && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, rtl && styles.textRTL]}>
                {t('trainingRequests.description')}:
              </Text>
              <Text style={[styles.infoValue, rtl && styles.textRTL]}>
                {request.description}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, rtl && styles.textRTL]}>
              {t('trainingRequests.specialization')}:
            </Text>
            <Text style={[styles.infoValue, rtl && styles.textRTL]}>
              {request.specialization}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, rtl && styles.textRTL]}>
              {t('trainingRequests.province')}:
            </Text>
            <Text style={[styles.infoValue, rtl && styles.textRTL]}>
              {request.province}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, rtl && styles.textRTL]}>
              {t('trainingRequests.requestedDate')}:
            </Text>
            <Text style={[styles.infoValue, rtl && styles.textRTL]}>
              {new Date(request.requested_date).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, rtl && styles.textRTL]}>
              {t('trainingRequests.duration')}:
            </Text>
            <Text style={[styles.infoValue, rtl && styles.textRTL]}>
              {request.duration_hours} {t('trainingRequests.hours')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, rtl && styles.textRTL]}>
              {t('trainingRequests.maxParticipants')}:
            </Text>
            <Text style={[styles.infoValue, rtl && styles.textRTL]}>
              {request.max_participants}
            </Text>
          </View>
        </View>

        {/* Requester Info */}
        {request.requester && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, rtl && styles.textRTL]}>
              {t('trainingRequests.requesterInfo')}
            </Text>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, rtl && styles.textRTL]}>
                {t('trainingRequests.name')}:
              </Text>
              <Text style={[styles.infoValue, rtl && styles.textRTL]}>
                {request.requester.full_name || 'N/A'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, rtl && styles.textRTL]}>
                {t('trainingRequests.role')}:
              </Text>
              <Text style={[styles.infoValue, rtl && styles.textRTL]}>
                {request.requester.role}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, rtl && styles.textRTL]}>
                {t('trainingRequests.email')}:
              </Text>
              <Text style={[styles.infoValue, rtl && styles.textRTL]}>
                {request.requester.email}
              </Text>
            </View>
          </View>
        )}

        {/* Trainer Info */}
        {request.trainer && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, rtl && styles.textRTL]}>
              {t('trainingRequests.trainerInfo')}
            </Text>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, rtl && styles.textRTL]}>
                {t('trainingRequests.name')}:
              </Text>
              <Text style={[styles.infoValue, rtl && styles.textRTL]}>
                {request.trainer.full_name || 'N/A'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, rtl && styles.textRTL]}>
                {t('trainingRequests.email')}:
              </Text>
              <Text style={[styles.infoValue, rtl && styles.textRTL]}>
                {request.trainer.email}
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {canUpdateStatus() && (
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => {
                const nextStatus = getNextStatus();
                if (nextStatus) {
                  handleStatusUpdate(nextStatus);
                }
              }}
              disabled={isLoading}
            >
              <Text style={styles.actionButtonText}>
                {t('trainingRequests.approve')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleStatusUpdate('rejected')}
              disabled={isLoading}
            >
              <Text style={styles.actionButtonText}>
                {t('trainingRequests.reject')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  textRTL: {
    textAlign: 'right',
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  statusContainerRTL: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  approveButton: {
    backgroundColor: '#34C759',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
