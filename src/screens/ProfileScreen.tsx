import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../stores/authStore';
import { COLORS, SIZES } from '../constants';
import { isRTL } from '../services/i18n';
import { RTLView, useRTL } from '../components/RTLText';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeSelector, ThemeToggleButton } from '../components/ThemeSelector';
import { useTheme } from '../contexts/ThemeContext';
import { EditFieldModal } from '../components/EditFieldModal';

interface ProfileItemProps {
  icon: string;
  title: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
}

const ProfileItem: React.FC<ProfileItemProps> = ({ icon, title, value, onPress, showArrow = true }) => {
  const { isRTL: rtl, getIconName } = useRTL();

  return (
    <TouchableOpacity
      style={styles.profileItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <RTLView style={styles.profileItemContent}>
        <RTLView style={styles.profileItemLeft}>
          <Ionicons name={icon as any} size={24} color={COLORS.primary} />
          <Text style={[styles.profileItemTitle, { marginLeft: rtl ? 0 : SIZES.md, marginRight: rtl ? SIZES.md : 0 }]}>
            {title}
          </Text>
        </RTLView>
        <RTLView style={styles.profileItemRight}>
          {value ? (
            <Text style={[styles.profileItemValue, { textAlign: rtl ? 'left' : 'right' }]}>
              {value}
            </Text>
          ) : null}
          {showArrow && onPress ? (
            <Ionicons
              name={getIconName('chevron-forward') as any}
              size={20}
              color={COLORS.light.textSecondary}
              style={{ marginLeft: rtl ? 0 : SIZES.sm, marginRight: rtl ? SIZES.sm : 0 }}
            />
          ) : null}
        </RTLView>
      </RTLView>
    </TouchableOpacity>
  );
};

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const { theme, themeMode } = useTheme();
  const rtl = isRTL();
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  // Edit field modal state
  const [editModal, setEditModal] = useState<{
    visible: boolean;
    fieldName: string;
    fieldTitle: string;
    currentValue: string | null;
    requiresApproval: boolean;
    placeholder?: string;
    multiline?: boolean;
  }>({
    visible: false,
    fieldName: '',
    fieldTitle: '',
    currentValue: null,
    requiresApproval: false,
  });

  const openEditModal = (
    fieldName: string,
    fieldTitle: string,
    currentValue: string | null,
    requiresApproval: boolean = false,
    placeholder?: string,
    multiline?: boolean
  ) => {
    setEditModal({
      visible: true,
      fieldName,
      fieldTitle,
      currentValue,
      requiresApproval,
      placeholder,
      multiline,
    });
  };

  const closeEditModal = () => {
    setEditModal(prev => ({ ...prev, visible: false }));
  };



  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      t('auth.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert(t('common.error'), t('auth.logoutError'));
            }
          },
        },
      ]
    );
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'TRAINER_PREPARATION_PROJECT_MANAGER':
        return 'مدير مشروع إعداد المدربين';
      case 'PROGRAM_SUPERVISOR':
        return 'مشرف البرنامج';
      case 'DEVELOPMENT_MANAGEMENT_OFFICER':
        return 'مسؤول إدارة التنمية';
      case 'PROVINCIAL_DEVELOPMENT_OFFICER':
        return 'مسؤول تنمية المحافظة';
      default:
        return role;
    }
  };

  const handleImagePicker = () => {
    Alert.alert(
      'تغيير الصورة الشخصية',
      'اختر مصدر الصورة',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'الكاميرا', onPress: () => pickImage('camera') },
        { text: 'المعرض', onPress: () => pickImage('library') },
      ]
    );
  };

  const pickImage = async (source: 'camera' | 'library') => {
    try {
      let result;

      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('خطأ', 'نحتاج إذن الوصول للكاميرا');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('خطأ', 'نحتاج إذن الوصول للمعرض');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        // هنا يمكن رفع الصورة إلى Supabase Storage
        // وتحديث avatar_url في قاعدة البيانات
        console.log('Selected image:', result.assets[0].uri);
        Alert.alert('نجح', 'تم اختيار الصورة بنجاح');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء اختيار الصورة');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.headerTop}>
            <View style={styles.placeholder} />
            <ThemeToggleButton style={styles.themeToggle} />
          </View>

          <TouchableOpacity style={styles.avatarContainer} onPress={handleImagePicker}>
            <View style={styles.avatar}>
              {user?.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </Text>
              )}
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={[styles.userName, { textAlign: rtl ? 'right' : 'left' }]}>
            {user?.full_name || t('profile.noName')}
          </Text>
          <Text style={[styles.userEmail, { textAlign: rtl ? 'right' : 'left' }]}>
            {user?.email}
          </Text>
          <Text style={[styles.userRole, { textAlign: rtl ? 'right' : 'left' }]}>
            {user?.role ? getRoleDisplayName(user.role) : ''}
          </Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: rtl ? 'right' : 'left' }]}>
            {t('profile.personalInfo')}
          </Text>

          <ProfileItem
            icon="person"
            title={t('profile.fullName')}
            value={user?.full_name || t('profile.notSet')}
            onPress={() => openEditModal(
              'full_name',
              'الاسم الكامل',
              user?.full_name || null,
              false,
              'أدخل الاسم الكامل'
            )}
          />

          <ProfileItem
            icon="mail"
            title={t('profile.email')}
            value={user?.email}
            onPress={() => openEditModal(
              'email',
              'البريد الإلكتروني',
              user?.email || null,
              true,
              'أدخل البريد الإلكتروني الجديد'
            )}
          />

          <ProfileItem
            icon="call"
            title={t('profile.phone')}
            value={user?.phone || t('profile.notSet')}
            onPress={() => openEditModal(
              'phone',
              'رقم الهاتف',
              user?.phone || null,
              true,
              'أدخل رقم الهاتف الجديد'
            )}
          />

          <ProfileItem
            icon="location"
            title={t('profile.province')}
            value={user?.province || t('profile.notSet')}
            onPress={() => openEditModal(
              'province',
              'المحافظة',
              user?.province || null,
              false,
              'أدخل المحافظة'
            )}
          />

          <ProfileItem
            icon="business"
            title={t('profile.center')}
            value={user?.center || t('profile.notSet')}
            onPress={() => openEditModal(
              'center',
              'المركز',
              user?.center || null,
              false,
              'أدخل المركز'
            )}
          />
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: rtl ? 'right' : 'left' }]}>
            {t('profile.settings')}
          </Text>

          <LanguageSwitcher />

          <ProfileItem
            icon={theme.isDark ? "moon" : "sunny"}
            title={t('profile.theme')}
            value={t(`theme.${themeMode}`)}
            onPress={() => setShowThemeSelector(true)}
          />

          <ProfileItem
            icon="notifications"
            title={t('profile.notifications')}
            onPress={() => {
              (navigation as any).navigate('Notifications');
            }}
          />

          <ProfileItem
            icon="lock-closed"
            title={t('profile.changePassword')}
            onPress={() => {
              (navigation as any).navigate('ChangePassword');
            }}
          />
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <ProfileItem
            icon="help-circle"
            title={t('profile.help')}
            onPress={() => {
              (navigation as any).navigate('Help');
            }}
          />

          <ProfileItem
            icon="information-circle"
            title={t('profile.about')}
            onPress={() => {
              (navigation as any).navigate('About');
            }}
          />

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={24} color={COLORS.error} />
            <Text style={[styles.logoutText, { marginLeft: rtl ? 0 : SIZES.md, marginRight: rtl ? SIZES.md : 0 }]}>
              {t('auth.logout')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Theme Selector Modal */}
      <ThemeSelector
        visible={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
      />

      {/* Edit Field Modal */}
      <EditFieldModal
        visible={editModal.visible}
        onClose={closeEditModal}
        fieldName={editModal.fieldName}
        fieldTitle={editModal.fieldTitle}
        currentValue={editModal.currentValue}
        requiresApproval={editModal.requiresApproval}
        placeholder={editModal.placeholder}
        multiline={editModal.multiline}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: SIZES.xl,
    backgroundColor: COLORS.primary,
  },
  avatarContainer: {
    marginBottom: SIZES.md,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: SIZES.xs,
  },
  userEmail: {
    fontSize: SIZES.h5,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SIZES.xs,
  },
  userRole: {
    fontSize: SIZES.h6,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  section: {
    backgroundColor: COLORS.light.card,
    marginTop: SIZES.md,
    paddingVertical: SIZES.md,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.light.text,
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
  },
  profileItem: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border,
  },
  profileItemContent: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemTitle: {
    fontSize: SIZES.h5,
    color: COLORS.light.text,
  },
  profileItemRight: {
    alignItems: 'center',
  },
  profileItemValue: {
    fontSize: SIZES.h6,
    color: COLORS.light.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    marginTop: SIZES.md,
  },
  logoutText: {
    fontSize: SIZES.h5,
    color: COLORS.error,
    fontWeight: '500',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: SIZES.md,
  },
  placeholder: {
    width: 40,
  },
  themeToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
