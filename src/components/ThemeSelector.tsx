import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, ThemeMode } from '../contexts/ThemeContext';
import { RTLView, useRTL } from './RTLText';

interface ThemeSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useTranslation();
  const { isRTL: rtl } = useRTL();
  const { theme, themeMode, setThemeMode } = useTheme();

  const themeOptions: { mode: ThemeMode; label: string; icon: string; description: string }[] = [
    {
      mode: 'light',
      label: t('theme.light'),
      icon: 'sunny',
      description: t('theme.lightDescription'),
    },
    {
      mode: 'dark',
      label: t('theme.dark'),
      icon: 'moon',
      description: t('theme.darkDescription'),
    },
    {
      mode: 'system',
      label: t('theme.system'),
      icon: 'phone-portrait',
      description: t('theme.systemDescription'),
    },
  ];

  const handleThemeSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
    onClose();
  };

  const styles = createStyles(theme);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.title}>{t('theme.selectTheme')}</Text>
          
          <View style={styles.placeholder} />
        </View>

        {/* Theme Options */}
        <View style={styles.content}>
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.mode}
              style={[
                styles.optionContainer,
                themeMode === option.mode && styles.selectedOption,
              ]}
              onPress={() => handleThemeSelect(option.mode)}
              activeOpacity={0.7}
            >
              <RTLView style={styles.optionContent}>
                <View style={styles.optionIcon}>
                  <Ionicons
                    name={option.icon as any}
                    size={24}
                    color={themeMode === option.mode ? theme.colors.primary : theme.colors.textSecondary}
                  />
                </View>
                
                <View style={styles.optionText}>
                  <Text style={[
                    styles.optionLabel,
                    themeMode === option.mode && styles.selectedLabel,
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>

                {themeMode === option.mode && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={theme.colors.primary}
                  />
                )}
              </RTLView>
            </TouchableOpacity>
          ))}
        </View>

        {/* Preview */}
        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>{t('theme.preview')}</Text>
          
          <View style={styles.previewContainer}>
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <View style={styles.previewDot} />
                <View style={[styles.previewDot, { backgroundColor: theme.colors.warning }]} />
                <View style={[styles.previewDot, { backgroundColor: theme.colors.success }]} />
              </View>
              
              <View style={styles.previewContent}>
                <Text style={styles.previewText}>{t('theme.previewText')}</Text>
                <View style={styles.previewButton}>
                  <Text style={styles.previewButtonText}>{t('common.button')}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Quick theme toggle button
export const ThemeToggleButton: React.FC<{ style?: any }> = ({ style }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        {
          padding: 8,
          borderRadius: 20,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        style,
      ]}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <Ionicons
        name={theme.isDark ? 'sunny' : 'moon'}
        size={20}
        color={theme.colors.text}
      />
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  optionContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  optionContent: {
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  selectedLabel: {
    color: theme.colors.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  previewSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  previewContainer: {
    alignItems: 'center',
  },
  previewCard: {
    width: 200,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.background,
    gap: 6,
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },
  previewContent: {
    padding: 16,
  },
  previewText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 12,
  },
  previewButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  previewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
