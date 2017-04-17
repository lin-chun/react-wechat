# react

## 环境搭建，建议使用系统自带终端

    需要 nodejs v6.2.0 以上版本
    git clone https://github.com/zhongzhuhua/webReact.git
    cd webreact
    npm install --registry=https://registry.npm.taobao.org



## 开发规范

    为了避免 css 全局污染，使用如下规范，样式统一为小写

    components:
    .c-文件夹名称

    css 视图样式命名：
    .v-文件夹名称

    business 业务组件：
    .b-文件夹名称

    所有的组件写在 app/components 文件夹下，组件单个文件夹分开，纯 js 组件放在 app/components/utils 文件夹中
    公用的 scss 组件写在 app/components/scss 中，主题颜色和 z-index 级别控制必须写在 theme.scss 中
    所有的 -webkit- 除了 scss/*.scss 之外，都必须调用 mixin.scss 中的 prefix 方法或者其他相对应的方法来添加，不需要手动写



## 代码规范

    * 统一使用 webpack 推荐语法，不考虑迁移，不用 cmd 和 amd 规范
    * [()] run();  (function(){})(); 小括号后除数组内的，配置内的无法加，其他的建议加 ;
    * function() {}; 结尾建议加 ;
    * return {}; 结尾建议加 ;
    * 以 ' 未基础字符串号，   var name = '"This is demo"';
    * 每个 function 后回车一行，如果有参数的，建议复杂参数打上注释
    * 目前可以考虑以 es6 为标准，这个每个项目组自己取舍
    * Tab 键按照 2个空格来处理
    * 所有 react 代码使用 jsFormat 格式化，其他代码可以通过配置 JsFormat 和 .jsbeautifyrc 中配置一致
    * 使用 JsFormat 和 HTML/CSS/JS Prettify 来格式化



## 环境运行

    必须执行 node server.js ，这一句必须放在前面
    然后后面带运行参数，如果带一个数字代表启动的端口
    如果是 dev stg prd 则是相对应的环境
    css 则代表 css 要压缩，不配置默认不压缩 [目前该配置无效，css压缩在js里面了]
    js 则代表 js 要压缩，不配置默认不压缩
    del 则代表删除原来的 dist 文件夹
    mock 则代表请求 mock 数据的时候，不要进行网络延时，默认有 0~3000 延迟

    如下指令，则是开启开发环境，端口是 6000
    node server.js 6000 dev



## 页面访问

    路由在 app/index.js 配置
    接口请求全部方法写在 app/api/maps.js 和 app/api/index.js 中



## 目录结构

```
|app                        -- 开发目录
├── api                     -- 接口数据请求
    └── configs             -- 接口请求配置文件
    └── index               -- ajax 请求方法
    └── map                 -- ajax 接口配置
    └── request             -- 公用 ajax 请求处理
├── components              -- 组件
    └── scss                -- 公用 scss 文件
    └── utils               -- 公用工具类
    └── ****                -- 公用组件
├── business                -- 业务组件，非所有项目公用，修改率可能相对高的组件
├── mock                    -- mock 数据
├── views                   -- 页面
├── index.html              -- 入口页面
├── index.js                -- 入口脚本，路由配置文件
|dist                       -- 打包后的文件目录
README.md                   -- 项目使用基础文档
package.json                -- 项目配置和依赖
server.js                   -- 项目启动文件
webpack.config.js           -- webpack 打包配置文件

```