import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScaleInView } from './ScaleInView';
import { PulseView } from './PulseView';
import { useTheme } from '../../contexts/ThemeContext';

interface FloatingButtonProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  backgroundColor?: string;
  pulse?: boolean;
  style?: any;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  onPress,
  icon = 'add',
  size = 24,
  color,
  backgroundColor,
  pulse = false,
  style,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const [pressed, setPressed] = useState(false);

  const buttonColor = backgroundColor || colors.primary;
  const iconColor = color || colors.surface;

  const handlePressIn = () => {
    setPressed(true);
  };

  const handlePressOut = () => {
    setPressed(false);
  };

  const ButtonContent = (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: buttonColor,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
        style,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={size} color={iconColor} />
    </TouchableOpacity>
  );

  if (pulse) {
    return (
      <ScaleInView delay={300}>
        <PulseView duration={2000} minScale={0.95} maxScale={1.05}>
          {ButtonContent}
        </PulseView>
      </ScaleInView>
    );
  }

  return <ScaleInView delay={300}>{ButtonContent}</ScaleInView>;
};

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});
