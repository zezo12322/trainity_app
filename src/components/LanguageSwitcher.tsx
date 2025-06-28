import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage } from '../services/i18n';
import { COLORS, SIZES, LANGUAGES } from '../constants';
import { RTLView, useRTL } from './RTLText';

interface LanguageSwitcherProps {
  style?: any;
  showLabel?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  style,
  showLabel = true,
}) => {
  const { t } = useTranslation();
  const getIconName = (icon: string) => icon; // Simple fallback
  const [isChanging, setIsChanging] = useState(false);

  const currentLanguage = getCurrentLanguage();
  const isArabic = currentLanguage === LANGUAGES.ARABIC;

  const handleLanguageChange = async () => {
    if (isChanging) return;

    const newLanguage = isArabic ? LANGUAGES.ENGLISH : LANGUAGES.ARABIC;
    const languageName = newLanguage === LANGUAGES.ARABIC ? 'العربية' : 'English';

    try {
      setIsChanging(true);

      // Show confirmation alert
      Alert.alert(
        t('common.changeLanguage'),
        t('common.changeLanguageConfirm', { language: languageName }),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
            onPress: () => setIsChanging(false),
          },
          {
            text: t('common.confirm'),
            onPress: async () => {
              try {
                await changeLanguage(newLanguage);

                // Show restart message for native platforms
                if (Platform.OS !== 'web') {
                  Alert.alert(
                    t('common.restartRequired'),
                    t('common.restartRequiredMessage'),
                    [{ text: t('common.ok') }]
                  );
                }
              } catch (error) {
                console.error('Error changing language:', error);
                Alert.alert(
                  t('common.error'),
                  t('common.languageChangeError')
                );
              } finally {
                setIsChanging(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error in language change:', error);
      setIsChanging(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handleLanguageChange}
      disabled={isChanging}
      activeOpacity={0.7}
    >
      <RTLView style={styles.content}>
        <Ionicons
          name="language"
          size={24}
          color={COLORS.primary}
        />
        {showLabel ? (
          <View style={styles.textContainer}>
            <Text style={styles.label}>{t('profile.language')}</Text>
            <Text style={styles.value}>
              {isArabic ? 'العربية' : 'English'}
            </Text>
          </View>
        ) : null}
        <Ionicons
          name={getIconName('chevron-forward') as any}
          size={20}
          color={COLORS.light.textSecondary}
          style={[
            styles.arrow,
            { opacity: isChanging ? 0.5 : 1 }
          ]}
        />
      </RTLView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.light.surface,
    borderRadius: SIZES.md,
    padding: SIZES.md,
    marginVertical: SIZES.xs,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginHorizontal: SIZES.md,
  },
  label: {
    fontSize: SIZES.body,
    fontWeight: '500',
    color: COLORS.light.text,
    marginBottom: SIZES.xs / 2,
  },
  value: {
    fontSize: SIZES.caption,
    color: COLORS.light.textSecondary,
  },
  arrow: {
    marginLeft: SIZES.sm,
  },
});
