import React, { useEffect, startTransition } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { View, ActivityIndicator, I18nManager } from 'react-native';

import { useAuthStore } from '../stores/authStore';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { TrainingRequestsScreen } from '../screens/TrainingRequestsScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ChatRoomScreen } from '../screens/ChatRoomScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { TrainingRequestDetailScreen } from '../screens/TrainingRequestDetailScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { HelpScreen } from '../screens/HelpScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { CreateTrainingRequestScreen } from '../screens/CreateTrainingRequestScreen';
import { isRTL } from '../services/i18n';

import { COLORS, SIZES } from '../constants';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const LoadingScreen: React.FC = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color={COLORS.primary} />
  </View>
);

const TabNavigator: React.FC = () => {
  const { t } = useTranslation();
  const rtl = isRTL();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'TrainingRequests':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            case 'Calendar':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Chat':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'Analytics':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.light.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.light.background,
          borderTopColor: COLORS.light.border,
          paddingBottom: SIZES.xs,
          paddingTop: SIZES.xs,
          height: 60,
          flexDirection: rtl ? 'row-reverse' : 'row',
        },
        tabBarLabelStyle: {
          fontSize: SIZES.caption,
          fontWeight: '500',
          textAlign: rtl ? 'right' : 'left',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: t('navigation.dashboard') || 'لوحة التحكم',
        }}
      />
      <Tab.Screen
        name="TrainingRequests"
        component={TrainingRequestsScreen}
        options={{
          title: t('navigation.trainingRequests') || 'طلبات التدريب',
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          title: t('navigation.calendar') || 'التقويم',
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: t('navigation.chat') || 'المحادثة',
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: t('navigation.analytics') || 'التحليلات',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t('navigation.profile') || 'الملف الشخصي',
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();
  const rtl = isRTL();

  useEffect(() => {
    startTransition(() => {
      loadUser();
    });
  }, [loadUser]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationTypeForReplace: 'push',
        gestureDirection: rtl ? 'horizontal-inverted' : 'horizontal',
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="TrainingRequestDetail" component={TrainingRequestDetailScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="Help" component={HelpScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="CreateTrainingRequest" component={CreateTrainingRequestScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};
