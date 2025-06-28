import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants';
import { isRTL } from '../services/i18n';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export const AboutScreen: React.FC = () => {
  const navigation = useNavigation();
  const rtl = isRTL();

  const features: FeatureItem[] = [
    {
      id: '1',
      title: 'إدارة طلبات التدريب',
      description: 'نظام شامل لإدارة طلبات التدريب مع سير عمل موافقات متقدم',
      icon: 'document-text',
    },
    {
      id: '2',
      title: 'نظام المحادثات',
      description: 'تواصل فوري مع الفريق من خلال المحادثات الفردية والجماعية',
      icon: 'chatbubbles',
    },
    {
      id: '3',
      title: 'التحليلات والإحصائيات',
      description: 'تقارير مفصلة ومؤشرات أداء لمتابعة التقدم',
      icon: 'analytics',
    },
    {
      id: '4',
      title: 'العمل دون اتصال',
      description: 'إمكانية العمل دون اتصال بالإنترنت مع المزامنة التلقائية',
      icon: 'cloud-offline',
    },
    {
      id: '5',
      title: 'دعم اللغة العربية',
      description: 'واجهة مستخدم تدعم اللغة العربية بالكامل مع RTL',
      icon: 'language',
    },
    {
      id: '6',
      title: 'الأمان والخصوصية',
      description: 'حماية متقدمة للبيانات مع تشفير شامل',
      icon: 'shield-checkmark',
    },
  ];

  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'فريق التطوير',
      role: 'مطورو التطبيق',
    },
    {
      id: '2',
      name: 'فريق التصميم',
      role: 'مصممو واجهة المستخدم',
    },
    {
      id: '3',
      name: 'فريق ضمان الجودة',
      role: 'اختبار وضمان الجودة',
    },
  ];

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(() => {
      console.error('Failed to open URL:', url);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
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
            حول التطبيق
          </Text>
        </View>

        {/* App Logo and Info */}
        <View style={styles.appInfoSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="business" size={64} color={COLORS.primary} />
          </View>
          <Text style={styles.appName}>صناع الحياة - إدارة التدريب</Text>
          <Text style={styles.appVersion}>الإصدار 1.0.0</Text>
          <Text style={[styles.appDescription, { textAlign: rtl ? 'right' : 'left' }]}>
            تطبيق شامل لإدارة طلبات التدريب والتواصل بين أعضاء الفريق في مؤسسة صناع الحياة.
            يوفر التطبيق نظام موافقات متقدم ونظام محادثات فوري وتحليلات مفصلة.
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: rtl ? 'right' : 'left' }]}>
            المميزات الرئيسية
          </Text>
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <View key={feature.id} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon as any} size={24} color={COLORS.primary} />
                </View>
                <Text style={[styles.featureTitle, { textAlign: rtl ? 'right' : 'left' }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { textAlign: rtl ? 'right' : 'left' }]}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        </View>


        {/* Contact and Links */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: rtl ? 'right' : 'left' }]}>
            روابط مهمة
          </Text>
          <TouchableOpacity
            style={[styles.linkItem, { flexDirection: rtl ? 'row-reverse' : 'row' }]}
            onPress={() => handleLinkPress('https://www.lifemakers.org')}
          >
            <Ionicons name="globe" size={20} color={COLORS.primary} />
            <Text style={[styles.linkText, { marginLeft: rtl ? 0 : SIZES.sm, marginRight: rtl ? SIZES.sm : 0 }]}>
              الموقع الرسمي
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkItem, { flexDirection: rtl ? 'row-reverse' : 'row' }]}
            onPress={() => handleLinkPress('mailto:support@lifemakers.org')}
          >
            <Ionicons name="mail" size={20} color={COLORS.primary} />
            <Text style={[styles.linkText, { marginLeft: rtl ? 0 : SIZES.sm, marginRight: rtl ? SIZES.sm : 0 }]}>
              الدعم الفني
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkItem, { flexDirection: rtl ? 'row-reverse' : 'row' }]}
            onPress={() => handleLinkPress('https://www.lifemakers.org/privacy')}
          >
            <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
            <Text style={[styles.linkText, { marginLeft: rtl ? 0 : SIZES.sm, marginRight: rtl ? SIZES.sm : 0 }]}>
              سياسة الخصوصية
            </Text>
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <View style={styles.copyrightSection}>
          <Text style={[styles.copyrightText, { textAlign: rtl ? 'right' : 'left' }]}>
            © 2024 مؤسسة صناع الحياة
          </Text>
          <Text style={[styles.copyrightText, { textAlign: rtl ? 'right' : 'left' }]}>
            جميع الحقوق محفوظة
          </Text>
        </View>
      </ScrollView>
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
  appInfoSection: {
    alignItems: 'center',
    padding: SIZES.xl,
    backgroundColor: COLORS.light.card,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  appName: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.light.text,
    textAlign: 'center',
    marginBottom: SIZES.xs,
  },
  appVersion: {
    fontSize: SIZES.h6,
    color: COLORS.light.textSecondary,
    marginBottom: SIZES.md,
  },
  appDescription: {
    fontSize: SIZES.caption,
    color: COLORS.light.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  section: {
    padding: SIZES.lg,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginBottom: SIZES.md,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: COLORS.light.card,
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  featureTitle: {
    fontSize: SIZES.h6,
    fontWeight: '600',
    color: COLORS.light.text,
    marginBottom: SIZES.xs,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: SIZES.caption,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  techStack: {
    backgroundColor: COLORS.light.card,
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.md,
  },
  techItem: {
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border,
  },
  techName: {
    fontSize: SIZES.h6,
    fontWeight: '600',
    color: COLORS.light.text,
  },
  techDescription: {
    fontSize: SIZES.caption,
    color: COLORS.light.textSecondary,
    marginTop: SIZES.xs,
  },
  teamMember: {
    alignItems: 'center',
    backgroundColor: COLORS.light.card,
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: SIZES.h6,
    fontWeight: '600',
    color: COLORS.light.text,
  },
  memberRole: {
    fontSize: SIZES.caption,
    color: COLORS.light.textSecondary,
    marginTop: SIZES.xs,
  },
  linkItem: {
    alignItems: 'center',
    backgroundColor: COLORS.light.card,
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
  },
  linkText: {
    fontSize: SIZES.h6,
    color: COLORS.primary,
    fontWeight: '500',
  },
  copyrightSection: {
    alignItems: 'center',
    padding: SIZES.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.light.border,
  },
  copyrightText: {
    fontSize: SIZES.caption,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
  },
});
