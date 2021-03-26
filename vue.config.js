module.exports = {
  transpileDependencies: ['src/worker.js'],
  pluginOptions: {
    electronBuilder: {
      // chainWebpackMainProcess: config => {
      //   const js = config.module.rule('js');
      //   js.clear();
      //   js.test(/\.m?js$/)
      //     .exclude.add(/(node_modules|bower_components)/)
      //     .end()
      //     .use('babel-loader')
      //     .loader('babel-loader')
      //     .tap(options => {
      //       options = {
      //         presets: ['@vue/babel-preset-app']
      //         // presets: ['@vue/cli-plugin-babel/preset', '@babel/preset-env'],
      //         // plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]]
      //       };
      //       return options;
      //     })
      //     .end();
      // },
      preload: 'src/preload.js',
      externals: ['better-sqlite3'],
      mainProcessFile: 'src/background.js',
      rendererProcessFile: 'src/main.js',
      removeElectronJunk: true
    }
  },
  configureWebpack: {
    target: 'electron-main'
  }
  // chainWebpack: config => {
  //   config.module
  //     .rule('js')
  //     .use('babel-loader')
  //     .tap(options => {
  //       options = {
  //         presets: ['@vue/babel-preset-app']
  //         // presets: ['@vue/cli-plugin-babel/preset', '@babel/preset-env'],
  //         // plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]]
  //       };
  //       return options;
  //     });
  // }
};
