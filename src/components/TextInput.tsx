import React, { useState } from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import { isRTL } from '../services/i18n';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
}

export const TextInput: React.FC<CustomTextInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  variant = 'outlined',
  size = 'medium',
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const rtl = isRTL();

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      marginBottom: SIZES.md,
    };

    return baseStyle;
  };

  const getInputContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: rtl ? 'row-reverse' : 'row',
      alignItems: 'center',
      borderRadius: SIZES.radiusMedium,
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingHorizontal = SIZES.md;
        baseStyle.paddingVertical = SIZES.sm;
        baseStyle.minHeight = 40;
        break;
      case 'large':
        baseStyle.paddingHorizontal = SIZES.lg;
        baseStyle.paddingVertical = SIZES.md;
        baseStyle.minHeight = 56;
        break;
      default: // medium
        baseStyle.paddingHorizontal = SIZES.md;
        baseStyle.paddingVertical = SIZES.md;
        baseStyle.minHeight = 48;
    }

    // Variant styles
    switch (variant) {
      case 'outlined':
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = error
          ? COLORS.error
          : isFocused
          ? COLORS.primary
          : COLORS.light.border;
        baseStyle.backgroundColor = COLORS.light.background;
        break;
      case 'filled':
        baseStyle.backgroundColor = error
          ? `${COLORS.error}10`
          : isFocused
          ? `${COLORS.primary}10`
          : COLORS.light.surface;
        break;
      default: // default
        baseStyle.borderBottomWidth = 1;
        baseStyle.borderBottomColor = error
          ? COLORS.error
          : isFocused
          ? COLORS.primary
          : COLORS.light.border;
        baseStyle.backgroundColor = 'transparent';
    }

    return baseStyle;
  };

  const getInputStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      flex: 1,
      color: COLORS.light.text,
      textAlign: rtl ? 'right' : 'left',
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

    return baseStyle;
  };

  const getLabelStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: SIZES.h6,
      fontWeight: '500',
      color: error ? COLORS.error : COLORS.light.text,
      marginBottom: SIZES.xs,
      textAlign: rtl ? 'right' : 'left',
    };

    return baseStyle;
  };

  const getErrorStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: SIZES.caption,
      color: COLORS.error,
      marginTop: SIZES.xs,
      textAlign: rtl ? 'right' : 'left',
    };

    return baseStyle;
  };

  const handleSecureToggle = () => {
    setIsSecure(!isSecure);
  };

  return (
    <View style={[getContainerStyle(), containerStyle]}>
      {label && label.trim() && (
        <Text style={[getLabelStyle(), labelStyle]}>{label.trim()}</Text>
      )}

      <View style={getInputContainerStyle()}>
        {leftIcon ? (
          <Ionicons
            name={leftIcon as any}
            size={SIZES.iconMedium}
            color={error ? COLORS.error : isFocused ? COLORS.primary : COLORS.light.textSecondary}
            style={{ marginRight: rtl ? 0 : SIZES.sm, marginLeft: rtl ? SIZES.sm : 0 }}
          />
        ) : null}

        <RNTextInput
          {...props}
          style={[getInputStyle(), inputStyle]}
          secureTextEntry={isSecure}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          placeholderTextColor={COLORS.light.textSecondary}
        />

        {secureTextEntry ? (
          <TouchableOpacity onPress={handleSecureToggle}>
            <Ionicons
              name={isSecure ? 'eye-off' : 'eye'}
              size={SIZES.iconMedium}
              color={COLORS.light.textSecondary}
              style={{ marginLeft: rtl ? 0 : SIZES.sm, marginRight: rtl ? SIZES.sm : 0 }}
            />
          </TouchableOpacity>
        ) : null}

        {rightIcon && !secureTextEntry ? (
          <TouchableOpacity onPress={onRightIconPress}>
            <Ionicons
              name={rightIcon as any}
              size={SIZES.iconMedium}
              color={error ? COLORS.error : isFocused ? COLORS.primary : COLORS.light.textSecondary}
              style={{ marginLeft: rtl ? 0 : SIZES.sm, marginRight: rtl ? SIZES.sm : 0 }}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {error && error.trim() ? (
        <Text style={[getErrorStyle(), errorStyle]}>{error.trim()}</Text>
      ) : null}
    </View>
  );
};