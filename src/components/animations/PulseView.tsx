import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface PulseViewProps {
  children: React.ReactNode;
  duration?: number;
  minScale?: number;
  maxScale?: number;
  repeat?: boolean;
  style?: ViewStyle;
}

export const PulseView: React.FC<PulseViewProps> = ({
  children,
  duration = 1000,
  minScale = 0.95,
  maxScale = 1.05,
  repeat = true,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(minScale)).current;

  useEffect(() => {
    const createPulseAnimation = () => {
      return Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: maxScale,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: minScale,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]);
    };

    if (repeat) {
      Animated.loop(createPulseAnimation()).start();
    } else {
      createPulseAnimation().start();
    }

    return () => {
      pulseAnim.stopAnimation();
    };
  }, [pulseAnim, duration, minScale, maxScale, repeat]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
