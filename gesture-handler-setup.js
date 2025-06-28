// Gesture Handler Setup for React Native
// This file ensures proper initialization of react-native-gesture-handler

import 'react-native-gesture-handler';

// Force gesture handler to initialize properly
if (typeof global !== 'undefined') {
  // Ensure gesture handler is available globally
  global._GESTURE_HANDLER_ENABLED = true;
}

// Export a dummy function to ensure this module is loaded
export const initializeGestureHandler = () => {
  console.log('✅ Gesture Handler initialized');
};
