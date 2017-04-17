/**
 *@description 请求URL中的search参数
 *@author yuxiaoli 2017-03-24
 */

export default function request(key) {
  let search = location.search && location.search.substr(1),
    request = search && search.split('&'),
    arr = [],
    value = null;
  if (!!request && request.length > 0) {
    for (let i = 0; i < request.length; i++) {
      arr = request[i].split('=');
      if (decodeURIComponent(arr[0]) == key) {
        value = decodeURIComponent(arr[1]);
      }
    }
  }
  return value;
};
