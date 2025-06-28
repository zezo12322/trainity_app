import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SlideInViewProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

export const SlideInView: React.FC<SlideInViewProps> = ({
  children,
  direction = 'left',
  duration = 800,
  delay = 0,
  style,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  const getInitialPosition = () => {
    switch (direction) {
      case 'left':
        return -screenWidth;
      case 'right':
        return screenWidth;
      case 'top':
        return -screenHeight;
      case 'bottom':
        return screenHeight;
      default:
        return -screenWidth;
    }
  };

  const getTransformStyle = () => {
    const translateValue = slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [getInitialPosition(), 0],
    });

    if (direction === 'left' || direction === 'right') {
      return { translateX: translateValue };
    } else {
      return { translateY: translateValue };
    }
  };

  useEffect(() => {
    slideAnim.setValue(0);
    
    const timer = setTimeout(() => {
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [slideAnim, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [getTransformStyle()],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
