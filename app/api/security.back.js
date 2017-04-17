// import Vue from 'vue'
import { JSEncrypt } from 'jsencrypt';
import cryptoJs from 'crypto-js/core';
import AES from 'crypto-js/aes';
import ECB from 'crypto-js/mode-ecb';
import Pkcs7 from 'crypto-js/pad-pkcs7'
import Base64 from 'crypto-js/enc-base64'
import Hex from 'crypto-js/enc-hex'
import Utf8 from 'crypto-js/enc-utf8'
import MD5 from 'crypto-js/md5'
import HmacSHA1 from 'crypto-js/hmac-sha1'
window.cryptoJs = cryptoJs
import Config from './configs';
import reqwest from 'reqwest';
import maps from './maps';
const initError = '安全连接建立失败，请稍后尝试'
const loginError = '登录失败，请回到手机银行重试'
const Domain = Config.api
let TIME_DIFF
let AES_KEY
let AES_KEY_PARSED
let ENCODE_KEY

const ENCODE_FIELD = {
  payeeAcName: true,
  payeeAcNo: true,
  accountNo: true,
  bankNo: true,
  cifName: true,
  identityNo: true,
  mobilePhone: true,
  idNo: true,
  mobileNo: true,
  cnName: true,
  bindAccountNo: true
}

// 公共字段
//   ffAppID 应用ID  Y 各site具体传值请见下方渠道代码表格
//   ffDeviceID  设备ID  Y takingData方法获取
//   ffOs  设备系统  Y IOS/Android
//   ffOsVersion 操作系统版本号 Y 例：7.0.1/8.1.2/4.4.2/4.2.2
//   ffNativeVersion 版本号 Y 例：1.0.0
//   ffChannel 渠道标识  N android市场投放渠道
//   ffScreenSize  屏幕尺寸（width,height）  N
//   ffLocaleCode  位置信息（经度,纬度） N
//   ffTimestamp 时间戳 N
//   ffSignture  数字签名  N
//   ffRequestId 请求ID  Y
//   ffApiVersion  API版本号  Y 模块版本号，后端定义，前端传入。
//   ffInfVersion  接口版本号 N 接口版本号
//   ffClientType  客户端类型 N 客户端类型: H5, android, IOS

const getPublicKey = retryTime => new Promise((resolve, reject) => {
  // const getPublicKey = retryTime =>  {
  let key = "getPublicKey";
  let api = Config.api;
  let url = Config.api + (Config.isMock ? (key + '.json') : maps[key]);
  let ajax = {
    url: url,
    method: 'get',
    type: 'json',
    timeout: Config.timeOut,
    contentType: 'application/json;charset=utf-8',
    data: { publicKeyType: 99, skip: 1 }
  };
  reqwest(ajax).then((res) => {
    resolve(res)
  }, err => {
    console.log(err)
    reject(err)
  })
});

function makePassword(pwd, addTime = true) {
  if (addTime) {
    return pwd + '$CurTime=' + (new Date().valueOf() + TIME_DIFF || localStorage.getItem('TIME_DIFF'))
  }
  return pwd
};

/*
 *@description 登录密码的加密方式
 *@author yuxiaoli
 */
export function makeLoginPassword(pwd) {
  let key1 = MD5(Config.site).toString(Hex);
  let key2 = HmacSHA1(pwd, key1).toString(Base64);
  return key2 || pwd;
};

function getAESKey() {
  let key = [];
  for (let i = 0; i < 16; i++) {
    var num = Math.floor(Math.random() * 26);
    var charStr = String.fromCharCode(97 + num);
    key.push(charStr.toUpperCase());
  }
  var result = key.join('');
  return result;
};

function sign(obj) {
  const signRaw = Object.keys(obj)
    .sort()
    .map(key => `${obj[key]}:${key}`)
    .join('|')
  return HmacSHA1('(' + signRaw + ')', AES_KEY).toString(Base64);
}

function needEncrypt(businessField, url) {
  // @ TODO 根据 url 判断是否需要加密
  for (const fieldName in businessField) {
    if (ENCODE_FIELD[fieldName]) {
      return true
    }
  }
  return false
}

function needEncodeKey(url) {
  // 判断是否登录区
  return true
}

/**
 * AES 加密
 * @param value 要加密的数据
 */
function encryptAES(value) {
  return Base64.stringify(AES.encrypt(value, Utf8.parse(AES_KEY), {
    mode: ECB,
    padding: Pkcs7
  }).ciphertext)
}

/**
 * AES 解密
 * @param value 要解密的数据
 */
function decryptAES(value) {
  let a = AES.decrypt(value, Utf8.parse(AES_KEY), {
    mode: ECB,
    padding: Pkcs7
  }).toString(Utf8)

  console.log("AES_KEY")
  console.log(a)
  return a
}

let Logger
if (process.env.NODE_ENV === 'development') {
  Logger = Object.assign({}, console)
  if (!Logger.groupCollapsed) {
    Logger.groupCollapsed = Logger.log
  }
  if (!Logger.groupEnd) {
    Logger.groupEnd = Logger.log.bind(Logger, '—— log end ——')
  }
}
export function processRequest(request) {
  if (!TIME_DIFF) {
    init().then()
  }
  const ffTimestamp = new Date().valueOf() + parseFloat(TIME_DIFF);
  const PUBLIC_FIELD = {
    ffAppID: '10009',
    ffDeviceID: '4C303B70-8938-469F-81E0-9C20EDC84F73',
    ffOs: 'H5',
    ffOsVersion: 'ffOsVersion',
    ffNativeVersion: '1.9.2',
    ffChannel: 'ZXZQ_H5',
    ffClientType: 'H5',
    // 待后端确定，乱传会报错
    ffApiVersion: '5',
    // ffInfVersion: '1.0',
    ffScreenSize: '360,750',
    ffLocaleCode: '0,0',
    ffTimestamp: ffTimestamp,
    ffRequestId: ffTimestamp
  }
  if (Config.encrypt) {
    const businessField = Object.assign({}, request, request)
    let signData
    if (process.env.NODE_ENV === 'development') {
      Logger.groupCollapsed(`security request: ${request.method} ${request.url}`)
      Logger.log('request params: ')
      Logger.log(businessField)
      Logger.groupEnd()
    }
    // const body = request.body = {}
    const ffFieldVals = JSON.stringify(businessField)
    request = {
      ...PUBLIC_FIELD,
    }
    if (needEncrypt(businessField, request.url)) {
      request.ffEncodeFieldVals = encodeURIComponent(encryptAES(ffFieldVals))
    } else {
      request.ffFieldVals = ffFieldVals
    }
    // 公共参数统一处理
    if (needEncodeKey(request.url)) {
      request.ENCODE_KEY = ENCODE_KEY
    }
    // request.ffFieldVals = ffFieldVals
    signData = {
        'ENCODE_KEY': ENCODE_KEY,
        'ffFieldVals': ffFieldVals,
        ...PUBLIC_FIELD,
        ffTimestamp: ffTimestamp,
        ffRequestId: ffTimestamp
      },
      request.ffSignture = sign(signData)
  } else {
    return request = Object.assign({}, request)
  }
  return request
}

export function processResponse(response, request) {
  if (Config.encrypt) {
    let json = null
    try {
      json = typeof response === 'string' ? JSON.parse(response) : response
    } catch (e) {

    }
    if (json && json.ffEncodeFieldVals) {
      json.data = JSON.parse(decryptAES(decodeURIComponent(json.ffEncodeFieldVals)))
      delete json.ffEncodeFieldVals
      if (process.env.NODE_ENV === 'development') {
        Logger.groupCollapsed(`security response: ${request.method} ${request.url}`)
        Logger.log('request body: ')
        Logger.log(json)
        Logger.groupEnd()
      }
      // response.json = () => json
    }
    return json
  }
  return response
}

export function securityInterceptor(request, next) {
  if (request.url.indexOf('getPublicKey') !== -1) {
    return next();
  }
  const needProcess = request.url.indexOf('btoa/') !== -1
  if (needProcess) {
    processRequest(request)
  }
  var timeouted = false
  var tid = setTimeout(() => {
    timeouted = true
    next(request.respondWith({}, {
      status: 408
    }))
  }, 24000)
  next((response) => {
    if (timeouted) {
      return
    }
    if (needProcess) {
      processResponse(response, request)
    }
    clearTimeout(tid)
      // 统一处理公共逻辑
      // return new Promise((resolve, reject) => {
      //   resolve(response)
      // });
  })
}

const encryptF = new JSEncrypt()
const encryptLogin = new JSEncrypt()
const encryptTrading = new JSEncrypt()
const encryptBank = new JSEncrypt()

function setLocalStorage(args) {
  for (var key in args) {
    localStorage.setItem(key, args[key])
  }
}

function getLocalStorage(data) {
  return localStorage.getItem(data)
}
export function init() {
  if (encryptF.key && TIME_DIFF) {
    return Promise.resolve();
  }
  const requestTime = new Date().valueOf()
  return getPublicKey(3)
    .then(response => {
      if (response.code === '000000') {
        // // 服务端时间戳
        const serverTime = response.data.timestamp;
        // console.log('timestamp', serverTime)
        TIME_DIFF = serverTime - requestTime
          // console.log(TIME_DIFF)
        let [publicKeyHex, loginKeyHex, tradingKeyHex, bankKeyHex] = response.data.publicKey.split(',')
          // console.log("*********************")
          // console.log(loginKeyHex)
          // F 公钥
        encryptF.setPublicKey(publicKeyHex)
          // console.log('publicKeyHex', publicKeyHex)
          // 登录公钥，不用
        encryptLogin.setPublicKey(loginKeyHex)
          // console.log('loginKeyHex', loginKeyHex)
          // 交易密码
        encryptTrading.setPublicKey(tradingKeyHex)
          // console.log('tradingKeyHex', tradingKeyHex)
          // 银行卡密码
        encryptBank.setPublicKey(bankKeyHex)
          // console.log('bankKeyHex', bankKeyHex)

        AES_KEY = getAESKey()
          // console.log('AES key: ' + AES_KEY)
          // AES_KEY_PARSED = Utf8.parse(AES_KEY)
        ENCODE_KEY = encrypt(AES_KEY, 0)
          // setLocalStorage({
          //     'ENCODE_KEY': ENCODE_KEY,
          //     'AES_KEY': AES_KEY,
          //     'TIME_DIFF': TIME_DIFF,
          //   })
          // 获取 url 参数
        let paramsIndex = location.href.indexOf('?')
        let paramsIndexEnd = location.href.indexOf('#')
        let searchParam = {}
        if (paramsIndex > 0) {
          let params = ''
          if (paramsIndexEnd !== -1) {
            params = location.href.substring(paramsIndex + 1, paramsIndexEnd)
          } else {
            params = location.href.substring(paramsIndex + 1)
          }
          let querys = params.split('&')
          for (var key in querys) {
            var values = querys[key]
            if (typeof values === 'string') {
              let m = values.split('=')
              searchParam[m[0]] = m[1]
            }
          }
        }
      } else {
        throw new Error(initError)
      }
    })
}

// 加密
// method:
//  0. 通讯秘钥
//  1. 登录
//  2. 交易
//  3. 行方
export function encrypt(str, method = 0) {
  if (method == 1 || method == 3) {
    str = makePassword(str)
  }
  let encryptType
  if (method === 0) {
    encryptType = encryptF
  } else if (method === 1) {
    encryptType = encryptLogin
  } else if (method === 2) {
    encryptType = encryptTrading
  } else if (method === 3) {
    encryptType = encryptBank
  } else {
    throw new Error()
  }
  return encryptType.getKey().encrypt(str).toUpperCase()
}
