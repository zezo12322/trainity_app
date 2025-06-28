import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme, View, Text } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
  overlay: string;
}

interface Theme {
  colors: ThemeColors;
  isDark: boolean;
}

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const lightTheme: Theme = {
  isDark: false,
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#1C1C1E',
    textSecondary: '#8E8E93',
    border: '#E5E5EA',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
};

const darkTheme: Theme = {
  isDark: true,
  colors: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    background: '#000000',
    surface: '#1C1C1E',
    card: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme_mode';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [theme, setTheme] = useState<Theme>(lightTheme);

  // Load saved theme mode on app start
  useEffect(() => {
    loadThemeMode();
  }, []);

  // Update theme when mode or system theme changes
  useEffect(() => {
    updateTheme();
  }, [themeMode, systemColorScheme]);

  const loadThemeMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        setThemeModeState(savedMode as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme mode:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };

  const updateTheme = () => {
    let isDark = false;

    switch (themeMode) {
      case 'dark':
        isDark = true;
        break;
      case 'light':
        isDark = false;
        break;
      case 'system':
        isDark = systemColorScheme === 'dark';
        break;
    }

    setTheme(isDark ? darkTheme : lightTheme);
  };

  const toggleTheme = () => {
    const newMode = theme.isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  const value: ThemeContextType = {
    theme,
    themeMode,
    setThemeMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook for getting theme-aware styles
export const useThemedStyles = <T extends Record<string, any>>(
  styleCreator: (theme: Theme) => T
): T => {
  const { theme } = useTheme();
  return styleCreator(theme);
};

// Helper function to create theme-aware colors
export const createThemedColors = (theme: Theme) => ({
  ...theme.colors,
  // Additional computed colors
  inputBackground: theme.isDark ? '#2C2C2E' : '#FFFFFF',
  inputBorder: theme.isDark ? '#48484A' : '#E5E5EA',
  tabBarBackground: theme.isDark ? '#1C1C1E' : '#FFFFFF',
  tabBarInactive: theme.isDark ? '#8E8E93' : '#8E8E93',
  headerBackground: theme.isDark ? '#1C1C1E' : '#FFFFFF',
  modalBackground: theme.isDark ? '#1C1C1E' : '#FFFFFF',
  separatorColor: theme.isDark ? '#38383A' : '#E5E5EA',
  placeholderText: theme.isDark ? '#8E8E93' : '#8E8E93',
  linkColor: theme.isDark ? '#0A84FF' : '#007AFF',
  destructiveColor: theme.isDark ? '#FF453A' : '#FF3B30',

  // Status colors with opacity
  primaryLight: theme.colors.primary + '20',
  successLight: theme.colors.success + '20',
  warningLight: theme.colors.warning + '20',
  errorLight: theme.colors.error + '20',

  // Gradient colors
  primaryGradient: theme.isDark
    ? ['#0A84FF', '#5E5CE6']
    : ['#007AFF', '#5856D6'],
});

// Theme-aware component wrapper
export const ThemedView: React.FC<{
  children: ReactNode;
  style?: any;
  lightColor?: string;
  darkColor?: string;
}> = ({ children, style, lightColor, darkColor }) => {
  const { theme } = useTheme();

  const backgroundColor = theme.isDark
    ? (darkColor || theme.colors.background)
    : (lightColor || theme.colors.background);

  return (
    <View style={[{ backgroundColor }, style]}>
      {children}
    </View>
  );
};

export const ThemedText: React.FC<{
  children: ReactNode;
  style?: any;
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'subtitle' | 'caption';
}> = ({ children, style, lightColor, darkColor, type = 'default' }) => {
  const { theme } = useTheme();

  const color = theme.isDark
    ? (darkColor || theme.colors.text)
    : (lightColor || theme.colors.text);

  const getTypeStyle = () => {
    switch (type) {
      case 'title':
        return { fontSize: 24, fontWeight: 'bold' };
      case 'subtitle':
        return { fontSize: 18, fontWeight: '600' };
      case 'caption':
        return { fontSize: 12, color: theme.colors.textSecondary };
      default:
        return { fontSize: 16 };
    }
  };

  return (
    <Text style={[{ color }, getTypeStyle(), style]}>
      {children}
    </Text>
  );
};
