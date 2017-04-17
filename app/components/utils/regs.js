// 用户姓名正则校验
exports.regName = /^[\u4E00-\u9FA5]{2,6}$/;
// 18位身份证
exports.regIdCard = /^\d{6}(18|19|20)\d{2}(\d{2})(0[1-9]|[1-2]\d|3[01])\d{3}(\d|X)$/;
// 简单判断银行卡
exports.regBankCard = /^62[0-9]{10,20}$/;
// 简单判断手机号
exports.regMobileNo = /^[1][3-8][0-9]{9}$/;
//验证手机号
exports.verifyMobileNo = function(mobileNo) {
  return !mobileNo ? !!mobileNo : this.regMobileNo.test(mobileNo);
};
//8-16位数字和字母组合，区分大小写
exports.checkPassword = function(pwd) {
  return !pwd ? !!pwd : /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/.test(pwd);
};
// 手机号中间数字变*
exports.replaceMobile = function(m) {
  return !m ? '' : (m.length < 7 ? m : m.replace(/(\d{3})\d{4}/, '$1****'));
};
// 处理金额
exports.dealNumber = function(val) {
  if (val == null || val === '') {
    return '';
  }
  if (!/[0-9]+\.{0,1}\d*$/.test(val)) {
    return '';
  }
  var arr = val.split('.');
  var num1 = arr[0].replace(/,/g, '');
  if (num1 !== '0' && num1.indexOf('0') === 0 && num1.indexOf('.') !== 1) {
    num1 = num1.replace(/^0+/, '');
  }
  var number = num1.replace(/,/g, '').replace(/(\d+?)(?=(?:\d{3})+$)/g, '$1,');
  var result = number + (val.indexOf('.') > -1 ? '.' : '') + (arr.length === 2 ? arr[1] : '.00');
  return result;
};
