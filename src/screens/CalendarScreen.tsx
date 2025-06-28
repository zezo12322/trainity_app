import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants';
import { isRTL } from '../services/i18n';
import dashboardService from '../services/dashboardService';
import trainingRequestService from '../services/trainingRequestService';

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: 'training' | 'meeting' | 'deadline';
  location: string;
  date: string;
}

export const CalendarScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const rtl = isRTL();

  // Load calendar events
  const loadCalendarEvents = async () => {
    try {
      setIsLoading(true);
      const currentDate = new Date(selectedDate);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const calendarEvents = await dashboardService.getCalendarEvents(year, month);
      const eventsForSelectedDate = await getEventsForDate(selectedDate);

      setEvents(eventsForSelectedDate);
      setMarkedDates({
        [selectedDate]: {
          selected: true,
          selectedColor: COLORS.primary,
        },
        ...calendarEvents
      });
    } catch (error) {
      console.error('Error loading calendar events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get events for specific date
  const getEventsForDate = async (date: string): Promise<CalendarEvent[]> => {
    try {
      const trainings = await trainingRequestService.getTrainingCalendarEvents(date, date);

      return trainings.map(training => ({
        id: training.id,
        title: training.title,
        time: formatTrainingTime(training.date, 8), // Default 8 hours
        type: 'training' as const,
        location: training.province || 'غير محدد',
        date: training.date
      }));
    } catch (error) {
      console.error('Error loading events for date:', error);
      return [];
    }
  };

  // Format training time
  const formatTrainingTime = (date: string, durationHours: number): string => {
    const startHour = 9; // Default start time 9 AM
    const endHour = startHour + durationHours;
    return `${startHour.toString().padStart(2, '0')}:00 - ${endHour.toString().padStart(2, '0')}:00`;
  };

  // Load data on focus
  useFocusEffect(
    useCallback(() => {
      loadCalendarEvents();
    }, [selectedDate])
  );

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCalendarEvents();
    setRefreshing(false);
  }, [selectedDate]);

  // Handle date selection
  const handleDayPress = async (day: any) => {
    setSelectedDate(day.dateString);
    const eventsForDate = await getEventsForDate(day.dateString);
    setEvents(eventsForDate);
  };

  // Handle create new event
  const handleCreateEvent = () => {
    Alert.alert(
      'إنشاء حدث جديد',
      'اختر نوع الحدث',
      [
        {
          text: 'طلب تدريب',
          onPress: () => (navigation as any).navigate('TrainingRequests'),
        },
        {
          text: 'إلغاء',
          style: 'cancel',
        },
      ]
    );
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'training':
        return 'school';
      case 'meeting':
        return 'people';
      default:
        return 'calendar';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'training':
        return COLORS.primary;
      case 'meeting':
        return COLORS.secondary;
      default:
        return COLORS.info;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>جاري تحميل التقويم...</Text>
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
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={{
              backgroundColor: COLORS.light.background,
              calendarBackground: COLORS.light.background,
              textSectionTitleColor: COLORS.light.text,
              selectedDayBackgroundColor: COLORS.primary,
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: COLORS.primary,
              dayTextColor: COLORS.light.text,
              textDisabledColor: COLORS.light.textSecondary,
              dotColor: COLORS.primary,
              selectedDotColor: '#FFFFFF',
              arrowColor: COLORS.primary,
              monthTextColor: COLORS.light.text,
              indicatorColor: COLORS.primary,
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
            firstDay={6} // Saturday as first day for Arabic calendar
          />
        </View>

        <View style={styles.eventsContainer}>
          <Text style={[styles.sectionTitle, { textAlign: rtl ? 'right' : 'left' }]}>
            أحداث يوم {new Date(selectedDate).toLocaleDateString('ar-SA')}
          </Text>

          {events.length > 0 ? (
            events.map((event) => (
              <TouchableOpacity key={event.id} style={styles.eventItem} activeOpacity={0.7}>
                <View style={[styles.eventContent, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.eventIcon, { backgroundColor: `${getEventColor(event.type)}20` }]}>
                    <Ionicons
                      name={getEventIcon(event.type) as any}
                      size={24}
                      color={getEventColor(event.type)}
                    />
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={[styles.eventTitle, { textAlign: rtl ? 'right' : 'left' }]}>
                      {event.title}
                    </Text>
                    <Text style={[styles.eventTime, { textAlign: rtl ? 'right' : 'left' }]}>
                      {event.time}
                    </Text>
                    <Text style={[styles.eventLocation, { textAlign: rtl ? 'right' : 'left' }]}>
                      📍 {event.location}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noEventsContainer}>
              <Ionicons name="calendar-outline" size={64} color={COLORS.light.textSecondary} />
              <Text style={[styles.noEventsText, { textAlign: rtl ? 'right' : 'left' }]}>
                لا توجد أحداث في هذا اليوم
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={handleCreateEvent}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
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
  calendarContainer: {
    backgroundColor: COLORS.light.card,
    margin: SIZES.lg,
    borderRadius: SIZES.radiusMedium,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventsContainer: {
    padding: SIZES.lg,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginBottom: SIZES.md,
  },
  eventItem: {
    backgroundColor: COLORS.light.card,
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  eventContent: {
    alignItems: 'center',
  },
  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: SIZES.h5,
    fontWeight: '600',
    color: COLORS.light.text,
    marginBottom: SIZES.xs,
  },
  eventTime: {
    fontSize: SIZES.h6,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: SIZES.xs,
  },
  eventLocation: {
    fontSize: SIZES.caption,
    color: COLORS.light.textSecondary,
  },
  noEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xxl,
  },
  noEventsText: {
    fontSize: SIZES.h5,
    color: COLORS.light.textSecondary,
    marginTop: SIZES.md,
  },
  fab: {
    position: 'absolute',
    bottom: SIZES.lg,
    right: SIZES.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
