import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants';
import { isRTL } from '../services/i18n';
import { TextInput } from '../components/TextInput';
import { Button } from '../components/Button';
import { useAuthStore } from '../stores/authStore';
import trainingRequestService from '../services/trainingRequestService';
import { SPECIALIZATIONS } from '../constants/specializations';

interface FormData {
  specialization: string;
  province: string;
  center: string;
  requestedDate: string;
  priority: 'low' | 'medium' | 'high';
  notes: string;
}

export const CreateTrainingRequestScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const rtl = isRTL();

  const [formData, setFormData] = useState<FormData>({
    specialization: '',
    province: user?.province || '',
    center: user?.center || '',
    requestedDate: '',
    priority: 'medium',
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const provinces = [
    'الرياض', 'مكة المكرمة', 'المدينة المنورة', 'القصيم', 'المنطقة الشرقية',
    'عسير', 'تبوك', 'حائل', 'الحدود الشمالية', 'جازان', 'نجران', 'الباحة', 'الجوف'
  ];

  const priorities = [
    { value: 'low', label: 'منخفضة', color: COLORS.success },
    { value: 'medium', label: 'متوسطة', color: COLORS.warning },
    { value: 'high', label: 'عالية', color: COLORS.error },
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.specialization) {
      newErrors.specialization = 'يرجى اختيار التخصص';
    }

    if (!formData.province) {
      newErrors.province = 'يرجى اختيار المحافظة';
    }

    if (!formData.center) {
      newErrors.center = 'يرجى إدخال اسم المركز';
    }

    if (!formData.requestedDate) {
      newErrors.requestedDate = 'يرجى اختيار تاريخ التدريب المطلوب';
    } else {
      const selectedDate = new Date(formData.requestedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.requestedDate = 'لا يمكن اختيار تاريخ في الماضي';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user) {
      Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً');
      return;
    }

    setIsLoading(true);

    try {
      await trainingRequestService.createRequest({
        specialization: formData.specialization,
        province: formData.province,
        requested_date: formData.requestedDate,
        duration_hours: 8, // Default duration
        max_participants: 20, // Default max participants
        notes: formData.notes,
      });

      Alert.alert(
        'تم الإرسال بنجاح',
        'تم إرسال طلب التدريب بنجاح. ستتلقى إشعاراً عند تحديث حالة الطلب.',
        [
          {
            text: 'موافق',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating training request:', error);
      Alert.alert(
        'خطأ',
        error instanceof Error ? error.message : 'فشل في إرسال الطلب'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const formatDateForInput = (date: string): string => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  const handleDateChange = (dateString: string) => {
    updateFormData('requestedDate', dateString);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={[styles.header, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name={rtl ? 'chevron-forward' : 'chevron-back'}
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { textAlign: rtl ? 'right' : 'left' }]}>
            طلب تدريب جديد
          </Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Specialization */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { textAlign: rtl ? 'right' : 'left' }]}>
                التخصص *
              </Text>
              <View style={styles.pickerContainer}>
                {SPECIALIZATIONS.map((spec) => (
                  <TouchableOpacity
                    key={spec.id}
                    style={[
                      styles.pickerOption,
                      formData.specialization === spec.id && styles.pickerOptionSelected,
                    ]}
                    onPress={() => updateFormData('specialization', spec.id)}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        formData.specialization === spec.id && styles.pickerOptionTextSelected,
                      ]}
                    >
                      {spec.name_ar}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.specialization && (
                <Text style={styles.errorText}>{errors.specialization}</Text>
              )}
            </View>

            {/* Province */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { textAlign: rtl ? 'right' : 'left' }]}>
                المحافظة *
              </Text>
              <View style={styles.pickerContainer}>
                {provinces.map((province) => (
                  <TouchableOpacity
                    key={province}
                    style={[
                      styles.pickerOption,
                      formData.province === province && styles.pickerOptionSelected,
                    ]}
                    onPress={() => updateFormData('province', province)}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        formData.province === province && styles.pickerOptionTextSelected,
                      ]}
                    >
                      {province}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.province && (
                <Text style={styles.errorText}>{errors.province}</Text>
              )}
            </View>

            {/* Center */}
            <View style={styles.inputContainer}>
              <TextInput
                label="اسم المركز *"
                value={formData.center}
                onChangeText={(value) => updateFormData('center', value)}
                placeholder="أدخل اسم المركز"
                error={errors.center}
              />
            </View>

            {/* Requested Date */}
            <View style={styles.inputContainer}>
              <TextInput
                label="تاريخ التدريب المطلوب *"
                value={formatDateForInput(formData.requestedDate)}
                onChangeText={handleDateChange}
                placeholder="YYYY-MM-DD"
                error={errors.requestedDate}
                keyboardType="numeric"
              />
            </View>

            {/* Priority */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { textAlign: rtl ? 'right' : 'left' }]}>
                الأولوية
              </Text>
              <View style={styles.priorityContainer}>
                {priorities.map((priority) => (
                  <TouchableOpacity
                    key={priority.value}
                    style={[
                      styles.priorityOption,
                      formData.priority === priority.value && [
                        styles.priorityOptionSelected,
                        { borderColor: priority.color }
                      ],
                    ]}
                    onPress={() => updateFormData('priority', priority.value as any)}
                  >
                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: priority.color }
                      ]}
                    />
                    <Text
                      style={[
                        styles.priorityText,
                        formData.priority === priority.value && styles.priorityTextSelected,
                      ]}
                    >
                      {priority.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.inputContainer}>
              <TextInput
                label="ملاحظات إضافية"
                value={formData.notes}
                onChangeText={(value) => updateFormData('notes', value)}
                placeholder="أضف أي ملاحظات أو متطلبات خاصة"
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Submit Button */}
            <Button
              title={isLoading ? 'جاري الإرسال...' : 'إرسال الطلب'}
              onPress={handleSubmit}
              disabled={isLoading}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border,
    backgroundColor: COLORS.light.card,
  },
  backButton: {
    padding: SIZES.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginHorizontal: SIZES.md,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SIZES.lg,
  },
  inputContainer: {
    marginBottom: SIZES.lg,
  },
  label: {
    fontSize: SIZES.h5,
    fontWeight: '600',
    color: COLORS.light.text,
    marginBottom: SIZES.sm,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  pickerOption: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusSmall,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    backgroundColor: COLORS.light.card,
  },
  pickerOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  pickerOptionText: {
    fontSize: SIZES.caption,
    color: COLORS.light.text,
  },
  pickerOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusSmall,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    backgroundColor: COLORS.light.card,
  },
  priorityOptionSelected: {
    borderWidth: 2,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SIZES.sm,
  },
  priorityText: {
    fontSize: SIZES.caption,
    color: COLORS.light.text,
  },
  priorityTextSelected: {
    fontWeight: '600',
  },
  errorText: {
    fontSize: SIZES.caption,
    color: COLORS.error,
    marginTop: SIZES.xs,
  },
  submitButton: {
    marginTop: SIZES.xl,
  },
});
