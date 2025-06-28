// Web polyfills for React Native modules
// This file provides polyfills for native modules when running on web

// Only run on web platform
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  console.log('🌐 Loading web polyfills...');

  // Create global object if it doesn't exist
  if (typeof global === 'undefined') {
    window.global = window;
  }

  // Polyfill for TurboModuleRegistry
  if (!global.TurboModuleRegistry) {
    global.TurboModuleRegistry = {
      get: (name) => {
        if (name === 'RNGestureHandlerModule') {
          return global.RNGestureHandlerModule;
        }
        console.warn(`TurboModule ${name} not available on web`);
        return null;
      },
      getEnforcing: (name) => {
        if (name === 'RNGestureHandlerModule') {
          return global.RNGestureHandlerModule || {};
        }
        console.warn(`TurboModule ${name} not available on web - returning empty object`);
        return {};
      }
    };
  }

  // Comprehensive polyfill for RNGestureHandlerModule
  if (!global.RNGestureHandlerModule) {
    const gestureHandlerStates = {
      UNDETERMINED: 0,
      FAILED: 1,
      BEGAN: 2,
      CANCELLED: 3,
      ACTIVE: 4,
      END: 5,
    };

    const gestureHandlerDirections = {
      RIGHT: 1,
      LEFT: 2,
      UP: 4,
      DOWN: 8,
    };

    global.RNGestureHandlerModule = {
      State: gestureHandlerStates,
      Direction: gestureHandlerDirections,
      attachGestureHandler: () => {},
      createGestureHandler: () => {},
      dropGestureHandler: () => {},
      updateGestureHandler: () => {},
      getConstants: () => ({
        State: gestureHandlerStates,
        Direction: gestureHandlerDirections,
      }),
      // Add additional methods that might be called
      flushOperations: () => {},
      install: () => {},
    };
  }

  // Ensure gesture handler constants are globally available
  if (!global.__gesture_handler_constants__) {
    global.__gesture_handler_constants__ = {
      State: {
        UNDETERMINED: 0,
        FAILED: 1,
        BEGAN: 2,
        CANCELLED: 3,
        ACTIVE: 4,
        END: 5,
      },
      Direction: {
        RIGHT: 1,
        LEFT: 2,
        UP: 4,
        DOWN: 8,
      }
    };
  }

  // Polyfill for other potential native modules
  const nativeModules = [
    'RNReanimatedModule',
    'RNScreensModule',
    'RNSafeAreaModule'
  ];

  nativeModules.forEach(moduleName => {
    if (!global[moduleName]) {
      global[moduleName] = {};
    }
  });

  console.log('✅ Web polyfills loaded successfully');
} else {
  console.log('📱 Running on native platform - skipping web polyfills');
}
