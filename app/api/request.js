import configs from './configs';
import reqwest from 'reqwest';
import maps from './maps';
import {
  processRequest,
  processResponse,
  init
} from './security';
import {
  wxContinueLogin
} from 'api';
import {
  getUserInfo
} from 'business/Cache';

/**
 * 数据请求
 * @param key 配置键
 * @param params 要传的参数
 * @param opt 其他配置
    {
      method: 'get' 'post'
      type: 'json' 'text' 'jsonp'
      timeOut: 8000 多少秒超时
      specialType:'specialType'  //需要用来特别处理的类型
    }
 * @author zhongzhuhua
 */
export default (key, params, opt = {}) => {
  let api = configs.api;
  let url = configs.api + (configs.isMock ? key : maps[key]);
  let ajax = {
    url: url,
    method: opt.method || 'get',
    type: opt.type || 'json',
    timeout: opt.timeOut || configs.timeOut,
    contentType: 'application/json;charset=utf-8',
    data: params
  };
  console.log(ajax);
  //传输参数加密加签
  return new Promise((resolve) => {
    return init().then((res) => {
      if (res.code == '000000') {
        params = processRequest(params);
        ajax.data = params;
        send(ajax, resolve);
      } else {
        resolve(res);
      }
    }).catch((err) => {
      resolve({
        code: 'err',
        msg: '系统繁忙，请稍后再试'
      });
    });
  }).then((res) => {
    // 000002 000005 登录超时 未登录   000004 被迫下线
    if (res.code == '000002' || res.code == '000005') {
      if (window.navigator.userAgent.toLowerCase().includes('micromessenger')) {
        return new Promise((resolve) => {
          let userInfo = getUserInfo(),
            opts = {
              openId: (!!userInfo && userInfo.openId) || ''
            };
          if (!!opts.openId) {
            try {
              wxContinueLogin(opts, opt).then((data) => {
                if (opt.specialType == 'checkLoginState') {
                  resolve(data);
                } else {
                  if (data.code == '000000') {
                    send(ajax, resolve);
                  } else {
                    location.hash = '#/login';
                  };
                };
              });
            } catch (e) {
              if (opt.specialType == 'checkLoginState') {
                resolve({
                  code: '000002'
                });
              } else {
                resolve
              };
            }
          } else {
            location.hash = '#/login';
          };
        }).then((res) => {
          if (res.code == '000002' || res.code == '000004' || res.code == '000005') {
            if (opt.specialType == 'checkLoginState') {
              return 0; //未登录
            } else {
              location.hash = '#/login';
            }
          } else {
            if (opt.specialType == 'checkLoginState') {
              if(res.code=='000000'){
                return 1; //已登录
              }else{
                return 0; //未登录
              };
            } else {
              console.log('续登重请求成功');
              console.log(res);
              return res;
            };
          };
        });
      } else {
        if (opt.specialType == 'checkLoginState') {
          return 0;
        } else {
          location.hash = '#/login';
        };
      }
    } else if (res.code == '000004') {
      if (opt.specialType == 'checkLoginState') {
        return 0;
      } else {
        location.hash = '#/login';
      };
    } else {
      console.log(res);
      if (opt.specialType == 'checkLoginState') {
        if(!!params.ffFieldVals && params.ffFieldVals.includes('openId')){
          return res;
        }else if (res.code == '000000') {
          return 1;
        } else {
          return -1;
        };
      } else {
        return res;
      };
    }
  });
};

function send(ajax, resolve) {
  reqwest(ajax).then((res) => {
    //返回参数解密
    try {
      res = processResponse(res);
      resolve(res);
    } catch (e) {
      debugger
      resolve({
        code: 'err',
        msg: '返回数据处理异常'
      });
    }
  }, (err) => {
    let status = err.status;
    resolve({
      code: 'err',
      msg: status == '0' ? '当前网络异常，请检查网络' : '网络异常，请刷新重试'
    });
  });
};
