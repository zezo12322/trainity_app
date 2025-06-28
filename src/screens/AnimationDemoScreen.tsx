import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  FadeInView,
  SlideInView,
  ScaleInView,
  PulseView,
  RotateView,
  BounceView,
  LoadingSpinner,
  FloatingButton,
  AnimatedCard,
} from '../components/animations';
import { useTheme } from '../contexts/ThemeContext';

export const AnimationDemoScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { colors } = theme;
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshAnimations = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <FadeInView delay={100}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              🎨 Animation Demo
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              عرض الحركات والتأثيرات
            </Text>
          </View>
        </FadeInView>

        {/* Refresh Button */}
        <ScaleInView delay={200}>
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.primary }]}
            onPress={refreshAnimations}
          >
            <Ionicons name="refresh" size={20} color={colors.surface} />
            <Text style={[styles.refreshText, { color: colors.surface }]}>
              إعادة تشغيل الحركات
            </Text>
          </TouchableOpacity>
        </ScaleInView>

        {/* FadeIn Demo */}
        <AnimatedCard key={`fade-${refreshKey}`} delay={300}>
          <View style={styles.demoCard}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              🌟 FadeIn Animation
            </Text>
            <FadeInView delay={500} duration={1500}>
              <View style={[styles.demoBox, { backgroundColor: colors.primary }]}>
                <Text style={[styles.demoText, { color: colors.surface }]}>
                  ظهور تدريجي
                </Text>
              </View>
            </FadeInView>
          </View>
        </AnimatedCard>

        {/* SlideIn Demo */}
        <AnimatedCard key={`slide-${refreshKey}`} delay={400}>
          <View style={styles.demoCard}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              ➡️ SlideIn Animation
            </Text>
            <View style={styles.slideContainer}>
              <SlideInView key={`slide-left-${refreshKey}`} direction="left" delay={600}>
                <View style={[styles.smallBox, { backgroundColor: colors.success }]}>
                  <Text style={styles.smallText}>من اليسار</Text>
                </View>
              </SlideInView>
              <SlideInView key={`slide-right-${refreshKey}`} direction="right" delay={800}>
                <View style={[styles.smallBox, { backgroundColor: colors.warning }]}>
                  <Text style={styles.smallText}>من اليمين</Text>
                </View>
              </SlideInView>
            </View>
          </View>
        </AnimatedCard>

        {/* ScaleIn Demo */}
        <AnimatedCard key={`scale-${refreshKey}`} delay={500}>
          <View style={styles.demoCard}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              🔍 ScaleIn Animation
            </Text>
            <ScaleInView key={`scale-${refreshKey}`} delay={700} duration={800}>
              <View style={[styles.demoBox, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.demoText, { color: colors.surface }]}>
                  تكبير تدريجي
                </Text>
              </View>
            </ScaleInView>
          </View>
        </AnimatedCard>

        {/* Pulse Demo */}
        <AnimatedCard delay={600}>
          <View style={styles.demoCard}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              💓 Pulse Animation
            </Text>
            <PulseView duration={1500} minScale={0.9} maxScale={1.1}>
              <View style={[styles.demoBox, { backgroundColor: colors.error }]}>
                <Text style={[styles.demoText, { color: colors.surface }]}>
                  نبضة مستمرة
                </Text>
              </View>
            </PulseView>
          </View>
        </AnimatedCard>

        {/* Rotate Demo */}
        <AnimatedCard delay={700}>
          <View style={styles.demoCard}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              🔄 Rotate Animation
            </Text>
            <RotateView duration={3000}>
              <View style={[styles.demoBox, { backgroundColor: colors.secondary }]}>
                <Ionicons name="settings" size={30} color={colors.surface} />
              </View>
            </RotateView>
          </View>
        </AnimatedCard>

        {/* Bounce Demo */}
        <AnimatedCard key={`bounce-${refreshKey}`} delay={800}>
          <View style={styles.demoCard}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              ⬆️ Bounce Animation
            </Text>
            <BounceView key={`bounce-${refreshKey}`} delay={900} duration={1000}>
              <View style={[styles.demoBox, { backgroundColor: colors.success }]}>
                <Text style={[styles.demoText, { color: colors.surface }]}>
                  قفزة واحدة
                </Text>
              </View>
            </BounceView>
          </View>
        </AnimatedCard>

        {/* Loading Spinner Demo */}
        <AnimatedCard delay={900}>
          <View style={styles.demoCard}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              ⏳ Loading Spinner
            </Text>
            <View style={styles.spinnerContainer}>
              <LoadingSpinner size="small" />
              <LoadingSpinner size="medium" />
              <LoadingSpinner size="large" />
            </View>
          </View>
        </AnimatedCard>

        {/* Floating Button Demo */}
        <View style={styles.floatingContainer}>
          <FloatingButton
            onPress={() => alert('Floating Button Pressed!')}
            icon="add"
            pulse={true}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  refreshText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  demoCard: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  demoBox: {
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoText: {
    fontSize: 16,
    fontWeight: '600',
  },
  slideContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallBox: {
    width: 120,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  spinnerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
  },
  floatingContainer: {
    position: 'relative',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
});
