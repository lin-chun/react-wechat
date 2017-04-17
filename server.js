var configs = initConfigs();
var express = require('express');
var http = require('http');
var ip = require('ip');
var del = require('del');
var fs = require('fs');
var webpackConfig = require('./webpack.config');
var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');

if (configs.nodeEnv == 'dev') {
  var port = configs.port;
  var app = express();
  var server = http.createServer(app);
  var compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler, {
    hot: true,
    noInfo: true,
    inline: true,
    stats: {
      cached: false,
      colors: true
    }
  }));
  app.use(webpackHotMiddleware(compiler));

  app.get('/mock/*', mockResult);
  app.post('/mock/*', mockResult);

  // 返回请求的 mock 数据
  function mockResult(req, res) {
    var mSecond = configs.mock ? (Math.random() * 3000) : 1;
    var jsonPath = req.originalUrl.substr(0, req.originalUrl.indexOf('?'));
    jsonPath = jsonPath == null || jsonPath == '' ? req.originalUrl : jsonPath;
    jsonPath = jsonPath.indexOf('.json') > -1 ? jsonPath : jsonPath + '.json';
    var result = JSON.parse(fs.readFileSync(__dirname + '/app' + jsonPath), 'utf-8');
    new Promise(function(resolve) {
      setTimeout(function() {
        resolve();
        res.json(result);
      }, mSecond);
    });
  };

  server.listen(port, '0.0.0.0', function onStart(err) {
    if (err) {
      console.log(err);
    }
    console.log(ip.address() + ':' + port);
  });

  // 重载配置
  var reload = require('reload');
  reload(server, app);
} else {
  if (configs.delete) {
    del.sync('./dist');
  }
  console.log('build begin ' + new Date().toLocaleTimeString());
  webpack(webpackConfig, function() {
    console.log('webpack success ' + new Date().toLocaleTimeString());
    process.exit && process.exit();
    process.abort && process.abort();
  });
}

// 初始化，返回 process.env.configs
function initConfigs() {
  // 全局配置
  var configs = {
    nodeEnv: 'prd',
    port: 8200,
    minCss: null,
    minJs: null,
    del: false,
    mock: true
  };
  // 获取操作指令
  var argv = process.argv;
  for (var i = 2; i < argv.length; i++) {
    var val = argv[i];
    if (val == 'dev' || val == 'stg' || val == 'prd') {
      // 配置环境变量
      configs.nodeEnv = val;
    } else if (/[1-9][0-9]{1,3}/.test(val)) {
      // 设置端口
      configs.port = parseInt(val);
    } else if (val == 'css') {
      // 设置 css 压缩
      configs.minCss = true;
    } else if (val == 'js') {
      // 设置 js 压缩
      configs.minJs = true;
    } else if (val == 'del') {
      // 删除原来的 dist 文件夹
      configs.delete = true;
    } else if (val == 'mock') {
      configs.mock = false;
    }

    // 默认 js css 是否压缩
    // if (configs.minJs === null) {
    //   configs.minJs = configs.nodeEnv == 'prd';
    // }
    // if (configs.minCss === null) {
    //   configs.minCss = configs.nodeEnv == 'prd';
    // }
  }
  process.env.configs = JSON.stringify(configs);
  return configs;
};
