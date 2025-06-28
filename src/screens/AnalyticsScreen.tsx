import React, { useState, useEffect, useCallback, startTransition } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants';
import { isRTL } from '../services/i18n';
import analyticsService, { AnalyticsData } from '../services/analyticsService';

const { width } = Dimensions.get('window');

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, changeType, icon }) => {
  const rtl = isRTL();

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return COLORS.success;
      case 'negative':
        return COLORS.error;
      default:
        return COLORS.light.textSecondary;
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return 'trending-up';
      case 'negative':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricHeader, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
        <View style={[styles.metricIcon, { backgroundColor: `${COLORS.primary}20` }]}>
          <Ionicons name={icon as any} size={24} color={COLORS.primary} />
        </View>
        <View style={styles.metricInfo}>
          <Text style={[styles.metricTitle, { textAlign: rtl ? 'right' : 'left' }]}>
            {title}
          </Text>
          <Text style={[styles.metricValue, { textAlign: rtl ? 'right' : 'left' }]}>
            {value}
          </Text>
        </View>
      </View>
      <View style={[styles.metricChange, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
        <Ionicons name={getChangeIcon() as any} size={16} color={getChangeColor()} />
        <Text style={[styles.metricChangeText, { color: getChangeColor(), marginLeft: rtl ? 0 : SIZES.xs, marginRight: rtl ? SIZES.xs : 0 }]}>
          {change}
        </Text>
      </View>
    </View>
  );
};

interface ChartCardProps {
  title: string;
  data: { label: string; value: number; color: string }[];
}

const ChartCard: React.FC<ChartCardProps> = ({ title, data }) => {
  const rtl = isRTL();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <View style={styles.chartCard}>
      <Text style={[styles.chartTitle, { textAlign: rtl ? 'right' : 'left' }]}>
        {title}
      </Text>
      <View style={styles.chartContainer}>
        {data.map((item, index) => (
          <View key={index} style={[styles.chartItem, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            <View style={[styles.chartLegend, { backgroundColor: item.color }]} />
            <View style={styles.chartItemInfo}>
              <Text style={[styles.chartLabel, { textAlign: rtl ? 'right' : 'left' }]}>
                {item.label}
              </Text>
              <Text style={[styles.chartValue, { textAlign: rtl ? 'right' : 'left' }]}>
                {item.value} ({Math.round((item.value / total) * 100)}%)
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export const AnalyticsScreen: React.FC = () => {
  const { t } = useTranslation();
  const rtl = isRTL();

  // State
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load analytics data
  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await analyticsService.getAnalyticsData();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  }, []);

  // Load data on focus
  useFocusEffect(
    useCallback(() => {
      startTransition(() => {
        loadAnalyticsData();
      });
    }, [])
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>جاري تحميل البيانات...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !analyticsData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error || 'فشل في تحميل البيانات'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { textAlign: rtl ? 'right' : 'left' }]}>
            التحليلات والإحصائيات
          </Text>
          <Text style={[styles.headerSubtitle, { textAlign: rtl ? 'right' : 'left' }]}>
            نظرة عامة - {new Date().toLocaleDateString('ar-SA')}
          </Text>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          {analyticsData.metrics.map((metric, index) => (
            <View key={index} style={styles.metricCardContainer}>
              <MetricCard {...metric} />
            </View>
          ))}
        </View>

        {/* Charts */}
        <View style={styles.chartsContainer}>
          <ChartCard
            title="إحصائيات المحافظات"
            data={analyticsData.provinceStats}
          />

          <ChartCard
            title="توزيع حالات الطلبات"
            data={analyticsData.statusStats}
          />
        </View>

        {/* Performance Indicators */}
        <View style={styles.performanceContainer}>
          <Text style={[styles.sectionTitle, { textAlign: rtl ? 'right' : 'left' }]}>
            مؤشرات الأداء
          </Text>

          <View style={styles.performanceGrid}>
            <View style={styles.performanceItem}>
              <Text style={[styles.performanceLabel, { textAlign: rtl ? 'right' : 'left' }]}>
                معدل الاستجابة
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${analyticsData.performanceIndicators.responseRate}%`, backgroundColor: COLORS.success }]} />
              </View>
              <Text style={[styles.performanceValue, { textAlign: rtl ? 'right' : 'left' }]}>
                {analyticsData.performanceIndicators.responseRate}%
              </Text>
            </View>

            <View style={styles.performanceItem}>
              <Text style={[styles.performanceLabel, { textAlign: rtl ? 'right' : 'left' }]}>
                جودة التدريب
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${analyticsData.performanceIndicators.trainingQuality}%`, backgroundColor: COLORS.primary }]} />
              </View>
              <Text style={[styles.performanceValue, { textAlign: rtl ? 'right' : 'left' }]}>
                {analyticsData.performanceIndicators.trainingQuality}%
              </Text>
            </View>

            <View style={styles.performanceItem}>
              <Text style={[styles.performanceLabel, { textAlign: rtl ? 'right' : 'left' }]}>
                الالتزام بالمواعيد
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${analyticsData.performanceIndicators.timeCompliance}%`, backgroundColor: COLORS.warning }]} />
              </View>
              <Text style={[styles.performanceValue, { textAlign: rtl ? 'right' : 'left' }]}>
                {analyticsData.performanceIndicators.timeCompliance}%
              </Text>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.md,
    fontSize: SIZES.body,
    color: COLORS.light.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
  },
  errorText: {
    marginTop: SIZES.md,
    fontSize: SIZES.body,
    color: COLORS.error,
    textAlign: 'center',
  },
  header: {
    padding: SIZES.lg,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: SIZES.xs,
  },
  headerSubtitle: {
    fontSize: SIZES.h6,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SIZES.lg,
    justifyContent: 'space-between',
  },
  metricCardContainer: {
    width: (width - SIZES.lg * 3) / 2,
    marginBottom: SIZES.md,
  },
  metricCard: {
    backgroundColor: COLORS.light.card,
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricHeader: {
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.sm,
  },
  metricInfo: {
    flex: 1,
  },
  metricTitle: {
    fontSize: SIZES.caption,
    color: COLORS.light.textSecondary,
    marginBottom: SIZES.xs,
  },
  metricValue: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  metricChange: {
    alignItems: 'center',
  },
  metricChangeText: {
    fontSize: SIZES.caption,
    fontWeight: '500',
  },
  chartsContainer: {
    padding: SIZES.lg,
  },
  chartCard: {
    backgroundColor: COLORS.light.card,
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginBottom: SIZES.md,
  },
  chartContainer: {
    marginTop: SIZES.sm,
  },
  chartItem: {
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  chartLegend: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SIZES.sm,
  },
  chartItemInfo: {
    flex: 1,
  },
  chartLabel: {
    fontSize: SIZES.h6,
    color: COLORS.light.text,
    fontWeight: '500',
  },
  chartValue: {
    fontSize: SIZES.caption,
    color: COLORS.light.textSecondary,
  },
  performanceContainer: {
    padding: SIZES.lg,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginBottom: SIZES.md,
  },
  performanceGrid: {
    backgroundColor: COLORS.light.card,
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  performanceItem: {
    marginBottom: SIZES.lg,
  },
  performanceLabel: {
    fontSize: SIZES.h6,
    color: COLORS.light.text,
    fontWeight: '500',
    marginBottom: SIZES.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.light.border,
    borderRadius: 4,
    marginBottom: SIZES.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  performanceValue: {
    fontSize: SIZES.h6,
    color: COLORS.light.textSecondary,
    fontWeight: '500',
  },
});
