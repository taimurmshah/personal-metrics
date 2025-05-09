const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

// projectRoot is the root of the React Native project (frontend/MeditationApp)
const projectRoot = __dirname;
// workspaceRoot is the root of your entire project (Meditation-Tracker)
const workspaceRoot = path.resolve(projectRoot, '../../'); // Goes up from frontend/MeditationApp to frontend/ then to project root

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [
    path.resolve(workspaceRoot, 'src'), // Watch the root src directory
  ],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    // You might need to adjust this based on your actual node_modules layout
    // disableHierarchicalLookup: true, // Uncomment if you have issues with symlinked packages or nested node_modules
  }
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
