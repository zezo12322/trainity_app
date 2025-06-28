import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface RotateViewProps {
  children: React.ReactNode;
  duration?: number;
  repeat?: boolean;
  clockwise?: boolean;
  style?: ViewStyle;
}

export const RotateView: React.FC<RotateViewProps> = ({
  children,
  duration = 2000,
  repeat = true,
  clockwise = true,
  style,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createRotateAnimation = () => {
      return Animated.timing(rotateAnim, {
        toValue: clockwise ? 1 : -1,
        duration,
        useNativeDriver: true,
      });
    };

    if (repeat) {
      Animated.loop(createRotateAnimation()).start();
    } else {
      createRotateAnimation().start();
    }

    return () => {
      rotateAnim.stopAnimation();
    };
  }, [rotateAnim, duration, repeat, clockwise]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ rotate: spin }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
