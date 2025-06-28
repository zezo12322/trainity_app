// Load web polyfills first on web platform
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  require('./web-polyfills');
}
import 'react-native-gesture-handler';
import React, { useEffect, startTransition } from 'react';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';
import { I18nManager, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import i18n, { getCurrentLanguage } from './src/services/i18n';
import { LANGUAGES } from './src/constants';
import { forceRTLUpdate } from './src/utils/rtl';
import { useAuthStore } from './src/stores/authStore';
import { testSupabaseConnection } from './src/utils/testConnection';

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 App startup - Initializing...');

        // Initialize auth store
        startTransition(() => {
          initialize();
        });
        console.log('✅ Auth store initialized');

        // Test Supabase connection (non-blocking)
        testSupabaseConnection().catch(error => {
          console.warn('⚠️ Supabase connection test failed:', error);
        });

        // Set up RTL support
        try {
          const currentLang = getCurrentLanguage();
          const shouldBeRTL = currentLang === LANGUAGES.ARABIC;

          console.log('🚀 App startup - Current language:', currentLang);
          console.log('🚀 App startup - Should be RTL:', shouldBeRTL);

          // Enable RTL support
          I18nManager.allowRTL(true);

          // Only force RTL update on web platform to avoid crashes
          if (Platform.OS === 'web' && shouldBeRTL !== I18nManager.getConstants().isRTL) {
            console.log('🔄 App startup - Forcing RTL to:', shouldBeRTL);
            forceRTLUpdate();
          }
        } catch (error) {
          console.warn('⚠️ RTL setup failed:', error);
        }

        console.log('✅ App initialization complete');
      } catch (error) {
        console.error('❌ App initialization failed:', error);
      }
    };

    initializeApp();
  }, [initialize]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <I18nextProvider i18n={i18n}>
          <RootNavigator />
          <StatusBar style="auto" />
        </I18nextProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
