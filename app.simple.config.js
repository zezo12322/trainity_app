const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_DEMO = process.env.APP_VARIANT === 'demo';

export default {
  expo: {
    name: IS_DEMO ? 'Life Makers Pirates - Demo' : 'Life Makers Pirates',
    slug: IS_DEMO ? 'life-makers-pirates-demo' : 'life-makers-pirates',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#1E40AF'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: IS_DEMO 
        ? 'com.lifemakers.pirates.demo' 
        : 'com.lifemakers.pirates'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      edgeToEdgeEnabled: true,
      package: IS_DEMO 
        ? 'com.lifemakers.pirates.demo' 
        : 'com.lifemakers.pirates',
      versionCode: 1,
      permissions: [
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'NOTIFICATIONS',
        'INTERNET',
        'ACCESS_NETWORK_STATE'
      ],
      useNextNotificationsApi: true
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro'
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    extra: {
      eas: {
        projectId: process.env.EXPO_PROJECT_ID
      },
      isDev: IS_DEV,
      isDemo: IS_DEMO,
      buildDate: new Date().toISOString(),
      version: '1.0.0'
    }
  }
};
