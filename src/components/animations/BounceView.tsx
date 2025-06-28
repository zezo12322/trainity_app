import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface BounceViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  bounceHeight?: number;
  repeat?: boolean;
  style?: ViewStyle;
}

export const BounceView: React.FC<BounceViewProps> = ({
  children,
  duration = 1000,
  delay = 0,
  bounceHeight = -20,
  repeat = false,
  style,
}) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createBounceAnimation = () => {
      return Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: bounceHeight,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 0,
          tension: 100,
          friction: 6,
          useNativeDriver: true,
        }),
      ]);
    };

    const timer = setTimeout(() => {
      if (repeat) {
        Animated.loop(createBounceAnimation()).start();
      } else {
        createBounceAnimation().start();
      }
    }, delay);

    return () => {
      clearTimeout(timer);
      bounceAnim.stopAnimation();
    };
  }, [bounceAnim, duration, delay, bounceHeight, repeat]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateY: bounceAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
