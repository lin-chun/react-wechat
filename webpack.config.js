var configs = JSON.parse(process.env.configs);
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ZipPlugin = require('zip-webpack-plugin');
var path = require('path');
var root = path.resolve(process.cwd()).replace(/\\/g, '/');
var pathApp = root + '/app';


// 配置入口文件
var plugins = [];

var entryMap = {
  'vendor': ['react', 'react-dom', 'react-router', 'reqwest', 'jsencrypt', 'crypto-js'],
  'weui': ['react-weui'],
  'index': ['css/layout/weui.css', './index'],
  // 'chars': ['./components/echarts/line']
  'chars': ['highcharts', 'highcharts/modules/exporting']
};

// 配置是否热更新，是否需要 demo
if (configs.nodeEnv == 'dev') {
  plugins.push(new webpack.HotModuleReplacementPlugin());
  for (var key in entryMap) {
    entryMap[key].unshift('webpack-hot-middleware/client?reload=true');
  }
}

// 配置出口文件
var pluginsHtml = new HtmlWebpackPlugin({
  filename: 'index.html',
  template: pathApp + '/index.html',
  inject: 'body',
  chunks: ['vendor', 'weui', 'chars', 'index']
});
plugins.push(pluginsHtml);

// 压缩脚本
if (configs.minJs) {
  var uglifyPlug = new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
      drop_console: configs.nodeEnv == 'prd'
    },
    output: {
      comments: false,
    }
  });
  plugins.push(uglifyPlug);
}

// 提取公用脚本
if (configs.nodeEnv != 'dev') {
  plugins.push(new webpack.optimize.CommonsChunkPlugin(['vendor', 'weui', 'chars']));
}

// 样式
var cssLoader = 'style-loader!css-loader!sass-loader';
if (configs.minCss) {
  cssLoader = 'style-loader!css-loader?minimize!sass-loader';
}

// 环境变量
plugins.push(new webpack.DefinePlugin({
  'process.env': {
    NODE_ENV: JSON.stringify('production'),
    nodeEnv: JSON.stringify(configs.nodeEnv)
  }
}));

if (configs.nodeEnv != 'dev') {
  plugins.push(new ZipPlugin({
    path: root + '/dist',
    filename: './dist.zip'
  }));
}

module.exports = {
  // 跟目录
  context: pathApp,

  // 插件
  plugins: plugins,

  // 脚本入口文件配置
  entry: entryMap,

  // 脚本文件输出配置
  output: {
    filename: configs.nodeEnv == 'dev' ? 'js/[name].js' : 'js/[name].[chunkhash:6].js',
    path: configs.nodeEnv == 'dev' ? '/dist/' : './dist',
  },
  module: {
    loaders: [{
      test: /\.(js|jsx)?$/,
      exclude: /node_modules/,
      loader: 'react-hot-loader!babel-loader'
    }, {
      test: /\.(jpe?g|gif|png|ico|svg)$/,
      exclude: /node_modules/,
      loader: 'url-loader?limit=8192&name=image/[name].[hash:4].[ext]'
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader?sourceMap'
    }, {
      test: /\.scss$/,
      exclude: /node_modules/,
      loader: cssLoader
    }]
  },
  // 调试 map ，方便 es6 调试
  devtool: 'source-map',
  // require 引用入口配置
  resolve: {
    alias: {
      api: pathApp + '/api',
      component: pathApp + '/components',
      utils: pathApp + '/components/utils',
      scss: pathApp + '/components/scss',
      views: pathApp + '/views',
      css: pathApp + '/css',
      business: pathApp + '/business',
      images: pathApp + '/images',
      echarts$: 'echarts/src/echarts.js',
      echarts: 'echarts/src',
      zrender$: 'zrender/src/zrender.js',
      zrender: 'zrender/src',
    }
  }
};
