import { I18nManager } from 'react-native';
import { isRTL as checkIsRTL } from '../services/i18n';

/**
 * RTL Utility functions for consistent RTL support across the app
 */

// Force RTL layout update (safe for production)
export const forceRTLUpdate = () => {
  try {
    const shouldBeRTL = checkIsRTL();
    console.log('RTL update - Should be RTL:', shouldBeRTL);
    console.log('Current RTL state:', I18nManager.getConstants().isRTL);

    // Only allow RTL, don't force it to avoid crashes
    I18nManager.allowRTL(true);

    // Note: forceRTL causes app restart on Android, so we avoid it in production
    console.log('RTL support enabled');
  } catch (error) {
    console.warn('RTL update failed:', error);
  }
};

// Get RTL-aware text alignment
export const getTextAlign = (align?: 'auto' | 'left' | 'right' | 'center'): 'left' | 'right' | 'center' => {
  if (align === 'center') return 'center';
  if (align === 'left' || align === 'right') return align;
  return checkIsRTL() ? 'right' : 'left';
};

// Get RTL-aware flex direction
export const getFlexDirection = (reverse = false): 'row' | 'row-reverse' => {
  const rtl = checkIsRTL();
  const shouldReverse = reverse ? !rtl : rtl;
  return shouldReverse ? 'row-reverse' : 'row';
};

// Get RTL-aware margin/padding
export const getRTLStyle = (property: 'margin' | 'padding', side: 'Left' | 'Right', value: number) => {
  const rtl = checkIsRTL();
  const actualSide = rtl ? (side === 'Left' ? 'Right' : 'Left') : side;
  return { [`${property}${actualSide}`]: value };
};

// Get RTL-aware positioning
export const getRTLPosition = (side: 'left' | 'right', value: number) => {
  const rtl = checkIsRTL();
  const actualSide = rtl ? (side === 'left' ? 'right' : 'left') : side;
  return { [actualSide]: value };
};

// Get RTL-aware icon name
export const getRTLIconName = (ltrIcon: string, rtlIcon?: string): string => {
  const rtl = checkIsRTL();

  if (rtlIcon && rtl) return rtlIcon;
  if (!rtl) return ltrIcon;

  // Auto-flip common directional icons
  const iconMappings: Record<string, string> = {
    'chevron-forward': 'chevron-back',
    'chevron-back': 'chevron-forward',
    'arrow-forward': 'arrow-back',
    'arrow-back': 'arrow-forward',
    'caret-forward': 'caret-back',
    'caret-back': 'caret-forward',
    'play-forward': 'play-back',
    'play-back': 'play-forward',
  };

  return iconMappings[ltrIcon] || ltrIcon;
};

// RTL-aware transform
export const getRTLTransform = (additionalTransforms: any[] = []) => {
  const rtl = checkIsRTL();
  return rtl ? [{ scaleX: -1 }, ...additionalTransforms] : additionalTransforms;
};

// Check if current layout is RTL
export const isCurrentlyRTL = (): boolean => {
  return I18nManager.getConstants().isRTL;
};

// RTL-aware style object
export const createRTLStyle = (baseStyle: any, rtlOverrides: any = {}) => {
  const rtl = checkIsRTL();
  return rtl ? { ...baseStyle, ...rtlOverrides } : baseStyle;
};
