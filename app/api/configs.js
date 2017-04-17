/**
 * 公用配置文件
 * @author zhongzhuhua
 */
let api = {
  'dev': '../mock/',
  'stg': 'http://test3-fbtoam.pingan.com.cn/',
  'prd': 'https://test3-fbtoam.pingan.com.cn/'
};
let env = process.env.nodeEnv;  
let isMock = false;
// 如果不是生产环境，则可以重写配置 ，避免打包生产的时候，忘记改配置
if (env !== 'prd') {
  env = 'stg';
  isMock = env == 'dev';
}

// 微信 openId 和入口页面地址
let openId = 'wx7c7d2b3dde097bc9';
let h5Prd = api[env] + 'btoa/dist/index.html';

export default {
  // 多少秒超时
  timeOut: 8000,
  // 环境 
  env: env,
  // 是否使用了 mock 数据
  isMock: isMock,
  // 请求的域名
  api: api[env],
  // 是否加密
  encrypt: true || env == 'prd',
  // site编号，标版：10004
  site:'10004',
  // 公众号的openid
  openId: openId,
  // 获取code码时的微信跳转链接(完整链接 ：wxLink+h5Prd+'#/'+真正跳转的链接(h5Prd+'#/'+realLink需要encodeURIComponent编码）+wxParams)
  wxLink: 'https://open.weixin.qq.com/connect/oauth2/authorize',
  // 生产链接（主要用于获取code码时），此处在发生产时需要修改
  h5Prd: h5Prd,
  // 获取code码时的微信跳转链接中需要的参数
  wxParams: '&response_type=code&scope=snsapi_base&state=123&connect_redirect=1#wechat_redirect'
};
