import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants';
import { isRTL } from '../services/i18n';
import { supabase } from '../services/supabase';

export const ChangePasswordScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const rtl = isRTL();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert('خطأ', 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('خطأ', 'كلمة المرور الجديدة وتأكيدها غير متطابقين');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('خطأ', 'كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      Alert.alert(
        'نجح',
        'تم تغيير كلمة المرور بنجاح',
        [
          {
            text: 'موافق',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert(
        'خطأ',
        error instanceof Error ? error.message : 'فشل في تغيير كلمة المرور'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
              تغيير كلمة المرور
            </Text>
          </View>

          <View style={styles.content}>
            {/* Current Password */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { textAlign: rtl ? 'right' : 'left' }]}>
                كلمة المرور الحالية
              </Text>
              <View style={[styles.passwordContainer, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                <TextInput
                  style={[styles.input, { textAlign: rtl ? 'right' : 'left' }]}
                  placeholder="أدخل كلمة المرور الحالية"
                  placeholderTextColor={COLORS.light.textSecondary}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <Ionicons
                    name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={COLORS.light.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { textAlign: rtl ? 'right' : 'left' }]}>
                كلمة المرور الجديدة
              </Text>
              <View style={[styles.passwordContainer, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                <TextInput
                  style={[styles.input, { textAlign: rtl ? 'right' : 'left' }]}
                  placeholder="أدخل كلمة المرور الجديدة"
                  placeholderTextColor={COLORS.light.textSecondary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={COLORS.light.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <Text style={[styles.hint, { textAlign: rtl ? 'right' : 'left' }]}>
                يجب أن تكون 8 أحرف على الأقل
              </Text>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { textAlign: rtl ? 'right' : 'left' }]}>
                تأكيد كلمة المرور الجديدة
              </Text>
              <View style={[styles.passwordContainer, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                <TextInput
                  style={[styles.input, { textAlign: rtl ? 'right' : 'left' }]}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  placeholderTextColor={COLORS.light.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={COLORS.light.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Change Password Button */}
            <TouchableOpacity
              style={[styles.changeButton, isLoading && styles.changeButtonDisabled]}
              onPress={handleChangePassword}
              disabled={isLoading}
            >
              <Text style={styles.changeButtonText}>
                {isLoading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
              </Text>
            </TouchableOpacity>

            {/* Security Tips */}
            <View style={styles.tipsContainer}>
              <Text style={[styles.tipsTitle, { textAlign: rtl ? 'right' : 'left' }]}>
                نصائح الأمان:
              </Text>
              <Text style={[styles.tipText, { textAlign: rtl ? 'right' : 'left' }]}>
                • استخدم كلمة مرور قوية تحتوي على أحرف وأرقام ورموز
              </Text>
              <Text style={[styles.tipText, { textAlign: rtl ? 'right' : 'left' }]}>
                • لا تشارك كلمة المرور مع أي شخص آخر
              </Text>
              <Text style={[styles.tipText, { textAlign: rtl ? 'right' : 'left' }]}>
                • غير كلمة المرور بانتظام لضمان الأمان
              </Text>
            </View>
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
  scrollView: {
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
  passwordContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.light.card,
    borderRadius: SIZES.radiusMedium,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    paddingHorizontal: SIZES.md,
  },
  input: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.light.text,
    paddingVertical: SIZES.md,
  },
  eyeButton: {
    padding: SIZES.sm,
  },
  hint: {
    fontSize: SIZES.caption,
    color: COLORS.light.textSecondary,
    marginTop: SIZES.xs,
  },
  changeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMedium,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    marginTop: SIZES.lg,
  },
  changeButtonDisabled: {
    opacity: 0.6,
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: SIZES.h5,
    fontWeight: '600',
  },
  tipsContainer: {
    marginTop: SIZES.xl,
    padding: SIZES.md,
    backgroundColor: COLORS.light.card,
    borderRadius: SIZES.radiusMedium,
  },
  tipsTitle: {
    fontSize: SIZES.h5,
    fontWeight: '600',
    color: COLORS.light.text,
    marginBottom: SIZES.sm,
  },
  tipText: {
    fontSize: SIZES.caption,
    color: COLORS.light.textSecondary,
    marginBottom: SIZES.xs,
    lineHeight: 20,
  },
});
