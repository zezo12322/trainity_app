import React, { useState, useEffect, useCallback, startTransition } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { isRTL, getCurrentLanguage } from '../services/i18n';
import { NetworkStatus } from '../components/NetworkStatus';
import { LANGUAGES } from '../constants';
import dashboardService, { DashboardTraining, DashboardStats } from '../services/dashboardService';
import { FadeInView, SlideInView, ScaleInView, AnimatedCard } from '../components/animations';

export const DashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const currentDate = new Date();
  const rtl = isRTL();
  const currentLang = getCurrentLanguage();

  // State
  const [upcomingTrainings, setUpcomingTrainings] = useState<DashboardTraining[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    completedTrainings: 0,
    upcomingTrainings: 0
  });
  const [calendarEvents, setCalendarEvents] = useState<Record<string, any>>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(currentDate.toISOString().split('T')[0]);

  const currentMonth = currentDate.toLocaleDateString(
    currentLang === LANGUAGES.ARABIC ? 'ar-SA' : 'en-US',
    { month: 'long', year: 'numeric' }
  );

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      const [trainings, stats, events, recentNotifications] = await Promise.all([
        dashboardService.getUpcomingTrainings(),
        dashboardService.getDashboardStats(),
        dashboardService.getCalendarEvents(currentDate.getFullYear(), currentDate.getMonth()),
        dashboardService.getRecentNotifications(5)
      ]);

      setUpcomingTrainings(trainings);
      setDashboardStats(stats);
      setCalendarEvents(dashboardService.getMarkedDates(events));
      setNotifications(recentNotifications);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, []);

  // Load data on focus
  useFocusEffect(
    useCallback(() => {
      startTransition(() => {
        loadDashboardData();
      });
    }, [])
  );

  const markedDates = {
    [currentDate.toISOString().split('T')[0]]: {
      selected: true,
      selectedColor: '#007AFF',
    },
    ...calendarEvents
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        {/* Network Status */}
        <NetworkStatus />

        {/* Header */}
        <View style={[styles.header, rtl && styles.headerRTL]}>
          <Text style={[styles.title, rtl && styles.textRTL]}>{t('app.name')}</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#1C1C1E" />
            {notifications.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {notifications.length > 9 ? '9+' : notifications.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="document-text" size={24} color="#007AFF" />
              <Text style={styles.statNumber}>{dashboardStats.totalRequests}</Text>
              <Text style={styles.statLabel}>إجمالي الطلبات</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color="#FF9500" />
              <Text style={styles.statNumber}>{dashboardStats.pendingRequests}</Text>
              <Text style={styles.statLabel}>قيد الانتظار</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color="#34C759" />
              <Text style={styles.statNumber}>{dashboardStats.completedTrainings}</Text>
              <Text style={styles.statLabel}>مكتملة</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="calendar" size={24} color="#5856D6" />
              <Text style={styles.statNumber}>{dashboardStats.upcomingTrainings}</Text>
              <Text style={styles.statLabel}>قادمة</Text>
            </View>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <View style={[styles.calendarHeader, rtl && styles.calendarHeaderRTL]}>
            <TouchableOpacity>
              <Ionicons
                name={rtl ? "chevron-forward" : "chevron-back"}
                size={24}
                color="#1C1C1E"
              />
            </TouchableOpacity>
            <Text style={[styles.calendarTitle, rtl && styles.textRTL]}>{currentMonth}</Text>
            <TouchableOpacity>
              <Ionicons
                name={rtl ? "chevron-back" : "chevron-forward"}
                size={24}
                color="#1C1C1E"
              />
            </TouchableOpacity>
          </View>

          <Calendar
            current={currentDate.toISOString().split('T')[0]}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#8E8E93',
              selectedDayBackgroundColor: '#007AFF',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#007AFF',
              dayTextColor: '#1C1C1E',
              textDisabledColor: '#d9e1e8',
              dotColor: '#007AFF',
              selectedDotColor: '#ffffff',
              arrowColor: '#007AFF',
              disabledArrowColor: '#d9e1e8',
              monthTextColor: '#1C1C1E',
              indicatorColor: '#007AFF',
              textDayFontFamily: 'System',
              textMonthFontFamily: 'System',
              textDayHeaderFontFamily: 'System',
              textDayFontWeight: '400',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 13,
            }}
            hideExtraDays={true}
            firstDay={0}
          />
        </View>

        {/* Upcoming Trainings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, rtl && styles.textRTL]}>التدريبات القادمة</Text>
          <View style={styles.trainingsContainer}>
            {upcomingTrainings.length > 0 ? (
              upcomingTrainings.map((training) => (
                <TouchableOpacity key={training.id} style={[styles.trainingCard, rtl && styles.trainingCardRTL]}>
                  <View style={[styles.trainingIcon, { backgroundColor: training.color + '20' }, rtl && styles.trainingIconRTL]}>
                    <Ionicons name={training.icon as any} size={24} color={training.color} />
                  </View>
                  <View style={styles.trainingInfo}>
                    <Text style={[styles.trainingTitle, rtl && styles.textRTL]}>{training.title}</Text>
                    <Text style={[styles.trainingTime, rtl && styles.textRTL]}>{training.time}</Text>
                    <Text style={[styles.trainingProvince, rtl && styles.textRTL]}>{training.province}</Text>
                  </View>
                  <Ionicons
                    name={rtl ? "chevron-back" : "chevron-forward"}
                    size={20}
                    color="#8E8E93"
                  />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color="#8E8E93" />
                <Text style={styles.emptyStateText}>لا توجد تدريبات قادمة</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
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
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  textRTL: {
    textAlign: 'right',
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingBottom: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  calendarHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  trainingsContainer: {
    gap: 12,
  },
  trainingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  trainingCardRTL: {
    flexDirection: 'row-reverse',
  },
  trainingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  trainingIconRTL: {
    marginRight: 0,
    marginLeft: 16,
  },
  trainingInfo: {
    flex: 1,
  },
  trainingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  trainingTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  trainingProvince: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
    textAlign: 'center',
  },
});
