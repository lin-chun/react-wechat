import React from 'react';
import Regex from 'utils/regs';
import Request from 'utils/request';
import {
  getItem,
  setItem
} from 'business/Cache';
import Toast from 'component/Toast';
import Loading from 'component/Loading';
import {
  init,
  makeLoginPassword,
  encrypt
} from 'api/security';
import {
  getImgVerifyCode,
  verifyImgCode,
  wxUserLogin
} from 'api';
import {
  getWxCondeLink,
  setGobackPage
} from './components/publicFun';
import ClearIcon from './components/component';

// 埋点
import {
  wtLoginModule
} from 'business/webtrends';

import 'css/login.scss';
import ReLoadImg from 'images/reload_icon.png';

// 密码错误,账号被锁定的提示
class ForgetPwdTipPage extends React.Component {
  render() {
    return (
      <div>
        <div className={this.props.isShow?'reset-mask':'reset-mask hidden'}></div>
        <section className={this.props.isShow?'tip-wrap tip-wrap-show':'tip-wrap'}>
          <div className='tip'>
            <div>{this.props.data.wrongPwdTipText}</div>
            <div>{this.props.data.wrongPwdTipTextAdd}</div>
          </div>
          <a href='#/login?source=resetPwdPage' className='btn' otype='button' otitle={wtLoginModule[4]}>找回密码</a>
          <a className='btn re-write' onClick={this.props.handleEvent}>{this.props.data.wrongPwdBtnText}</a>
        </section>
      </div>
    );
  }
};

export default class Logininputpwd extends React.Component {
  constructor(props) {
    super(props);
    let userInfoForLogin = getItem('userInfoForLogin'),
      {
        wrongUserNameOrPwd
      } = this.props.location.query,
      mobileNo = '',
      backUrl = '',
      userType = '',
      gobackPage = 0;
    if (!!userInfoForLogin) {
      mobileNo = userInfoForLogin.mobileNo;
      backUrl = userInfoForLogin.backUrl;
      userType = userInfoForLogin.userType;
      gobackPage = userInfoForLogin.gobackPage;
    }
    this.state = {
      tokenCodeClearIcon: false,
      passWordClearIcon: false,
      ifJudgePwd: true,
      isPwdFocus: false,
      switchPwd: false,
      isShowLoading: false,
      imgBgCode: false,
      imgBgCodeLoading: '',
      loginBtnEnable: false,
      wrongUserNameOrPwd: wrongUserNameOrPwd || 5,
      isShowPwdTipText: false,
      code: Request('code') || '',
      mobileNo: mobileNo,
      backUrl: backUrl,
      userType: userType,
      gobackPage: gobackPage,
      userInfoForLogin: userInfoForLogin || ''
    };
    init();
  };

  componentWillMount() {
    this.getImgVerifyCodeFun();
  };

  //获取图形验证码
  getImgVerifyCodeFun() {
    let self = this;
    if (self.state.imgBgCodeLoading == 'loading') {
      return;
    }
    self.setState({
      imgBgCodeLoading: 'loading',
      imgBgCode: ''
    });
    getImgVerifyCode().then(function (res) {
      if (res.code == '000000') {
        let tokenImg = res.data.tokenImg;
        tokenImg = tokenImg.indexOf('data:image/png;base64,') > -1 ? tokenImg : `data:image/png;base64,${tokenImg}`;
        self.setState({
          imgBgCode: tokenImg,
          imgBgCodeLoading: '',
          tokenCode: '',
          tokenCodeClearIcon: false
        });
      } else {
        self.setState({
          imgBgCode: ReLoadImg,
          imgBgCodeLoading: ''
        });
        self.refs.toast.open(res.msg);
      }
    });
  };

  //焦点在输入框中时处理placeholder
  setPlaceholder(e) {
    let {
      type
    } = e.currentTarget.dataset, {
        passWord = '',
        tokenCode = ''
      } = this.state,
      clearIconFlag = type === 'isPwdFocus' ? 'passWordClearIcon' : 'tokenCodeClearIcon',
      flag = type === 'isPwdFocus' ? passWord != '' : tokenCode != '';
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

  //焦点离开输入框时处理placeholder
  dealPlaceholder(e) {
    let target = e.target,
      {
        type,
        name
      } = target.dataset,
      val = target.value.trim();
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
          let {
            ifJudgePwd
          } = this.state;
          if (!ifJudgePwd) {
            this.setState({
              ifJudgePwd: true,
              passWordClearIcon: this.refs.isPwdFocus.value.trim() != ''
            });
          } else {
            !Regex.checkPassword(val) && this.refs.toast.open('登录密码格式错误');
            this.setState({
              passWordClearIcon: false
            });
          }
        } else {
          this.setState({
            tokenCodeClearIcon: false,
            ifJudgePwd:true
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
      val = e.target.value.trim(),
      loginBtnEnable = false, {
        passWord,
        tokenCode,
        wrongUserNameOrPwd
      } = this.state,
      clearIconFlag = name === 'passWord' ? 'passWordClearIcon' : 'tokenCodeClearIcon';
    tokenCode = name === 'tokenCode' ? val : tokenCode; //因为state并不是即时生效的，所以需要加以区分
    passWord = name === 'passWord' ? val : passWord;
    if (Regex.checkPassword(passWord) && !!tokenCode && tokenCode.length === 4) {
      loginBtnEnable = true;
    }
    this.setState({
      [name]: val,
      loginBtnEnable: loginBtnEnable,
      [clearIconFlag]: val ? true : false
    });
  };

  clearValue(valueType, refType) { //输入框中的清除按钮
    let disRefType = refType === 'isImgCodeFocus' ? 'isPwdFocus' : 'isImgCodeFocus';
    this.setState({
      [valueType]: '',
      [refType]: true,
      [disRefType]: false,
      loginBtnEnable: false,
      ifJudgePwd: false,
      tokenCodeClearIcon: false,
      passWordClearIcon: false
    });
    this.refs[refType].focus();
  };

  //登录
  login() {
    let self = this,
      {
        tokenCode,
        mobileNo,
        passWord,
        code,
        userType,
        gobackPage
      } = self.state;
    if (!self.state.loginBtnEnable) {
      return;
    }
    self.setState({
      loginBtnEnable: false,
      isShowLoading: true
    })
    verifyImgCode({
      'tokenCode': tokenCode
    }).then(function (imgCodeRes) {
      if (imgCodeRes.code != '000000') {
        self.refs.toast.open(imgCodeRes.msg);
        if (imgCodeRes.code == '010802') { // 验证码已经超时，请重新获取
          self.setState({
            imgBgCode: ReLoadImg
          })
        }
        self.setState({
          isShowLoading: false
        });
      } else {
        let options = {
          'userId': mobileNo,
          'passWord': encrypt(makeLoginPassword(passWord), 1),
          'code': code
        };
        wxUserLogin(options).then(function (res) {
          if (res.code == '000000') {
            let allUserInfo = res.data.userInfo;
            allUserInfo.userType = userType;
            setItem('userInfo', allUserInfo);
            self.setState({
              loginBtnEnable: false,
              isShowLoading: false
            });
            self.refs.toast.open('登录成功');
            setTimeout(() => {
              let {
                backUrl
              } = self.state;
              !!backUrl ? location.hash = backUrl : history.go(gobackPage);
            }, 1000);
          } else {
            let wrongPwdBtnText = '',
              wrongPwdTipText = '',
              wrongPwdTipTextAdd = '',
              isShowPwdTipText = false,
              loginBtnEnable = true,
              wrongUserNameOrPwd = self.state.wrongUserNameOrPwd;
            if (res.code == '030111' || res.code == '030107' || res.code == '030102' || res.code == '030101') { //用户名或者密码错误,账号锁定
              if (res.code == '030102' && wrongUserNameOrPwd === 5) {
                wrongUserNameOrPwd = 0;
              } else {
                wrongUserNameOrPwd--;
              };
              if (wrongUserNameOrPwd <= 0) {
                wrongPwdBtnText = '取消';
                wrongPwdTipText = '该账户已锁定，请24小时后再试';
                wrongPwdTipTextAdd = '或找回密码解锁';
                isShowPwdTipText = true;
              } else if (wrongUserNameOrPwd <= 2) {
                wrongPwdBtnText = '重新输入';
                wrongPwdTipText = `是否忘记密码？再错误${wrongUserNameOrPwd}次将锁定帐号`;
                isShowPwdTipText = true;
              } else {
                self.refs.toast.open(res.msg);
                self.locationHref(wrongUserNameOrPwd);
              }
            } else {
              self.refs.toast.open(res.msg);
              self.locationHref(wrongUserNameOrPwd);
            }
            self.setState({
              loginBtnEnable: loginBtnEnable,
              isShowLoading: false,
              isShowPwdTipText: isShowPwdTipText,
              wrongUserNameOrPwd: wrongUserNameOrPwd,
              wrongPwdTipText: wrongPwdTipText,
              wrongPwdTipTextAdd: wrongPwdTipTextAdd,
              wrongPwdBtnText: wrongPwdBtnText
            });
          };
        });
      }
    })
  };

  //判断是否是微信浏览器，若是，则需要刷新页面
  locationHref(wrongUserNameOrPwd) {
    if (window.navigator.userAgent.toLowerCase().includes('micromessenger')) {
      setTimeout(() => {
        getWxCondeLink(`#/inputpwd?wrongUserNameOrPwd=${wrongUserNameOrPwd}`);
      }, 1000);
    }
  };

  //隐藏账号或密码错误弹窗
  hidePwdTipText() {
    this.setState({
      isShowPwdTipText: false
    });
    if (window.navigator.userAgent.toLowerCase().includes('micromessenger') && this.state.wrongUserNameOrPwd > 0) {
      getWxCondeLink(`#/inputpwd?wrongUserNameOrPwd=${this.state.wrongUserNameOrPwd}`);
    }
  };

  //找回密码
  gotoResetPwd() {
    setGobackPage(this.state);
    getWxCondeLink('#/resetNewPassword');
  };

  render() {
    let mobileNo = Regex.replaceMobile(this.state.mobileNo);
    return (
      <div className='v-wxlogin txt-r'>
        <Loading isShow={this.state.isShowLoading} />
        {
          mobileNo
          ?
          <div className='phone-wrap'>
        		<span>手机号</span>
            <span className='phone'>{mobileNo}</span>
        	</div>
          :
          ''
        }
        <div className={this.state.isPwdFocus?'input-wrap pwd-input-wrap input-f':'input-wrap pwd-input-wrap'}>
          <div className='pos-rel pwd-input'>
            <div onClick={(e)=>this.setPlaceholder(e)} data-type='isPwdFocus'>
              <div className={(this.state.isPwdFocus || !!this.state.passWord)?'placeholder placeholder-up':'placeholder'}>登录密码</div>
              <input ref='isPwdFocus' type={this.state.switchPwd?'text':'password'} className='bor-n input' maxLength='16' onInput={(e)=>this.dealInputValue(e)} onBlur={(e)=>this.dealPlaceholder(e)} onCopy={(e)=>e.preventDefault()} onPaste={(e)=>e.preventDefault()} data-type='isPwdFocus' data-name='passWord' value={this.state.passWord} />
            </div>
            <ClearIcon ref='passWord' isShowClearIcon={this.state.passWordClearIcon} clearValue={()=>this.clearValue('passWord','isPwdFocus')} />
          </div>
          <div className={this.state.switchPwd?'switch-pwd pwd-show':'switch-pwd'} onClick={(e)=>this.switchPwdFun(e)} data-type='isPwdFocus'></div>
        </div>
        <a href='javascript:void(0);' className='get-pwd' onClick={()=>this.gotoResetPwd()} otype='button' otitle={wtLoginModule[3]}>找回密码</a>
        <div className={this.state.isImgCodeFocus?'input-wrap msg-input-wrap img-code-input-wrap input-f':'input-wrap msg-input-wrap img-code-input-wrap'} onClick={(e)=>this.setPlaceholder(e)} data-type='isImgCodeFocus'>
          <div className='pos-rel img-code-input'>
            <div className={(this.state.isImgCodeFocus || !!this.state.tokenCode)?'placeholder placeholder-up':'placeholder'}>图形验证码</div>
            <input type='text' ref='isImgCodeFocus' className='input img-code-input' maxLength='4' onInput={(e)=>this.dealInputValue(e)} onBlur={(e)=>this.dealPlaceholder(e)} onCopy={(e)=>e.preventDefault()} onPaste={(e)=>e.preventDefault()} data-type='isImgCodeFocus' data-name='tokenCode' value={this.state.tokenCode} />
            <ClearIcon ref='tokenCode' isShowClearIcon={this.state.tokenCodeClearIcon} clearValue={()=>this.clearValue('tokenCode','isImgCodeFocus')} />
          </div>
          <div className='img-verify-code' onClick={(e)=>this.getImgVerifyCodeFun(e)}>
            {
              this.state.imgBgCode
              ?
              <img className='img-code' src={this.state.imgBgCode} alt='图形验证码' />
              :
              <div className='loading-icon'></div>
            }
          </div>
        </div>
        <a className={this.state.loginBtnEnable?'btn':'btn btn-disable'} onClick={(e)=>this.login(e)} otype='button' otitle={wtLoginModule[5]}>登录</a>
        <Toast ref='toast' />
        <ForgetPwdTipPage data={this.state} isShow={this.state.isShowPwdTipText} handleEvent={()=>this.hidePwdTipText()} />
      </div>
    );
  }
};
