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
import { RatingSystem } from '../components/RatingSystem';
import { useTrainingRequestStore } from '../stores/trainingRequestStore';
import { TrainingRequest } from '../types';

interface TrainingRequestsScreenProps {
  navigation: any;
}



export const TrainingRequestsScreen: React.FC<TrainingRequestsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const rtl = isRTL();
  const {
    myRequests,
    isLoading,
    error,
    fetchMyRequests,
    clearError
  } = useTrainingRequestStore();

  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRequestForRating, setSelectedRequestForRating] = useState<TrainingRequest | null>(null);

  // Load data on component mount
  useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) clearError();
    };
  }, [error, clearError]);

  // Filter requests based on status
  const pendingRequests = myRequests.filter(request =>
    ['submitted', 'under_review', 'cc_approved', 'sv_approved', 'pm_approved', 'tr_assigned', 'final_approved', 'in_progress'].includes(request.status)
  );

  const completedRequests = myRequests.filter(request =>
    request.status === 'completed'
  );



  const handleRateTraining = (request: TrainingRequest) => {
    if (!request.assigned_trainer_id) {
      Alert.alert(t('ratings.error'), 'لا يمكن تقييم التدريب بدون مدرب مُعيّن');
      return;
    }

    navigation.navigate('RateTraining', {
      trainingRequest: request
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return '#FF9500';
      case 'under_review': return '#007AFF';
      case 'cc_approved':
      case 'sv_approved':
      case 'pm_approved': return '#34C759';
      case 'tr_assigned': return '#AF52DE';
      case 'in_progress': return '#5856D6';
      case 'completed': return '#32D74B';
      case 'rejected': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return 'paper-plane';
      case 'under_review': return 'eye';
      case 'cc_approved':
      case 'sv_approved':
      case 'pm_approved': return 'checkmark-circle';
      case 'tr_assigned': return 'person';
      case 'in_progress': return 'play-circle';
      case 'completed': return 'checkmark-done-circle';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const getStatusText = (status: string, approvalPath: 'standard' | 'pm_alternative') => {
    if (approvalPath === 'pm_alternative') {
      switch (status) {
        case 'sv_approved': return t('trainingRequests.waitingForSupervisorApproval');
        case 'pm_approved': return t('trainingRequests.approvedWaitingForTrainer');
        case 'tr_assigned': return t('trainingRequests.trainerAssigned');
        case 'completed': return t('trainingRequests.completed');
        case 'rejected': return t('trainingRequests.rejected');
        default: return t(`trainingRequests.statuses.${status}`);
      }
    } else {
      switch (status) {
        case 'under_review': return t('trainingRequests.waitingForCCApproval');
        case 'cc_approved': return t('trainingRequests.waitingForSupervisorApproval');
        case 'sv_approved': return t('trainingRequests.waitingForPMApproval');
        case 'pm_approved': return t('trainingRequests.approvedWaitingForTrainer');
        case 'tr_assigned': return t('trainingRequests.trainerAssigned');
        case 'completed': return t('trainingRequests.completed');
        case 'rejected': return t('trainingRequests.rejected');
        default: return t(`trainingRequests.statuses.${status}`);
      }
    }
  };

  const renderRequest = ({ item }: { item: TrainingRequest }) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);

    return (
      <TouchableOpacity style={styles.requestCard}>
        <View style={[styles.requestContent, rtl && styles.requestContentRTL]}>
          <View style={[styles.requestIcon, { backgroundColor: statusColor + '20' }, rtl && styles.requestIconRTL]}>
            <Ionicons name={statusIcon as any} size={24} color={statusColor} />
          </View>
          <View style={styles.requestInfo}>
            <Text style={[styles.requestTitle, rtl && styles.textRTL]}>{item.title}</Text>
            <Text style={[styles.requestedBy, rtl && styles.textRTL]}>
              {t('trainingRequests.specialization')}: {item.specialization}
            </Text>
            <Text style={[styles.requestedBy, rtl && styles.textRTL]}>
              {t('trainingRequests.province')}: {item.province}
            </Text>
            <Text style={[styles.requestedBy, rtl && styles.textRTL]}>
              {t('trainingRequests.status')}: {getStatusText(item.status, item.approval_path)}
            </Text>

            {/* Rate Button for completed trainings */}
            {item.status === 'completed' && (
              <TouchableOpacity
                style={styles.rateButton}
                onPress={() => handleRateTraining(item)}
              >
                <Ionicons name="star-outline" size={16} color="#FF9500" />
                <Text style={styles.rateButtonText}>{t('ratings.rateTraining')}</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.viewButton, rtl && styles.viewButtonRTL]}
            onPress={() => navigation.navigate('TrainingRequestDetail', { requestId: item.id })}
          >
            <Text style={[styles.viewButtonText, rtl && styles.textRTL]}>{t('common.view')}</Text>
            <Ionicons
              name={rtl ? "chevron-back" : "chevron-forward"}
              size={16}
              color="#007AFF"
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const currentRequests = activeTab === 'pending' ? pendingRequests : completedRequests;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, rtl && styles.textRTL]}>{t('navigation.trainingRequests')}</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, rtl && styles.tabContainerRTL]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText, rtl && styles.textRTL]}>
            {t('trainingRequests.pending')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText, rtl && styles.textRTL]}>
            {t('trainingRequests.completed')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchMyRequests}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
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
                  ? t('trainingRequests.noPendingRequests')
                  : t('trainingRequests.noCompletedRequests')
                }
              </Text>
            </View>
          }
        />
      )}

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('CreateTrainingRequest')}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>



      {/* Rating Modal */}
      {selectedRequestForRating && (
        <RatingSystem
          visible={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedRequestForRating(null);
          }}
          onSubmit={handleSubmitRating}
          title={selectedRequestForRating.title}
          subtitle={t('rating.rateYourExperience')}
          showDetailedRating={true}
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
    justifyContent: 'center',
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  requestContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  requestContentRTL: {
    flexDirection: 'row-reverse',
  },
  requestIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  requestIconRTL: {
    marginRight: 0,
    marginLeft: 16,
  },
  requestInfo: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  requestedBy: {
    fontSize: 14,
    color: '#8E8E93',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewButtonRTL: {
    flexDirection: 'row-reverse',
  },
  viewButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginRight: 4,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  dropdownRTL: {
    flexDirection: 'row-reverse',
  },
  dropdownText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  inputText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  dateTimeContainerRTL: {
    flexDirection: 'row-reverse',
  },
  dateGroup: {
    flex: 1,
    marginRight: 12,
  },
  dateGroupRTL: {
    marginRight: 0,
    marginLeft: 12,
  },
  timeGroup: {
    flex: 1,
    marginLeft: 12,
  },
  timeGroupRTL: {
    marginLeft: 0,
    marginRight: 12,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  dateInputRTL: {
    flexDirection: 'row-reverse',
  },
  dateText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  timeInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  timeInputRTL: {
    flexDirection: 'row-reverse',
  },
  timeText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  ratingContainer: {
    marginTop: 8,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#FF950010',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  rateButtonText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
    marginLeft: 4,
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
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    fontSize: 16,
    color: '#1C1C1E',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  pickerCancelText: {
    fontSize: 16,
    color: '#007AFF',
  },
  pickerContent: {
    flex: 1,
    padding: 20,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  pickerItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF10',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  pickerItemTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
