module.exports = {
  transpileDependencies: [],
  pluginOptions: {
    electronBuilder: {
      chainWebpackMainProcess: config => {
        config.module
          .rule('babel')
          .test(/src.+\.js$/)
          .use('babel')
          .loader('babel-loader')
          .options({
            presets: [['@babel/preset-env', { modules: false }]],
            plugins: ['@babel/plugin-proposal-class-properties']
          });
      },
      preload: 'src/preload.js',
      externals: ['better-sqlite3'],
      mainProcessFile: 'src/background.js',
      rendererProcessFile: 'src/main.js',
      removeElectronJunk: true
    }
  },
};
