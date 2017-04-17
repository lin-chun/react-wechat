/**
 * 公用请求管理，登录区内的需要有 login 注释
 * @author zhongzhuhua
 */
import configs from './configs';
import request from './request';

// 测试用
export function test() {
  return request('test', {
    name: 'relogin'
  });
};

// 获取用户风险等级问卷
export function getRiskQuestions(options) {
  return request('getRiskQuestions', options);
};

/**
 * 校验用户风险等级 login
 * @param surveyNo 问卷号
 * @param answerNos 回答的题目答案编号 001,002,003
 */
export function setUserRisk(surveyNo, answerNos) {
  return request('setUserRisk', {
    surveyNo: surveyNo,
    answerNos: answerNos
  });
};

/**
 * 用户开卡身份认证
 * @param id 身份证
 * @param name 用户姓名
 */
export function getCustInfo(id, name) {
  return request('getCustInfo', {
    idNo: id,
    cifName: name
  });
};

/**
 * 用户信息核查
 * @param id 身份证
 * @param name 用户姓名
 */
export function checkUserIdInfo(id, name) {
  return request('checkUserIdInfo', {
    idNo: id,
    cifName: name,
    validPeriod: '2015.01.01-长期'
  });
};

/**
 * 开户前鉴卡 login
 * @param options
   {
     cifName: 客户名
     idNo: 身份证号
     otherBankFlag: 本行他行标志
     bindAccountNo: 银行卡号
     bankNo: 行号
     bankName: 银行名称
     operationType: 操作类型
   }
 */
export function signCardByOpen(options) {
  return request('signCardByOpen', options);
};

/**
 * 注册绑卡
 * @param options 
    {
      cifName: '名称',
      idNo: '身份证',
      trsPassword: '交易密码',
      agree: '协议字段' 目前传 Y
   }
 */
export function register(options) {
  options.agree = 'Y';
  return request('register', options);
};

/** 
 * 发送短信验证码 login
 * @param mobileNo 手机号码
 * @param otpType 15 开户
 */
export function sendSms(mobileNo, otpType) {
  return request('sendSms', {
    mobileNo: mobileNo,
    otpType: otpType
  });
};

/**
 * 校验短信验证码 login
 * @param 参照 sendSms 参数
 * @param smsCode 短信验证码
 */
export function checkSms(mobileNo, smsCode, otpType) {
  return request('checkSms', {
    smsCode: smsCode,
    mobileNo: mobileNo,
    otpType: otpType
  });
};

/**
 * 校验银行卡类型
 * @param cardNo 卡号
 */
export function getCardBin(cardNo) {
  return request('getCardBin', {
    cardNo: cardNo
  });
};

/**
 * 获取产品详情
 * @param productId 产品id
 */
export function getProductDetail(productId, interfaceVersion) {
  return request('getProductDetail', {
    productId: productId,
    interfaceVersion: interfaceVersion
  })
};

/**
 * 获取持仓详情
 * @param productId 产品id
 */
export function getPosition(productId) {
  return request('getPosition', {
    ffProductId: productId
  })
};

/**
 * 获取系统时间
 */
export function getTime() {
  return request('getTime')
};

// ===================== 登录、注册、找回密码 start=====================

/**
 * 检测用户是否登录，因为后台没有提供相应的接口，所以用一个简单的登录内接口来检测
 * @param 不传参
 */
export function checkLoginState() {
  return request('getUserRisk',null,{
    specialType:'checkLoginState'
  });
};

/**
 * 获取短信验证码
 */
export function getShotMsgVerifyCode(options) {
  return request('getShotMsgVerifyCode', options);
};

/**
 * 验证短信验证码和OPT鉴权
 */
export function verifyCodeForRetPwd(options) {
  return request('verifyOptAndShotMsg', options);
};

/**
 * 获取图形验证码
 */
export function getImgVerifyCode() {
  return request('getImgVerifyCode');
};

/**
 * 验证图形验证码
 */
export function verifyImgCode(options) {
  return request('verifyImgCode', options);
};

/**
 * 登录接口
 */
export function wxUserLogin(options) {
  return request('wxUserLogin', options);
};

/**
 * 微信登录续登
 */
export function wxContinueLogin(options,opt) {
  return request('wxContinueLogin', options,opt);
};

/**
 * 根据协议类型获取协议信息
 */
export function protocolInfo(options) {
  return request('protocolInfo', options);
};

/**
 * 通过设置密码进行注册
 */
export function registerNewUser(options) {
  return request('registerNewUser', options);
};

/**
 * 验证身份证
 */
export function verifyIdNo(options) {
  return request('verifyIdNo', options);
};

/**
 * 找回密码
 */
export function resetPassword(options) {
  return request('getBackPassword', options);
};
// ===================== 登录、注册、找回密码 end=====================

/*
 *资产查询
 */
export function queryAsset(options) {
  return request('queryAsset', options);
};

/**
 * 获取七日收益列表
 * @param ffProductId 产品id
 * @param timePeriod 时间周期
 */
export function getSevthYield(ffProductId, timePeriod) {
  return request('getSevthYield', {
    ffProductId: ffProductId,
    timePeriod: timePeriod
  })
};

/**
 * 获取年化收益列表
 * @param ffProductId 产品id
 * @param timePeriod 时间周期
 */
export function getMillionIncome(ffProductId, timePeriod) {
  return request('getMillionIncome', {
    ffProductId: ffProductId,
    timePeriod: timePeriod
  })
};

/**
 * 创建金融订单
 * @param options
 * @param options.refereeNo 可输可不输
 * @param options.tranPwd 赎回输入
    {
      ffProductId: '产品Id',
      amount: '交易份额',
      transactionType: '0(申购)/1(赎回)',
      refereeNo: '推荐人',
      renew: '0(续期)/1()不续期',
      tranPwd: '电子账户交易密码',
    }
 */
export function creatOrder(options) {
  return request('creatOrder', options)
};

/**
 * 获取交易明细列表
    {
      ffProductId: '产品Id',
      startDate: '开始时间',
      endDate: '结束时间'
    }
 */
export function getDealInfo(options) {
  return request('getDealInfo', options)
};

/**
 * 获取历史收益明细列表
 * @param options.ffProductId 产品id
 * @param options.startDate 开始时间
 * @param options.endDate 结束时间
 */
export function getEarnInfo(options) {
  return request('getEarnInfo', options)
};

/**
 * 支付
 * @param 
 */
export function pay(options) {
  return request('pay', options)
};

/**
 * 获取交易明细列表
 * @param 
 */
export function getPaymentList(options) {
  // debugger
  return request('getPaymentList', options)
};


/**
 * 查询用户风险等级
 * @param 不传参
 */
export function getUserRisk() {
  return request('getUserRisk')
};

/**
 * 退出
 * @param 不传参
 */
export function logout(options) {
  return request('logout', options)
};
