import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RotateView } from './RotateView';
import { useTheme } from '../../contexts/ThemeContext';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const getSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 40;
      case 'large':
        return 60;
      default:
        return 40;
    }
  };

  const spinnerSize = getSize();
  const spinnerColor = color || colors.primary;

  return (
    <RotateView duration={1000} repeat={true}>
      <View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderColor: `${spinnerColor}20`,
            borderTopColor: spinnerColor,
            borderWidth: spinnerSize / 10,
          },
        ]}
      />
    </RotateView>
  );
};

const styles = StyleSheet.create({
  spinner: {
    borderRadius: 50,
  },
});
