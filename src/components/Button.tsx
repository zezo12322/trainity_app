import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, SIZES } from '../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: SIZES.radiusMedium,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingHorizontal = SIZES.md;
        baseStyle.paddingVertical = SIZES.sm;
        baseStyle.minHeight = 36;
        break;
      case 'large':
        baseStyle.paddingHorizontal = SIZES.xl;
        baseStyle.paddingVertical = SIZES.md;
        baseStyle.minHeight = 56;
        break;
      default: // medium
        baseStyle.paddingHorizontal = SIZES.lg;
        baseStyle.paddingVertical = SIZES.md;
        baseStyle.minHeight = 48;
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = disabled ? COLORS.light.border : COLORS.primary;
        break;
      case 'secondary':
        baseStyle.backgroundColor = disabled ? COLORS.light.border : COLORS.secondary;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = disabled ? COLORS.light.border : COLORS.primary;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        break;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.fontSize = SIZES.h6;
        break;
      case 'large':
        baseStyle.fontSize = SIZES.h4;
        break;
      default: // medium
        baseStyle.fontSize = SIZES.h5;
    }

    // Variant styles
    switch (variant) {
      case 'primary':
      case 'secondary':
        baseStyle.color = disabled ? COLORS.light.textSecondary : '#FFFFFF';
        break;
      case 'outline':
        baseStyle.color = disabled ? COLORS.light.textSecondary : COLORS.primary;
        break;
      case 'ghost':
        baseStyle.color = disabled ? COLORS.light.textSecondary : COLORS.primary;
        break;
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'secondary' ? '#FFFFFF' : COLORS.primary}
        />
      ) : (
        <>
          {icon ? (
            <View style={{ marginRight: SIZES.sm }}>
              {icon}
            </View>
          ) : null}
          <Text style={[getTextStyle(), textStyle]}>
            {title || 'زر'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});
