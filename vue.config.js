module.exports = {
  transpileDependencies: [],
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      externals: ['better-sqlite3'],
      mainProcessFile: 'src/background.js',
      rendererProcessFile: 'src/main.js',
      removeElectronJunk: true
    }
  },
  chainWebpack: config => {
    // const js = config.module.rule('js');

    // js.use('babel-loader').tap(options => {
    //   options = {
    //     presets: [require('@vue/cli-plugin-babel/preset'), require('@babel/preset-env').default],
    //     plugins: [require('@babel/plugin-proposal-class-properties').default]
    //   };
    //   return options;
    // });
  }
};
