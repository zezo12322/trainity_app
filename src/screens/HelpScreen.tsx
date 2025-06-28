import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants';
import { isRTL } from '../services/i18n';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface ContactMethod {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  action: () => void;
}

export const HelpScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const rtl = isRTL();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'كيف يمكنني إنشاء طلب تدريب جديد؟',
      answer: 'يمكنك إنشاء طلب تدريب جديد من خلال الذهاب إلى شاشة "طلبات التدريب" والضغط على زر "طلب جديد". املأ جميع المعلومات المطلوبة واضغط على "إرسال الطلب".',
    },
    {
      id: '2',
      question: 'كم يستغرق الحصول على موافقة على طلب التدريب؟',
      answer: 'عادة ما يستغرق الحصول على الموافقة من 3-5 أيام عمل. ستتلقى إشعارات عند تغيير حالة طلبك.',
    },
    {
      id: '3',
      question: 'كيف يمكنني تتبع حالة طلب التدريب؟',
      answer: 'يمكنك تتبع حالة طلبك من خلال شاشة "طلبات التدريب" أو من خلال الإشعارات التي ستصلك عند كل تحديث.',
    },
    {
      id: '4',
      question: 'هل يمكنني تعديل طلب التدريب بعد إرساله؟',
      answer: 'يمكنك تعديل طلب التدريب فقط إذا كان في حالة "قيد المراجعة". بعد الموافقة عليه، لا يمكن تعديله.',
    },
    {
      id: '5',
      question: 'كيف يمكنني استخدام نظام المحادثات؟',
      answer: 'يمكنك الوصول إلى المحادثات من خلال تبويب "المحادثات". يمكنك إنشاء محادثات فردية أو جماعية حسب صلاحياتك.',
    },
    {
      id: '6',
      question: 'كيف يمكنني تغيير كلمة المرور؟',
      answer: 'اذهب إلى "الملف الشخصي" ثم "الإعدادات" واختر "تغيير كلمة المرور". ستحتاج إلى إدخال كلمة المرور الحالية والجديدة.',
    },
  ];

  const contactMethods: ContactMethod[] = [
    {
      id: '1',
      title: 'البريد الإلكتروني',
      subtitle: 'support@lifemakers.org',
      icon: 'mail',
      action: () => {
        Linking.openURL('mailto:support@lifemakers.org?subject=مساعدة في تطبيق صناع الحياة');
      },
    },
    {
      id: '2',
      title: 'الهاتف',
      subtitle: '+966 11 123 4567',
      icon: 'call',
      action: () => {
        Linking.openURL('tel:+966111234567');
      },
    },
    {
      id: '3',
      title: 'واتساب',
      subtitle: '+966 50 123 4567',
      icon: 'logo-whatsapp',
      action: () => {
        Linking.openURL('https://wa.me/966501234567?text=مرحباً، أحتاج مساعدة في تطبيق صناع الحياة');
      },
    },
    {
      id: '4',
      title: 'الموقع الإلكتروني',
      subtitle: 'www.lifemakers.org',
      icon: 'globe',
      action: () => {
        Linking.openURL('https://www.lifemakers.org');
      },
    },
  ];

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleContactPress = (method: ContactMethod) => {
    try {
      method.action();
    } catch (error) {
      Alert.alert('خطأ', 'لا يمكن فتح هذا الرابط');
    }
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
            المساعدة والدعم
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: rtl ? 'right' : 'left' }]}>
            إجراءات سريعة
          </Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="document-text" size={32} color={COLORS.primary} />
              <Text style={styles.quickActionTitle}>دليل المستخدم</Text>
              <Text style={styles.quickActionSubtitle}>تعلم كيفية استخدام التطبيق</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="play-circle" size={32} color={COLORS.success} />
              <Text style={styles.quickActionTitle}>فيديوهات تعليمية</Text>
              <Text style={styles.quickActionSubtitle}>شاهد الشروحات المرئية</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: rtl ? 'right' : 'left' }]}>
            الأسئلة الشائعة
          </Text>
          {faqItems.map((item) => (
            <View key={item.id} style={styles.faqItem}>
              <TouchableOpacity
                style={[styles.faqQuestion, { flexDirection: rtl ? 'row-reverse' : 'row' }]}
                onPress={() => toggleFAQ(item.id)}
              >
                <Text style={[styles.faqQuestionText, { textAlign: rtl ? 'right' : 'left' }]}>
                  {item.question}
                </Text>
                <Ionicons
                  name={expandedFAQ === item.id ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={COLORS.light.textSecondary}
                />
              </TouchableOpacity>
              {expandedFAQ === item.id && (
                <View style={styles.faqAnswer}>
                  <Text style={[styles.faqAnswerText, { textAlign: rtl ? 'right' : 'left' }]}>
                    {item.answer}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: rtl ? 'right' : 'left' }]}>
            تواصل معنا
          </Text>
          {contactMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.contactItem, { flexDirection: rtl ? 'row-reverse' : 'row' }]}
              onPress={() => handleContactPress(method)}
            >
              <View style={styles.contactIcon}>
                <Ionicons name={method.icon as any} size={24} color={COLORS.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactTitle, { textAlign: rtl ? 'right' : 'left' }]}>
                  {method.title}
                </Text>
                <Text style={[styles.contactSubtitle, { textAlign: rtl ? 'right' : 'left' }]}>
                  {method.subtitle}
                </Text>
              </View>
              <Ionicons
                name={rtl ? 'chevron-back' : 'chevron-forward'}
                size={20}
                color={COLORS.light.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: rtl ? 'right' : 'left' }]}>
            معلومات التطبيق
          </Text>
          <View style={styles.appInfo}>
            <Text style={[styles.appInfoText, { textAlign: rtl ? 'right' : 'left' }]}>
              إصدار التطبيق: 1.0.0
            </Text>
            <Text style={[styles.appInfoText, { textAlign: rtl ? 'right' : 'left' }]}>
              آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
            </Text>
            <Text style={[styles.appInfoText, { textAlign: rtl ? 'right' : 'left' }]}>
              © 2024 صناع الحياة. جميع الحقوق محفوظة.
            </Text>
          </View>
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
  section: {
    marginTop: SIZES.md,
    paddingHorizontal: SIZES.lg,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginBottom: SIZES.md,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: COLORS.light.card,
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.md,
    alignItems: 'center',
    marginHorizontal: SIZES.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionTitle: {
    fontSize: SIZES.h6,
    fontWeight: '600',
    color: COLORS.light.text,
    marginTop: SIZES.sm,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: SIZES.caption,
    color: COLORS.light.textSecondary,
    marginTop: SIZES.xs,
    textAlign: 'center',
  },
  faqItem: {
    backgroundColor: COLORS.light.card,
    borderRadius: SIZES.radiusMedium,
    marginBottom: SIZES.sm,
    overflow: 'hidden',
  },
  faqQuestion: {
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.md,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: SIZES.h6,
    fontWeight: '600',
    color: COLORS.light.text,
  },
  faqAnswer: {
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.light.border,
  },
  faqAnswerText: {
    fontSize: SIZES.caption,
    color: COLORS.light.textSecondary,
    lineHeight: 20,
  },
  contactItem: {
    alignItems: 'center',
    backgroundColor: COLORS.light.card,
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: SIZES.h6,
    fontWeight: '600',
    color: COLORS.light.text,
  },
  contactSubtitle: {
    fontSize: SIZES.caption,
    color: COLORS.light.textSecondary,
    marginTop: SIZES.xs,
  },
  appInfo: {
    backgroundColor: COLORS.light.card,
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.md,
  },
  appInfoText: {
    fontSize: SIZES.caption,
    color: COLORS.light.textSecondary,
    marginBottom: SIZES.xs,
  },
});
