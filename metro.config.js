const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const config = {
  transformer: {
    assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  },
  resolver: {
    assetExts: ['png', 'jpg', 'jpeg', 'svg'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config); 