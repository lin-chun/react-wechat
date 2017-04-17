// 公用缓存，目前只支持存取 object 对象
let cache = {};
let cid = 'REACTQIDONG1702-';

/**
 * 目前已有key值维护
 * userInfo : 用户登录信息
 * openInfo : 用户开户绑卡信息
 * userInfoForLogin : 用于登录的信息（包括userType）
 */

/**
 * 获取缓存
 * @param type 1=session 0=local
 */
export function getItem(key, type) {
  key = cid + key;
  let result = cache[key];
  if (result == null) {
    if (type == '1') {
      result = sessionStorage.getItem(key);
    } else {
      result = localStorage.getItem(key);
    }
    result = result == null || result == '' ? null : JSON.parse(result);
    cache[key] = result;
  }
  return result;
};

/**
 * 设置缓存
 * @param value 目前必须传 json
 */
export function setItem(key, value, type) {
  key = cid + key;
  cache[key] = value;

  let str = value == null ? '' : JSON.stringify(value);
  try {
    if (type == '1') {
      sessionStorage.setItem(key, str);
    } else {
      localStorage.setItem(key, str);
    }
  } catch (e) {}
};

// 删除值
export function removeItem(key, type) {
  key = cid + key;
  cache[key] = null;
  try {
    if (type == '1') {
      sessionStorage.removeItem(key);
    } else {
      localStorage.removeItem(key);
    }
  } catch (e) {}
};

export function setString(key, value, type) {
  key = cid + key;
  cache[key] = value;

  let str = value == null ? '' : str;
  try {
    if (type == '1') {
      sessionStorage.setItem(key, str);
    } else {
      localStorage.setItem(key, str);
    }
  } catch (e) {}
};

export function getString(key, type) {
  key = cid + key;
  let result = cache[key];
  if (result == null || result == '') {
    try {
      if (type == '1') {
        result = sessionStorage.getItem(key);
      } else {
        result = localStorage.getItem(key);
      }
      result = result == null || result == '' ? null : result;
      cache[key] = result;
    } catch (e) {}
  }
};

/**
 * 获取用户信息
 * @param login 用户信息不存在的时候，是否要跳到登录页面
 */
export function getUserInfo(login) {
  let info = getItem('userInfo');
  if (info == null && login !== false) {
    console.log('go to login');
  }
  return info;
};
