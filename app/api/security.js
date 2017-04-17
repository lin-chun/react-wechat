import reqwest from 'reqwest';
// 公用配置
import Config from './configs';
import maps from './maps';
// 加密模块
import {
  JSEncrypt
} from 'jsencrypt';
import CryptoJs from 'crypto-js';
import AES from 'crypto-js/aes';
import ECB from 'crypto-js/mode-ecb';
import Pkcs7 from 'crypto-js/pad-pkcs7';
import Base64 from 'crypto-js/enc-base64';
import Hex from 'crypto-js/enc-hex';
import Utf8 from 'crypto-js/enc-utf8';
import MD5 from 'crypto-js/md5';
import HmacSHA1 from 'crypto-js/hmac-sha1';

// 默认 publicKey
let DefaultPublicKey = {
  'code': '000000',
  'data': {
    'publicKey': '30819F300D06092A864886F70D010101050003818D00308189028181008E5328628A0B061237AD991C84C64EE2DD8B335641AB6C002901E850C5D2F6BF60FF9B21A82AC1BB58A3BF8379624FC9E0989D6C96A51D8A57303B4D759E95448EFCFE503FD3F1B69CB6D41D1D8DA0FA502547BD5FC3D8D14ABF70962E5BE35A94F2B2067977E8D96D3D6F0875316D9B6C7EF3CBBCFF40B3F70B4D788D6C2DF70203010001,30819F300D06092A864886F70D010101050003818D00308189028181008E5328628A0B061237AD991C84C64EE2DD8B335641AB6C002901E850C5D2F6BF60FF9B21A82AC1BB58A3BF8379624FC9E0989D6C96A51D8A57303B4D759E95448EFCFE503FD3F1B69CB6D41D1D8DA0FA502547BD5FC3D8D14ABF70962E5BE35A94F2B2067977E8D96D3D6F0875316D9B6C7EF3CBBCFF40B3F70B4D788D6C2DF70203010001,30819F300D06092A864886F70D010101050003818D00308189028181008BFCDC2FBA15B27F9CE73FBF17465CB6B483AA3C9C69A8E33FBB128A1FD00A4BAFF762CB5118D55025EF0A29153057CA793C33E009D9832BDD4CA1982B25394D0EC2E36A1D0D274D91C07A5683C4A2EE3F30CFB208C26943E0F15BFD399E728DA38396F066910883DE8FEAAF66A2D1FCDE96A5362BBEBC43BA3BE836B836B6BF0203010001,30819F300D06092A864886F70D010101050003818D00308189028181008E5328628A0B061237AD991C84C64EE2DD8B335641AB6C002901E850C5D2F6BF60FF9B21A82AC1BB58A3BF8379624FC9E0989D6C96A51D8A57303B4D759E95448EFCFE503FD3F1B69CB6D41D1D8DA0FA502547BD5FC3D8D14ABF70962E5BE35A94F2B2067977E8D96D3D6F0875316D9B6C7EF3CBBCFF40B3F70B4D788D6C2DF70203010001',
    'timestamp': 1490149360397
  }
};

// 加密
let PublicKey = null;
let Encrypts = [];
let TIME_DIFF = null;
let AES_KEY = null;
let ENCODE_KEY = null;

// 需要加密的模块
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
};

let PublicErr = {
  code: 'err',
  msg: '请求配置失败'
};

// 请求 public key
function getPublicKey() {
  return new Promise((resolve) => {
    let key = 'getPublicKey';
    let api = Config.api;
    let url = Config.api + (Config.isMock ? key : maps[key]);
    let ajax = {
      url: url,
      method: 'get',
      type: 'json',
      timeout: Config.timeOut,
      contentType: 'application/json;charset=utf-8',
      data: {
        publicKeyType: 99,
        skip: 1
      }
    };
    reqwest(ajax).then((res) => {
      if (res && res.code == '000000') {
        resolve(res);
      } else {
        resolve(PublicErr);
      }
    }, err => {
      resolve(PublicErr);
    })
  });
};

// 获取统一加密 aesKey 值 
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

// 加签
function sign(obj) {
  const signRaw = Object.keys(obj)
    .sort()
    .map(key => `${obj[key]}:${key}`)
    .join('|')
  return HmacSHA1('(' + signRaw + ')', AES_KEY).toString(Base64);
};

// 根据 url 判断是否需要加密
function needEncrypt(businessField) {
  for (const fieldName in businessField) {
    if (ENCODE_FIELD[fieldName]) {
      return true;
    }
  }
  return false;
};

/**
 * AES 加密
 * @param value 要加密的数据
 */
function encryptAES(value) {
  return Base64.stringify(AES.encrypt(value, Utf8.parse(AES_KEY), {
    mode: ECB,
    padding: Pkcs7
  }).ciphertext);
};

/**
 * AES 解密
 * @param value 要解密的数据
 */
function decryptAES(value) {
  let result = AES.decrypt(value, Utf8.parse(AES_KEY), {
    mode: ECB,
    padding: Pkcs7
  }).toString(Utf8);
  return result;
};

// 请求参数加密
function processRequest(request) {
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
  };
  if (Config.encrypt) {
    const businessField = Object.assign({}, request);
    let signData;
    // const body = request.body = {}
    const ffFieldVals = JSON.stringify(businessField);
    request = {
      ...PUBLIC_FIELD,
    };
    if (needEncrypt(businessField, request.url)) {
      request.ffEncodeFieldVals = encodeURIComponent(encryptAES(ffFieldVals));
    } else {
      request.ffFieldVals = ffFieldVals;
    }
    // 公共参数统一处理 
    request.ENCODE_KEY = ENCODE_KEY;
    // request.ffFieldVals = ffFieldVals
    signData = {
      'ENCODE_KEY': ENCODE_KEY,
      'ffFieldVals': ffFieldVals,
      ...PUBLIC_FIELD,
      ffTimestamp: ffTimestamp,
      ffRequestId: ffTimestamp
    };
    request.ffSignture = sign(signData);
  } else {
    return request = Object.assign({}, request);
  }
  return request;
};

// 返回参数解密
function processResponse(res) {
  if (Config.encrypt) {
    let json = null
    try {
      json = typeof res == 'string' ? JSON.parse(res) : res;
      if (json && json.ffEncodeFieldVals) {
        json.data = JSON.parse(decryptAES(decodeURIComponent(json.ffEncodeFieldVals)))
        delete json.ffEncodeFieldVals;
      }
      return json;
    } catch (e) {
      return {
        code: 'err',
        msg: '返回数据处理异常'
      };
    }
  }
  return res;
};

function init() {
  let requestTime = new Date().valueOf();
  return new Promise((resolve) => {
    if (PublicKey != null) {
      resolve({
        code: '000000'
      });
    } else {
      getPublicKey().then(response => {
        PublicKey = null;
        if (!(response.code == '000000' && response.data && response.data.publicKey)) {
          DefaultPublicKey.data.timestamp = new Date().valueOf();
          response = DefaultPublicKey;
        } else {
          PublicKey = response.data.publicKey;
        }
        try {
          // 服务端时间戳
          let serverTime = response.data.timestamp;
          TIME_DIFF = serverTime - requestTime;
          let [publicKeyHex, loginKeyHex, tradingKeyHex, bankKeyHex] = response.data.publicKey.split(',');

          Encrypts[0] = new JSEncrypt();
          Encrypts[1] = new JSEncrypt();
          Encrypts[2] = new JSEncrypt();
          Encrypts[3] = new JSEncrypt();
          // F 公钥
          Encrypts[0].setPublicKey(publicKeyHex);
          // 登录公钥，不用
          Encrypts[1].setPublicKey(loginKeyHex);
          // 交易密码
          Encrypts[2].setPublicKey(tradingKeyHex);
          // 银行卡密码
          Encrypts[3].setPublicKey(bankKeyHex);
          AES_KEY = getAESKey();
          ENCODE_KEY = encrypt(AES_KEY, 0);
          // 获取 url 参数
          let paramsIndex = location.href.indexOf('?');
          let paramsIndexEnd = location.href.indexOf('#');
          let searchParam = {};
          if (paramsIndex > 0) {
            let params = '';
            if (paramsIndexEnd !== -1) {
              params = location.href.substring(paramsIndex + 1, paramsIndexEnd);
            } else {
              params = location.href.substring(paramsIndex + 1);
            }
            let querys = params.split('&');
            for (var key in querys) {
              var values = querys[key];
              if (typeof values === 'string') {
                let m = values.split('=');
                searchParam[m[0]] = m[1];
              }
            }
          }
          resolve({
            code: '000000'
          });
          PublicKey = response.data;
        } catch (e) {
          PublicKey = null;
          resolve(PublicErr);
        }
      });
    }
  });
};

/**
 * 加密
 * @param method 0=通讯，1=登录，2=交易，3=行方
 */
function encrypt(str, method = 0) {
  if (method == 1 || method == 3) {
    str = makePassword(str);
  }
  return Encrypts[method].getKey().encrypt(str).toUpperCase();
};

// 常用密码加密
function makePassword(pwd, addTime = true) {
  if (addTime) {
    return pwd + '$CurTime=' + (new Date().valueOf() + TIME_DIFF);
  }
  return pwd;
};

// 常用登录加密算法
function makeLoginPassword(pwd) {
  let key1 = MD5(Config.site).toString(Hex);
  let key2 = HmacSHA1(pwd, key1).toString(Base64);
  return key2 || pwd;
};

export {
  init,
  encrypt,
  processRequest,
  processResponse,
  makePassword,
  makeLoginPassword
};
