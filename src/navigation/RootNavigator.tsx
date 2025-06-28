import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants';
import { AppNavigator } from './AppNavigator';
import { RateTrainingScreen } from '../screens/RateTrainingScreen';
import { ViewRatingsScreen } from '../screens/ViewRatingsScreen';
import { TrainingRequestDetailScreen } from '../screens/TrainingRequestDetailScreen';
import { ChatRoomScreen } from '../screens/ChatRoomScreen';
import { CreateTrainingRequestScreen } from '../screens/CreateTrainingRequestScreen';

const Stack = createStackNavigator();

export const RootNavigator: React.FC = () => {
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
      }}
    >
      {/* Main App Tabs */}
      <Stack.Screen
        name="MainTabs"
        component={AppNavigator}
        options={{ headerShown: false }}
      />

      {/* Rating Screens */}
      <Stack.Screen
        name="RateTraining"
        component={RateTrainingScreen}
        options={{
          title: t('ratings.rateTraining'),
          headerBackTitle: t('common.back'),
        }}
      />

      <Stack.Screen
        name="ViewRatings"
        component={ViewRatingsScreen}
        options={{
          title: t('ratings.viewRatings'),
          headerBackTitle: t('common.back'),
        }}
      />

      {/* Training Request Screens */}
      <Stack.Screen
        name="TrainingRequestDetail"
        component={TrainingRequestDetailScreen}
        options={{
          title: t('trainingRequests.details'),
          headerBackTitle: t('common.back'),
        }}
      />

      <Stack.Screen
        name="CreateTrainingRequest"
        component={CreateTrainingRequestScreen}
        options={{
          title: t('trainingRequests.create'),
          headerBackTitle: t('common.back'),
        }}
      />

      {/* Chat Screens */}
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={({ route }) => ({
          title: (route.params as any)?.roomName || t('chat.title'),
          headerBackTitle: t('common.back'),
        })}
      />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
