import React from 'react';
import { Text, TextProps, StyleSheet, View, ViewProps } from 'react-native';
import { isRTL } from '../services/i18n';

interface RTLTextProps extends TextProps {
  children: React.ReactNode;
  align?: 'auto' | 'left' | 'right' | 'center';
}

export const RTLText: React.FC<RTLTextProps> = ({
  children,
  style,
  align = 'auto',
  ...props
}) => {
  const rtl = isRTL();

  const getTextAlign = () => {
    if (align !== 'auto') return align;
    return rtl ? 'right' : 'left';
  };

  const textStyle = [
    style,
    {
      textAlign: getTextAlign(),
      writingDirection: rtl ? 'rtl' as const : 'ltr' as const,
    },
  ];

  // Ensure children is safe to render
  const safeChildren = React.Children.map(children, (child) => {
    if (child === null || child === undefined || child === '') {
      return null;
    }
    return child;
  });

  // If no valid children, don't render anything
  if (!safeChildren || safeChildren.length === 0) {
    return null;
  }

  return (
    <Text style={textStyle} {...props}>
      {safeChildren}
    </Text>
  );
};

interface RTLViewProps extends ViewProps {
  children: React.ReactNode;
  style?: any;
  reverse?: boolean;
}

export const RTLView: React.FC<RTLViewProps> = ({
  children,
  style,
  reverse = false,
  ...props
}) => {
  const rtl = isRTL();
  const shouldReverse = reverse ? !rtl : rtl;

  const viewStyle = [
    style,
    {
      flexDirection: shouldReverse ? 'row-reverse' : 'row',
    },
  ];

  // Ensure children is valid
  const safeChildren = React.Children.map(children, (child) => {
    // If child is a string, number, or other primitive, wrap it in Text
    if (typeof child === 'string' || typeof child === 'number') {
      console.warn('RTLView: Found primitive child, wrapping in Text:', child);
      return <Text>{child}</Text>;
    }
    return child;
  });

  return (
    <View style={viewStyle} {...props}>
      {safeChildren}
    </View>
  );
};

// Hook for RTL utilities
export const useRTL = () => {
  const rtl = isRTL();

  return {
    isRTL: rtl,
    textAlign: (rtl ? 'right' : 'left') as 'left' | 'right',
    flexDirection: (rtl ? 'row-reverse' : 'row') as 'row' | 'row-reverse',
    marginLeft: (value: number) => rtl ? { marginRight: value } : { marginLeft: value },
    marginRight: (value: number) => rtl ? { marginLeft: value } : { marginRight: value },
    paddingLeft: (value: number) => rtl ? { paddingRight: value } : { paddingLeft: value },
    paddingRight: (value: number) => rtl ? { paddingLeft: value } : { paddingRight: value },
    left: (value: number) => rtl ? { right: value } : { left: value },
    right: (value: number) => rtl ? { left: value } : { right: value },
    transform: rtl ? [{ scaleX: -1 }] : [],
    getIconName: (ltrIcon: string, rtlIcon?: string) => {
      if (rtlIcon && rtl) return rtlIcon;
      if (rtl && ltrIcon.includes('chevron-forward')) return 'chevron-back';
      if (rtl && ltrIcon.includes('chevron-back')) return 'chevron-forward';
      if (rtl && ltrIcon.includes('arrow-forward')) return 'arrow-back';
      if (rtl && ltrIcon.includes('arrow-back')) return 'arrow-forward';
      return ltrIcon;
    },
  };
};

// Helper function to get RTL-aware text alignment
export const getTextAlign = (align?: 'auto' | 'left' | 'right' | 'center'): 'left' | 'right' | 'center' => {
  if (align === 'center') return 'center';
  if (align === 'left' || align === 'right') return align;
  return isRTL() ? 'right' : 'left';
};

// Helper function to get RTL-aware flex direction
export const getFlexDirection = (reverse = false): 'row' | 'row-reverse' => {
  const rtl = isRTL();
  const shouldReverse = reverse ? !rtl : rtl;
  return shouldReverse ? 'row-reverse' : 'row';
};

const styles = StyleSheet.create({
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  ltrText: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
});
