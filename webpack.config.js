const VueLoaderPlugin = require('vue-loader/lib/plugin');
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');

// console.log('webpack options have been read!')
// console.log('webpack options have been read!')
// console.log('webpack options have been read!')
// console.log('webpack options have been read!')
// console.log('webpack options have been read!')
// console.log('webpack options have been read!')
// console.log('webpack options have been read!')
// console.log('webpack options have been read!')
// console.log('webpack options have been read!')
// console.log('webpack options have been read!')
// console.log('webpack options have been read!')
// console.log('webpack options have been read!')
// console.log('webpack options have been read!')
// console.log('webpack options have been read!')
// throw new Error("ohai! You've seen this!!")

module.exports = {
  target: 'node',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@vue/cli-plugin-babel/preset', '@babel/preset-env'],
            plugins: ['@babel/plugin-proposal-class-properties']
          }
        }
      },
      {
        test: /\.sql$/,
        use: ['sql-loader']
      },
      {
        test: /\.vue$/,
        use: ['vue-loader', 'vuetify-loader']
      },
      {
        test: /\.s(c|a)ss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
              sassOptions: {
                fiber: require('fibers'),
                indentedSyntax: true
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [new VueLoaderPlugin(), new VuetifyLoaderPlugin()]
};
