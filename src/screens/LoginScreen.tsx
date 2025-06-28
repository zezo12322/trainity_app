import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  I18nManager
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { changeLanguage, getCurrentLanguage, isRTL } from '../services/i18n';
import { LANGUAGES } from '../constants';
import { FadeInView, SlideInView, ScaleInView, LoadingSpinner } from '../components/animations';


export const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuthStore();
  const rtl = isRTL();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), t('auth.emailPasswordRequired'));
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      Alert.alert(
        t('auth.loginFailed'),
        error instanceof Error ? error.message : t('common.unexpectedError')
      );
    }
  };



  const handleLanguageToggle = async () => {
    const currentLang = getCurrentLanguage();
    const newLang = currentLang === LANGUAGES.ARABIC ? LANGUAGES.ENGLISH : LANGUAGES.ARABIC;

    Alert.alert(
      t('common.changeLanguage'),
      t('common.changeLanguageConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            try {
              await changeLanguage(newLang);

              // Set up RTL for the new language
              const shouldBeRTL = newLang === LANGUAGES.ARABIC;
              I18nManager.allowRTL(true);

              if (Platform.OS !== 'web' && shouldBeRTL !== I18nManager.getConstants().isRTL) {
                I18nManager.forceRTL(shouldBeRTL);
                // App will restart automatically on native platforms
              } else {
                // For web or when RTL state doesn't change, just reload
                if (Platform.OS === 'web') {
                  window.location.reload();
                }
              }
            } catch (error) {
              Alert.alert(t('common.error'), t('common.unexpectedError'));
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Language Toggle Button */}
          <FadeInView delay={100}>
            <View style={[styles.languageContainer, rtl && styles.languageContainerRTL]}>
              <TouchableOpacity
                style={styles.languageButton}
                onPress={handleLanguageToggle}
              >
                <Ionicons name="globe-outline" size={24} color="#007AFF" />
                <Text style={styles.languageText}>
                  {getCurrentLanguage() === LANGUAGES.ARABIC ? 'English' : 'العربية'}
                </Text>
              </TouchableOpacity>
            </View>
          </FadeInView>

          {/* Logo and Header */}
          <SlideInView direction="top" delay={200}>
            <View style={styles.header}>
              <ScaleInView delay={400}>
                <View style={styles.logoContainer}>
                  <Ionicons name="business" size={40} color="#007AFF" />
                </View>
              </ScaleInView>
              <FadeInView delay={600}>
                <Text style={[styles.title, rtl && styles.textRTL]}>{t('app.name')}</Text>
              </FadeInView>
              <FadeInView delay={800}>
                <Text style={[styles.welcomeTitle, rtl && styles.textRTL]}>{t('auth.welcomeBack')}</Text>
              </FadeInView>
              <FadeInView delay={1000}>
                <Text style={[styles.subtitle, rtl && styles.textRTL]}>{t('auth.loginSubtitle')}</Text>
              </FadeInView>
            </View>
          </SlideInView>

          {/* Form */}
          <SlideInView direction="bottom" delay={1200}>
            <View style={styles.form}>
              {/* Email Input */}
              <FadeInView delay={1400}>
                <View style={[styles.inputContainer, rtl && styles.inputContainerRTL]}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#8E8E93"
                    style={[styles.inputIcon, rtl && styles.inputIconRTL]}
                  />
                  <TextInput
                    style={[styles.input, rtl && styles.inputRTL]}
                    placeholder={t('auth.email')}
                    placeholderTextColor="#8E8E93"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textAlign={rtl ? 'right' : 'left'}
                  />
                </View>
              </FadeInView>

              {/* Password Input */}
              <FadeInView delay={1600}>
                <View style={[styles.inputContainer, rtl && styles.inputContainerRTL]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#8E8E93"
                    style={[styles.inputIcon, rtl && styles.inputIconRTL]}
                  />
                  <TextInput
                    style={[styles.input, rtl && styles.inputRTL]}
                    placeholder={t('auth.password')}
                    placeholderTextColor="#8E8E93"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textAlign={rtl ? 'right' : 'left'}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#8E8E93"
                    />
                  </TouchableOpacity>
                </View>
              </FadeInView>

              {/* Forgot Password */}
              <FadeInView delay={1800}>
                <TouchableOpacity style={[styles.forgotPassword, rtl && styles.forgotPasswordRTL]}>
                  <Text style={[styles.forgotPasswordText, rtl && styles.textRTL]}>{t('auth.forgotPassword')}</Text>
                </TouchableOpacity>
              </FadeInView>

              {/* Error Message */}
              {error && (
                <FadeInView delay={0}>
                  <Text style={[styles.errorText, rtl && styles.textRTL]}>{error}</Text>
                </FadeInView>
              )}

              {/* Login Button */}
              <ScaleInView delay={2000}>
                <TouchableOpacity
                  style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingSpinner size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.loginButtonText}>
                      {t('auth.login')}
                    </Text>
                  )}
                </TouchableOpacity>
              </ScaleInView>

              {/* Sign Up */}
              <FadeInView delay={2200}>
                <View style={[styles.signUpContainer, rtl && styles.signUpContainerRTL]}>
                  <Text style={[styles.signUpText, rtl && styles.textRTL]}>{t('auth.noAccount')} </Text>
                  <TouchableOpacity>
                    <Text style={[styles.signUpLink, rtl && styles.textRTL]}>{t('auth.signUp')}</Text>
                  </TouchableOpacity>
                </View>
              </FadeInView>
            </View>
          </SlideInView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  languageContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  languageContainerRTL: {
    alignItems: 'flex-start',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  languageText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 6,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  textRTL: {
    textAlign: 'right',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputContainerRTL: {
    flexDirection: 'row-reverse',
  },
  inputIcon: {
    marginRight: 12,
  },
  inputIconRTL: {
    marginRight: 0,
    marginLeft: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  inputRTL: {
    textAlign: 'right',
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordRTL: {
    alignSelf: 'flex-start',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpContainerRTL: {
    flexDirection: 'row-reverse',
  },
  signUpText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  signUpLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});
