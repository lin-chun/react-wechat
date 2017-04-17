import React from 'react';
import Regex from 'utils/regs';
import {
  getItem,
  setItem
} from 'business/Cache';
import StopDefault from 'utils/stopDefault';
import Toast from 'component/Toast';
import Loading from 'component/Loading';
import NumberKB from 'component/Keyboard/numberBoard';
import {
  getShotMsgVerifyCode,
  verifyCodeForRetPwd
} from 'api';
import {
  getWxCondeLink
} from './components/publicFun';
import ClearIcon from './components/component';

// 埋点
import {
  wtLoginModule
} from 'business/webtrends'

import 'css/login.scss';

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    let source = this.props.location.query.source || '';
    this.state = {
      mobileClearIcon: false,
      smsClearIcon: false,
      isMobileFocus: false,
      isVerifyCodeFocus: false,
      nextBtnEnable: false,
      shotMsgBtnEnable: false,
      initSmsCheckTimeOut: 60,
      smsCheckTimeOut: 60,
      getSmsState: true, //记录是否还在发送验证码的倒计时之中
      resendFlag: 0,
      shotMsgBtnText: '获取验证码',
      isShowLoading: false,
      btnText: source == 'resetPwdPage' ? '继续' : '下一步',
      source: source
    };
  };

  //点击输入框时调用自定义键盘事件
  clickInputOpenKB(e) {
    let {
      type
    } = e.currentTarget.dataset, {
        mobileNo = '',
        smsCode = ''
      } = this.state,
      currentDom,
      disDom,
      flag,
      disType;
    StopDefault(e); //阻止冒泡
    if (type == 'isMobileFocus') {
      currentDom = 'mobileClearIcon';
      disDom = 'smsClearIcon';
      flag = mobileNo != '';
      disType = 'isVerifyCodeFocus';
    } else {
      currentDom = 'smsClearIcon';
      disDom = 'mobileClearIcon';
      flag = smsCode != '';
      disType = 'isMobileFocus';
    };
    this.setState({
      [type]: true,
      [disType]: false,
      [currentDom]: flag,
      [disDom]:false
    });
    this.refs[disType].close();
    this.refs[type].open();
  };

  //数字键盘相关的操作
  clickFun(m) {
    let {
      name,
      currentDom
    } = this.getInputVauleName(), {
        oldMobileNo,
        mobileNo
      } = this.state,
      shotMsgBtnEnable = false,
      nextBtnEnable = false;
    if (name == 'mobileNo') {
      shotMsgBtnEnable = Regex.verifyMobileNo(m.value) && oldMobileNo != m.value;
    } else {
      nextBtnEnable = Regex.verifyMobileNo(mobileNo) && m.value.length === 6;
    };
    !!name && this.setState({
      [name]: m.value,
      [currentDom]: m.value ? true : false,
      shotMsgBtnEnable: shotMsgBtnEnable,
      nextBtnEnable: nextBtnEnable
    });
  };

  //是否显示清除按钮
  showClearIconOrNot(m) {
    let {
      isMobileFocus,
      isVerifyCodeFocus,
      mobileNo,
      smsCode
    } = this.state,
      val = m ? m : (isMobileFocus ? 'mobileNo' : 'smsCode'),
      currentDom = isMobileFocus ? 'mobileClearIcon' : 'smsClearIcon';
    this.setState({
      [currentDom]: val ? true : false
    });
  };

  clearValue(valueType, refType) { //输入框中的清除按钮
    let currentDom,
      disRefType;
    if (refType == 'isMobileFocus') {
      currentDom = 'mobileClearIcon';
      disRefType = 'isVerifyCodeFocus';
    } else {
      currentDom = 'smsClearIcon';
      disRefType = 'isMobileFocus';
    };
    this.setState({
      [valueType]: '',
      nextBtnEnable: false,
      [refType]: true,
      [disRefType]: false,
      [currentDom]: false
    });
    this.refs[refType].clear();
    this.refs[refType].open();
    this.refs[disRefType].close();
  };

  okInputFun(m) {
    let isMobileNo = false,
      nextBtnEnable = false,
      {
        name,
        currentDom
      } = this.getInputVauleName(),
      {
        isMobileFocus,
        isVerifyCodeFocus,
        shotMsgBtnEnable,
        getSmsState,
        mobileNo,
        oldMobileNo = '',
        smsCode
      } = this.state,
      currentVal;
    mobileNo = isMobileFocus ? (m ? m.value : mobileNo) : mobileNo;
    isMobileNo = Regex.verifyMobileNo(mobileNo);
    if (isMobileFocus) {
      currentVal = mobileNo;
      if (!!mobileNo && !isMobileNo) {
        this.refs.toast.open('手机号格式错误');
      } else {
        if (oldMobileNo != mobileNo) {
          getSmsState = true;
          oldMobileNo = mobileNo;
        }
      };
    } else if (isVerifyCodeFocus) {
      smsCode = m ? m.value : smsCode;
      currentVal = smsCode;
    }
    this.setState({
      isMobileFocus: isMobileFocus ? !isMobileFocus : isMobileFocus,
      isVerifyCodeFocus: isVerifyCodeFocus ? !isVerifyCodeFocus : isVerifyCodeFocus,
      shotMsgBtnEnable: (isMobileNo && getSmsState) ? true : false,
      nextBtnEnable: (isMobileNo && !!smsCode && smsCode.length == 6) ? true : false,
      oldMobileNo: oldMobileNo,
      [name]: currentVal,
      [currentDom]: false
    });
  };

  getInputVauleName() {
    let name,
      currentDom, {
        isMobileFocus,
        isVerifyCodeFocus
      } = this.state;
    if (isMobileFocus) {
      name = 'mobileNo';
      currentDom = 'mobileClearIcon';
    } else if (isVerifyCodeFocus) {
      name = 'smsCode';
      currentDom = 'smsClearIcon';
    } else {
      name = '';
    };
    return {
      name,
      currentDom
    };
  };

  //点击获取短信验证码
  getVerifyCode() {
    let self = this,
      {
        mobileNo,
        resendFlag,
        shotMsgBtnEnable,
        initSmsCheckTimeOut,
        smsCheckTimeOut,
        getSmsState
      } = self.state,
      getCodeOptions = {
        'mobileNo': mobileNo,
        'otpType': 17,
        'resendFlag': resendFlag
      };
    if (!Regex.verifyMobileNo(mobileNo)) {
      self.refs.toast.open('手机号格式错误');
      return;
    }
    if (!shotMsgBtnEnable) { //按钮不可用
      return;
    }
    self.setState({
      getSmsState: false,
      shotMsgBtnEnable: false,
      isShowLoading: true
    });
    getShotMsgVerifyCode(getCodeOptions).then(function (res) {
      if (res.code == '000000') {
        if (!!self.timer) {
          clearTimeout(self.timer);
        }
        self.setState({
          isShowLoading: false,
          smsFlag: res.data.smsFlag,
          shotMsgBtnText: (initSmsCheckTimeOut - 1) + '秒后重发',
          isVerifyCodeFocus: true,
          smsCode:''
        });
        self.refs.isVerifyCodeFocus.clear();
        self.refs.isVerifyCodeFocus.open();
        self.timer = setTimeout(self.shotMsgTimer.bind(self), 1000);
      } else {
        self.refs.toast.open(res.msg);
        self.setState({
          getSmsState: true,
          isShowLoading: false,
          shotMsgBtnEnable: true
        });
      };
    });
  };

  //验证码按钮倒计时
  shotMsgTimer() {
    let self = this,
      time = self.state.smsCheckTimeOut - 1,
      shotMsgBtnText;
    if (time <= 1) {
      self.setState({
        resendFlag: 1,
        getSmsState: true,
        smsCheckTimeOut: 60,
        shotMsgBtnText: '重新发送',
        shotMsgBtnEnable: true
      });
    } else {
      self.setState({
        smsCheckTimeOut: time,
        shotMsgBtnText: (time - 1) + '秒后重发'
      });
      self.timer = setTimeout(self.shotMsgTimer.bind(self), 1000);
    }
  };

  //验证短信动态码和OTP鉴权(下一步)
  verifyCodeForRetPwd() {
    let self = this,
      {
        source,
        backUrl
      } = self.props.location.query,
      mobileNo = self.state.mobileNo,
      smsCode = self.state.smsCode,
      verifyCodeOptions = {
        'mobileNo': mobileNo,
        'smsCode': smsCode //此处需要拿用户输入的验证码，即用户输入验证码时需要改变state状态
      };
    if (self.state.nextBtnEnable) {
      self.setState({
        isShowLoading: true,
        nextBtnEnable: false
      });
      verifyCodeForRetPwd(verifyCodeOptions).then(function (res) {
        self.setState({
          isShowLoading: false,
          nextBtnEnable: true
        })
        if (res.code == '000000' || res.code == '030106' || res.code == '000201') {
          let isRegister = res.data.isRegister,
            userType = isRegister == '1' ? res.data.userType : '',
            userInfoForLogin,
            gobackPage,
            href;
          if (source && source == 'resetPwdPage') {
            let oldInfo = getItem('userInfoForLogin');
            backUrl = backUrl || (!!oldInfo && oldInfo.backUrl);
            gobackPage = oldInfo.gobackPage;
            gobackPage -= 2;
          } else {
            gobackPage = -2;
          }
          userInfoForLogin = {
            'mobileNo': mobileNo,
            'backUrl': backUrl || '',
            'userType': userType,
            'isRegister': isRegister,
            'gobackPage': gobackPage
          };
          setItem('userInfoForLogin', userInfoForLogin);

          if (isRegister == '0') { //未注册
            getWxCondeLink('#/register');
          } else {
            (!!source && source == 'resetPwdPage') ? getWxCondeLink('#/resetNewPassword'): getWxCondeLink('#/inputpwd');
          }
        } else {
          self.refs.toast.open(res.msg);
        }
      });
    }
  };

  //点击空白处收起数字键盘
  clickBody(e) {
    let classList = e.target.classList,
      {
        isMobileFocus,
        isVerifyCodeFocus
      } = this.state,
      currentRef = isMobileFocus ? 'isMobileFocus' : 'isVerifyCodeFocus';
    if (!(classList.contains('input-wrap') || classList.contains('clear-icon'))) {
      this.refs[currentRef].close();
      this.okInputFun();
    };
  };

  render() {
    return (
      <div className='v-wxlogin'>
        <div className='v-open' onClick={(e) => this.clickBody(e)}>
        	<div className='input-wrap' onClick={(e)=>this.clickInputOpenKB(e)} data-type='isMobileFocus'>
        		<div className={(this.state.isMobileFocus || !!this.state.mobileNo)?'placeholder placeholder-up':'placeholder'} >手机号</div>
        		<div className={this.state.isMobileFocus?'input input-f':'input'}>{this.state.mobileNo}</div>
            <ClearIcon ref='mobileNo' isShowClearIcon={this.state.mobileClearIcon} clearValue={()=>this.clearValue('mobileNo','isMobileFocus')} />
          </div>
          <div className={this.state.isVerifyCodeFocus?'input-wrap msg-input-wrap input-f':'input-wrap msg-input-wrap'}>
            <div className='pos-rel' style={{display:`inline-block`}} onClick={(e)=>this.clickInputOpenKB(e)} data-type='isVerifyCodeFocus'>
              <div className={this.state.isVerifyCodeFocus || !!this.state.smsCode?'placeholder placeholder-up':'placeholder'}>短信验证码</div>
              <div className='input msg-input'>{this.state.smsCode}</div>
              <ClearIcon ref='smsCode' isShowClearIcon={this.state.smsClearIcon} clearValue={()=>this.clearValue('smsCode','isVerifyCodeFocus')} />
            </div>
            <button className='verify-code' onClick={()=>this.getVerifyCode()}>{this.state.shotMsgBtnText}</button>
          </div>
          <a className={this.state.nextBtnEnable?'btn':'btn btn-disable'} onClick={(e)=>this.verifyCodeForRetPwd(e)}  otype='button' otitle={this.state.source == 'resetPwdPage'?wtLoginModule[6]:wtLoginModule[1]}>{this.state.btnText}</a>
        </div>
        <Toast ref='toast' />
        <Loading isShow={this.state.isShowLoading} />
        <NumberKB ref='isMobileFocus' maxLength='11' clickFun={(m) => this.clickFun(m)} okFun={(m) => this.okInputFun(m)} shadowFun={(m) => this.okInputFun(m)} events={true} shadow={false} />
        <NumberKB ref='isVerifyCodeFocus' maxLength='6' clickFun={(m) => this.clickFun(m)} okFun={(m) => this.okInputFun(m)} shadowFun={(m) => this.okInputFun(m)} events={true}  shadow={false} />
      </div>
    );
  };
};
