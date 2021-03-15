module.exports = {
  transpileDependencies: [],
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      externals: ['better-sqlite3'],
      mainProcessFile: 'src/background.js',
      rendererProcessFile: 'src/main.js',
      removeElectronJunk: true,
    },
  },
};
