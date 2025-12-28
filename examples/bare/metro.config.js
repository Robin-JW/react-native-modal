const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const root = path.resolve(__dirname, '../..');
const defaultConfig = getDefaultConfig(__dirname);
const defaultBlockList = defaultConfig.resolver.blockList;

const modulesToBlock = [
  new RegExp(`${root}/node_modules/react/.*`),
  new RegExp(`${root}/node_modules/react-native/.*`),
  new RegExp(`${root}/node_modules/@react-native/.*`),
];

const newBlockList = new RegExp(
  '(' +
    (defaultBlockList ? defaultBlockList.source + '|' : '') +
    modulesToBlock.map(regexp => regexp.source).join('|') +
    ')',
);

const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    enableSymlinks: true,
    extraNodeModules: {
      'react-native-modal': root,
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-native': path.resolve(__dirname, 'node_modules/react-native'),
    },
    blockList: newBlockList,
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../node_modules'),
    ],
  },
  watchFolders: [root],
};

module.exports = mergeConfig(defaultConfig, config);
