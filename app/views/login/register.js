import React from 'react';
import Regex from 'utils/regs';
import {
  getItem,
  setItem
} from 'business/Cache';
import Toast from 'component/Toast';
import Loading from 'component/Loading';
import NumberKB from 'component/Keyboard/numberBoard';
import {
  protocolInfo,
  registerNewUser,
  wxUserLogin
} from 'api';
import {
  init,
  makeLoginPassword,
  encrypt
} from 'api/security';
import Request from 'utils/request';
import {
  getWxCondeLink,
  setGobackPage
} from './components/publicFun';
import ClearIcon from './components/component';

// 埋点
import {
  wtLoginModule
} from 'business/webtrends'

import 'css/login.scss';

export default class Register extends React.Component {
  constructor(props) {
    super(props);
    let userInfoForLogin = getItem('userInfoForLogin'),
      mobileNo = '',
      backUrl = '',
      userType = 0,
      gobackPage = -2;
    if (!!userInfoForLogin) {
      mobileNo = userInfoForLogin.mobileNo;
      backUrl = userInfoForLogin.backUrl;
      userType = userInfoForLogin.userType;
      gobackPage = userInfoForLogin.gobackPage;
    }
    this.state = {
      passWordClearIcon: false,
      confirmPassWordClearIcon: false,
      ifJudgePwd: true,
      isPwdFocus: false,
      isConfirmPwdFocus: false,
      switchPwd: false,
      isSelectReadRule: true,
      registerBtnEnable: false,
      isShowLoading: false,
      protocolName: '银行一账通协议',
      protocolUrl: '#',
      firstRequestProtocol: true,
      userInfoForLogin: userInfoForLogin,
      mobileNo: mobileNo,
      backUrl: backUrl,
      userType: userType,
      gobackPage: gobackPage
    };
    init();
  }

  componentWillMount() {
    this.getProtocolInfo();
  };

  //获取协议信息
  getProtocolInfo() {
    let {
      protocolUrl
    } = this.state;
    if (protocolUrl != '#') {
      window.location.href = protocolUrl;
    } else {
      let self = this,
        opts = {
          protocolType: '0002'
        };
      self.setState({
        isShowLoading: true
      });
      protocolInfo(opts).then((res) => {
        let {
          firstRequestProtocol
        } = self.state;
        if (res.code == '000000') {
          let {
            protocolName,
            protocolUrl
          } = res.data;

          if (!firstRequestProtocol && !!protocolUrl) {
            window.location.href = protocolUrl;
          } else {
            self.setState({
              protocolName: res.data.protocolName,
              protocolUrl: res.data.protocolUrl
            });
          }
        } else {
          if (!firstRequestProtocol) {
            self.refs.toast.open(res.msg);
          }
        };
        self.setState({
          isShowLoading: false,
          firstRequestProtocol: false
        });
      });
    };
  };

  //焦点在输入框中时处理placeholder
  setPlaceholder(e) {
    let {
      type
    } = e.currentTarget.dataset, {
        passWord = '',
        confirmPassWord = ''
      } = this.state,
      clearIconFlag = type === 'isPwdFocus' ? 'passWordClearIcon' : 'confirmPassWordClearIcon',
      flag = type === 'isPwdFocus' ? passWord != '' : confirmPassWord != '';
    this.setState({
      [type]: true,
      [clearIconFlag]: flag,
      ifJudgePwd:true
    });
    this.refs[type].focus();
  };

  //控制密码的明文或密文显示
  switchPwdFun(e) {
    let {
      type
    } = e.target.dataset;
    e.stopPropagation();
    this.setState({
      switchPwd: !this.state.switchPwd,
      ifJudgePwd: false,
      [type]: true,
      passWordClearIcon: this.refs.isPwdFocus.value.trim() != ''
    });
    this.refs[type].focus();
  };

  clearValue(valueType, refType) { //输入框中的清除按钮
    let disRefType = refType === 'isConfirmPwdFocus' ? 'isPwdFocus' : 'isConfirmPwdFocus';
    this.setState({
      [valueType]: '',
      [refType]:true,
      [disRefType]: false,
      registerBtnEnable: false,
      ifJudgePwd: false
    });
    this.refs[refType].focus();
  };

  //焦点离开输入框时处理placeholder
  dealPlaceholder(e) {
    let val = e.target.value.trim(),
      {
        type,
        name
      } = e.target.dataset;
    this.setState({
      [type]: false
    });
    if (val === '') {
      this.setState({
        [name]: ''
      });
    } else {
      setTimeout(() => {
        if (type === 'isPwdFocus') {
          if (this.state.ifJudgePwd) {
            this.setState({
              passWordClearIcon: false
            });
            if (!Regex.checkPassword(val)) {
              this.refs.toast.open('登录密码格式错误');
            } else {
              let {
                passWord = '',
                  confirmPassWord = ''
              } = this.state;
              if (!!passWord && !!confirmPassWord && passWord !== confirmPassWord) {
                this.refs.toast.open('两次输入密码不一致');
              }
            };
          } else {
            this.setState({
              ifJudgePwd: true,
              passWordClearIcon: this.refs.isPwdFocus.value.trim() != ''
            });
          };
        } else {
          this.setState({
            confirmPassWordClearIcon: false,
            ifJudgePwd: true
          });
        };
      }, 50);
    };
  };

  //在输入框输入时的处理事件
  dealInputValue(e) {
    let {
      name
    } = e.target.dataset,
      registerBtnEnable = false, {
        passWord,
        confirmPassWord,
        isSelectReadRule
      } = this.state,
      val = e.target.value.trim(),
      clearIconFlag;
    if (name === 'passWord') { //因为state并不是即时生效的，所以需要加以区分
      passWord = val;
      clearIconFlag = 'passWordClearIcon';
    } else {
      confirmPassWord = val;
      clearIconFlag = 'confirmPassWordClearIcon';
    };
    if (Regex.checkPassword(passWord) && Regex.checkPassword(confirmPassWord) && passWord === confirmPassWord && isSelectReadRule) {
      registerBtnEnable = true;
    };
    this.setState({
      [name]: val,
      [clearIconFlag]: val != '',
      registerBtnEnable: registerBtnEnable
    });
  };

  //是否选择阅读协议方框
  isSelectReadRule() {
    let registerBtnEnable = false,
      {
        passWord,
        confirmPassWord,
        isSelectReadRule
      } = this.state;
    if (Regex.checkPassword(passWord) && Regex.checkPassword(confirmPassWord) && !isSelectReadRule) {
      registerBtnEnable = true;
    };

    this.setState({
      registerBtnEnable: registerBtnEnable,
      isSelectReadRule: !isSelectReadRule
    });
  };

  //注册
  register() {
    let self = this,
      {
        response_type
      } = self.props.location.query,
      {
        mobileNo,
        backUrl,
        userType,
        passWord,
        confirmPassWord,
        isSelectReadRule,
        gobackPage
      } = self.state,
      options = {
        mobileNo
      };
    if (!Regex.checkPassword(passWord) || !Regex.checkPassword(confirmPassWord)) {
      self.refs.toast.open('登录密码格式错误');
      return;
    } else if (passWord !== confirmPassWord) {
      self.refs.toast.open('两次输入密码不一致');
      return;
    }
    if (!isSelectReadRule) {
      self.refs.toast.open('未勾选协议，无法注册');
      return;
    }
    self.setState({
      isShowLoading: true
    });
    passWord = encrypt(makeLoginPassword(passWord), 1);
    confirmPassWord = encrypt(makeLoginPassword(confirmPassWord), 1);
    options.passWord = passWord;
    options.confirmPassWord = confirmPassWord;
    registerNewUser(options).then((res) => {
      if (res.code == '000000') {
        //登录
        let opts = {
          'userId': mobileNo,
          'passWord': passWord,
          'code': Request('code') || ''
        };
        wxUserLogin(opts).then(function (loginRes) {
          self.refs.toast.open('注册成功');
          setTimeout(() => { //这个只是为了让用户能看到注册成功的提示
            if (loginRes.code == '000000') {
              let allUserInfo = loginRes.data.userInfo;
              allUserInfo.userType = userType;
              setItem('userInfo', allUserInfo);
              !!backUrl ? location.hash = backUrl : history.go(gobackPage);
            } else {
              setGobackPage(self.state);
              getWxCondeLink('#/inputpwd');
            }
          }, 1000);
        });
      } else {
        self.refs.toast.open(res.msg);
      };
      self.setState({
        isShowLoading: false
      })
    });
  };

  render() {
    return (
      <div className='v-wxlogin'>
          <div className={this.state.isPwdFocus?'input-wrap setpwd-wrap input-f':'input-wrap setpwd-wrap'}>
            <div className='pos-rel pwd-input'>
              <div onClick={(e)=>this.setPlaceholder(e)} data-type='isPwdFocus'>
                <div className={(this.state.isPwdFocus || !!this.state.passWord)?'placeholder placeholder-up':'placeholder'}>登录密码</div>
                <input ref='isPwdFocus' type={this.state.switchPwd?'text':'password'} className='bor-n input' maxLength='16' onInput={(e)=>this.dealInputValue(e)} onBlur={(e)=>this.dealPlaceholder(e)} onCopy={(e)=>e.preventDefault()} onPaste={(e)=>e.preventDefault()} data-type='isPwdFocus' data-name='passWord' value={this.state.passWord} />
              </div>
              <ClearIcon ref='passWord' isShowClearIcon={this.state.passWordClearIcon} clearValue={()=>this.clearValue('passWord','isPwdFocus')} />
            </div>
            <div className={this.state.switchPwd?'switch-pwd pwd-show':'switch-pwd'} onClick={(e)=>this.switchPwdFun(e)} data-type='isPwdFocus'></div>
          </div>
          <p className='setpwd-tip'>8-16位数字和字母组合，区分大小写</p>
          <div className='input-wrap' onClick={(e)=>this.setPlaceholder(e)} data-type='isConfirmPwdFocus'>
            <div className={(this.state.isConfirmPwdFocus || !!this.state.confirmPassWord)?'placeholder placeholder-up':'placeholder'}>重复输入密码</div>
            <input ref='isConfirmPwdFocus' type='password' className={this.state.isConfirmPwdFocus?'input input-f':'input'} maxLength='16' onInput={(e)=>this.dealInputValue(e)} onBlur={(e)=>this.dealPlaceholder(e)} onCopy={(e)=>e.preventDefault()} onPaste={(e)=>e.preventDefault()} data-type='isConfirmPwdFocus' data-name='confirmPassWord' value={this.state.confirmPassWord} />
            <ClearIcon ref='confirmPassWord' isShowClearIcon={this.state.confirmPassWordClearIcon} clearValue={()=>this.clearValue('confirmPassWord','isConfirmPwdFocus')} />
          </div>
          <div>
            <span className={this.state.isSelectReadRule?'unsel-icon sel-icon':'unsel-icon'} onClick={(e)=>this.isSelectReadRule(e)}></span>
            <span className='rule-tip'>已阅读并同意</span>
            <a href='javascript:void(0);' className='rule-link' onClick={()=>this.getProtocolInfo()}>《{this.state.protocolName}》</a>
          </div>
          <a className={this.state.registerBtnEnable?'btn':'btn btn-disable'} onClick={(e)=>this.register(e)} otype='button' otitle={wtLoginModule[2]}>注册</a>
          <Toast ref='toast' />
          <Loading isShow={this.state.isShowLoading} />
        </div>
    );
  }
}
