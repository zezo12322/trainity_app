const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure proper module resolution order
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-gesture-handler': require.resolve('react-native-gesture-handler'),
};

// Enable support for development builds
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add support for additional file extensions
config.resolver.sourceExts.push('cjs');

// Configure transformer for better development experience
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Enable symlinks for development
config.resolver.unstable_enableSymlinks = true;

// Better error handling for development builds
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Fix file watcher issues by excluding problematic directories
config.watchFolders = [__dirname];
config.resolver.blockList = [
  // Block problematic gradle build directories
  /.*\/node_modules\/.*\/android\/build\/.*/,
  /.*\/node_modules\/.*\/gradle-plugin\/.*\/build\/.*/,
  /.*\/node_modules\/@react-native\/gradle-plugin\/.*\/build\/.*/,
  // Block other build directories that might cause issues
  /.*\/android\/build\/.*/,
  /.*\/ios\/build\/.*/,
  /.*\/\.gradle\/.*/,
];

// Configure watcher to ignore problematic paths
config.watcher = {
  ...config.watcher,
  additionalExts: ['cjs'],
};

module.exports = config;
