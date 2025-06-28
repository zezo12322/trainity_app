import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../services/i18n';
import { useProfileChangeStore } from '../stores/profileChangeStore';

interface EditFieldModalProps {
  visible: boolean;
  onClose: () => void;
  fieldName: string;
  fieldTitle: string;
  currentValue: string | null;
  requiresApproval?: boolean;
  placeholder?: string;
  multiline?: boolean;
}

export const EditFieldModal: React.FC<EditFieldModalProps> = ({
  visible,
  onClose,
  fieldName,
  fieldTitle,
  currentValue,
  requiresApproval = false,
  placeholder,
  multiline = false,
}) => {
  const { t } = useTranslation();
  const rtl = isRTL();
  const { createChangeRequest, hasPendingRequest, isLoading } = useProfileChangeStore();
  
  const [newValue, setNewValue] = useState(currentValue || '');
  const [reason, setReason] = useState('');
  const [hasPending, setHasPending] = useState(false);

  useEffect(() => {
    if (visible) {
      setNewValue(currentValue || '');
      setReason('');
      checkPendingRequest();
    }
  }, [visible, currentValue]);

  const checkPendingRequest = async () => {
    if (requiresApproval) {
      const pending = await hasPendingRequest(fieldName);
      setHasPending(pending);
    }
  };

  const handleSave = async () => {
    if (!newValue.trim()) {
      Alert.alert(t('common.error'), 'يرجى إدخال قيمة صحيحة');
      return;
    }

    if (newValue.trim() === (currentValue || '').trim()) {
      Alert.alert(t('common.error'), 'لم يتم تغيير القيمة');
      return;
    }

    try {
      if (requiresApproval) {
        // إنشاء طلب تعديل يحتاج موافقة
        await createChangeRequest({
          field_name: fieldName,
          current_value: currentValue,
          requested_value: newValue.trim(),
          reason: reason.trim() || undefined,
        });

        Alert.alert(
          'تم إرسال الطلب',
          'تم إرسال طلب التعديل بنجاح. سيتم مراجعته من قبل مسؤول المشروع.',
          [{ text: 'موافق', onPress: onClose }]
        );
      } else {
        // تحديث مباشر للحقول التي لا تحتاج موافقة
        await createChangeRequest({
          field_name: fieldName,
          current_value: currentValue,
          requested_value: newValue.trim(),
          reason: reason.trim() || undefined,
        });

        // يمكن إضافة تحديث مباشر للملف الشخصي هنا
        Alert.alert(
          'تم التحديث',
          'تم تحديث المعلومات بنجاح.',
          [{ text: 'موافق', onPress: onClose }]
        );
      }
    } catch (error) {
      Alert.alert(t('common.error'), 'فشل في حفظ التغييرات');
    }
  };

  const getFieldDescription = () => {
    if (requiresApproval) {
      return 'هذا الحقل يتطلب موافقة مسؤول المشروع قبل التحديث.';
    }
    return 'سيتم تحديث هذا الحقل فوراً.';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, rtl && styles.headerRTL]}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#1C1C1E" />
          </TouchableOpacity>
          <Text style={[styles.title, rtl && styles.textRTL]}>
            تعديل {fieldTitle}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          {hasPending && (
            <View style={styles.warningContainer}>
              <Ionicons name="warning" size={20} color="#FF9500" />
              <Text style={[styles.warningText, rtl && styles.textRTL]}>
                يوجد طلب تعديل معلق لهذا الحقل
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.label, rtl && styles.textRTL]}>
              القيمة الحالية
            </Text>
            <View style={styles.currentValueContainer}>
              <Text style={[styles.currentValue, rtl && styles.textRTL]}>
                {currentValue || 'غير محدد'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, rtl && styles.textRTL]}>
              القيمة الجديدة *
            </Text>
            <TextInput
              style={[
                styles.input,
                multiline && styles.multilineInput,
                rtl && styles.textRTL
              ]}
              value={newValue}
              onChangeText={setNewValue}
              placeholder={placeholder || `أدخل ${fieldTitle} الجديد`}
              placeholderTextColor="#8E8E93"
              multiline={multiline}
              numberOfLines={multiline ? 4 : 1}
            />
          </View>

          {requiresApproval && (
            <View style={styles.section}>
              <Text style={[styles.label, rtl && styles.textRTL]}>
                سبب التعديل (اختياري)
              </Text>
              <TextInput
                style={[styles.input, styles.multilineInput, rtl && styles.textRTL]}
                value={reason}
                onChangeText={setReason}
                placeholder="اذكر سبب طلب تعديل هذه المعلومات..."
                placeholderTextColor="#8E8E93"
                multiline
                numberOfLines={3}
              />
            </View>
          )}

          <View style={styles.infoContainer}>
            <Ionicons 
              name={requiresApproval ? "shield-checkmark" : "checkmark-circle"} 
              size={20} 
              color={requiresApproval ? "#FF9500" : "#34C759"} 
            />
            <Text style={[styles.infoText, rtl && styles.textRTL]}>
              {getFieldDescription()}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading || hasPending}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'جاري الحفظ...' : requiresApproval ? 'إرسال طلب التعديل' : 'حفظ التغييرات'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>إلغاء</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  currentValueContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  currentValue: {
    fontSize: 16,
    color: '#8E8E93',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    fontSize: 16,
    color: '#1C1C1E',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#1C1C1E',
    marginLeft: 12,
    flex: 1,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 14,
    color: '#FF9500',
    marginLeft: 12,
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '500',
  },
});
