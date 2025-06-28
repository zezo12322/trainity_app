import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { FadeInView } from './FadeInView';
import { ScaleInView } from './ScaleInView';
import { useTheme } from '../../contexts/ThemeContext';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  delay?: number;
  style?: ViewStyle;
  pressable?: boolean;
  fadeIn?: boolean;
  scaleIn?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onPress,
  delay = 0,
  style,
  pressable = true,
  fadeIn = true,
  scaleIn = true,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const [pressed, setPressed] = useState(false);

  const cardStyle = [
    styles.card,
    {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      transform: [{ scale: pressed ? 0.98 : 1 }],
    },
    style,
  ];

  const handlePressIn = () => {
    if (pressable) setPressed(true);
  };

  const handlePressOut = () => {
    if (pressable) setPressed(false);
  };

  const CardContent = pressable && onPress ? (
    <TouchableOpacity
      style={cardStyle}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.95}
    >
      {children}
    </TouchableOpacity>
  ) : (
    <TouchableOpacity style={cardStyle} disabled>
      {children}
    </TouchableOpacity>
  );

  let AnimatedContent = CardContent;

  if (scaleIn) {
    AnimatedContent = (
      <ScaleInView delay={delay} duration={600}>
        {CardContent}
      </ScaleInView>
    );
  }

  if (fadeIn) {
    AnimatedContent = (
      <FadeInView delay={delay} duration={800}>
        {AnimatedContent}
      </FadeInView>
    );
  }

  return AnimatedContent;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    borderWidth: 1,
  },
});
