import React from 'react';
import Regex from 'utils/regs';
import {
  getItem,
  setItem
} from 'business/Cache';

import Toast from 'component/Toast';
import Loading from 'component/Loading';
import StopDefault from 'utils/stopDefault';
import NumberKB from 'component/Keyboard/numberBoard';
import {
  verifyIdNo,
  resetPassword,
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

export default class ResetNewPassword extends React.Component {
  constructor(props) {
    super(props);
    let userInfoForLogin = getItem('userInfoForLogin'),
      userType = !!userInfoForLogin ? userInfoForLogin.userType : 2, //直销是高门槛用户(userType:2)，平台是低门槛用户（userType:0）
      mobileNo = '',
      backUrl = '',
      gobackPage = '';
    if (!!userInfoForLogin) {
      mobileNo = userInfoForLogin.mobileNo;
      backUrl = userInfoForLogin.backUrl;
      gobackPage = userInfoForLogin.gobackPage;
    }
    this.state = {
      idNoClearIcon: false,
      passWordClearIcon: false,
      confirmPassWordClearIcon: false,
      ifJudgePwd: true,
      isIdNoFocus: false,
      isPwdFocus: false,
      isConfirmPwdFocus: false,
      switchPwd: false,
      isIdNoCorrect: userType == 0 ? true : false,
      finishBtnEnable: false,
      isShowLoading: false,
      userType: userType,
      userInfoForLogin: userInfoForLogin,
      mobileNo: mobileNo,
      backUrl: backUrl,
      gobackPage: gobackPage
    };
    init();
  }

  //点击输入框时调用自定义键盘事件
  clickInputOpenKB(e) {
    let {
      type
    } = e.currentTarget.dataset, {
      idNo = ''
    } = this.state;
    StopDefault(e); //阻止冒泡
    setTimeout(() => {
      this.setState({
        [type]: true,
        idNoClearIcon: idNo != '',
        passWordClearIcon: false,
        confirmPassWordClearIcon: false,
        isPwdFocus: false,
        isConfirmPwdFocus: false
      });
      this.refs[type].open();
    }, 50);
  };

  //身份证键盘相关事件
  clickFun(m) {
    this.setState({
      idNo: m.value,
      idNoClearIcon: m.value != ''
    });
  };

  okInputFun(m) {
    let isIdNoCorrect = Regex.regIdCard.test(m.value);
    this.setState({
      isIdNoFocus: false,
      idNoClearIcon: false
    });
    if (isIdNoCorrect) {
      let self = this,
        idNoOpts = {
          'idNo': m.value
        };
      self.setState({
        isShowLoading: true
      });
      verifyIdNo(idNoOpts).then((idNoRes) => {
        let isIdNoCorrect = false,
          finishBtnEnable = false,
          {
            passWord,
            confirmPassWord
          } = self.state;
        if (idNoRes.code == '000000') {
          isIdNoCorrect = true;
          if (Regex.checkPassword(passWord) && Regex.checkPassword(confirmPassWord)) {
            finishBtnEnable = true;
          }
        } else {
          self.refs.toast.open(idNoRes.msg);
        };
        self.setState({
          isIdNoCorrect: isIdNoCorrect,
          finishBtnEnable: finishBtnEnable,
          isShowLoading: false
        });
      });
    } else {
      this.refs.toast.open('输入有效的身份证号');
    };
  };

  clearValue(valueType, refType) { //输入框中的清除按钮
    let clearIconFlag;
    if (valueType === 'idNo') {
      this.refs[refType].clear();
      clearIconFlag = 'idNoClearIcon';
    } else {
      this.refs[refType].focus();
      clearIconFlag = refType == 'isPwdFocus' ? 'passWordClearIcon' : 'confirmPassWordClearIcon';
    };
    this.setState({
      [valueType]: '',
      [refType]: true,
      finishBtnEnable: false,
      ifJudgePwd: false,
      [clearIconFlag]: false
    });
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
      ifJudgePwd: true
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
    this.clickBody(e);
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
            this.judgePwdFormat(val);
          } else {
            this.setState({
              ifJudgePwd: true,
              passWordClearIcon: this.refs.isPwdFocus.value.trim() != ''
            });
          }
        } else {
          if (this.state.confirmPassWord !== '') {
            this.judgePwdFormat(val);
          }
          this.setState({
            confirmPassWordClearIcon: false,
            ifJudgePwd: true
          });
        };
      }, 50);
    };
  };

  //判断输入密码的格式
  judgePwdFormat(val) {
    let {
      passWord,
      confirmPassWord
    } = this.state;
    if (!Regex.checkPassword(val)) {
      this.refs.toast.open('登录密码格式错误');
    } else {
      if (!!passWord && !!confirmPassWord && passWord !== confirmPassWord) {
        this.refs.toast.open('两次输入密码不一致');
      }
    };
  };

  //在输入框输入时的处理事件
  dealInputValue(e) {
    let {
      name
    } = e.target.dataset,
      finishBtnEnable = false, {
        passWord,
        confirmPassWord,
        isIdNoCorrect,
        userType
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
    if (Regex.checkPassword(passWord) && Regex.checkPassword(confirmPassWord)) {
      if (userType == 2 && !isIdNoCorrect) {
        finishBtnEnable = false;
      } else {
        finishBtnEnable = true;
      }
    }
    this.setState({
      [name]: val,
      [clearIconFlag]: val != '',
      finishBtnEnable: finishBtnEnable
    });
  };

  //完成重置密码
  finishResetPassword() {
    let self = this,
      resetPwdOpts,
      loginOpts, {
        isIdNoCorrect,
        passWord,
        confirmPassWord,
        mobileNo,
        userType
      } = self.state;

    if (!Regex.checkPassword(passWord) || !Regex.checkPassword(confirmPassWord)) {
      self.refs.toast.open('登录密码格式错误');
      return;
    } else if (passWord !== confirmPassWord) {
      self.refs.toast.open('两次输入密码不一致');
      return;
    }
    if (!isIdNoCorrect) {
      self.refs.toast.open('输入有效的身份证号');
      return;
    }
    self.setState({
      isShowLoading: true,
      finishBtnEnable: false
    });
    passWord = encrypt(makeLoginPassword(passWord), 1);
    confirmPassWord = encrypt(makeLoginPassword(confirmPassWord), 1);
    resetPwdOpts = {
        passWord,
        confirmPassWord
      },
      loginOpts = {
        'userId': mobileNo,
        'passWord': passWord,
        'code': Request('code') || ''
      };
    self.resetNewPassword(resetPwdOpts, loginOpts);
  };

  //重置密码
  resetNewPassword(resetPwdOpts, loginOpts) {
    let self = this,
      {
        userType,
        isIdNoCorrect,
        backUrl,
        gobackPage
      } = self.state;
    resetPassword(resetPwdOpts).then((resetPwdRes) => {
      if (resetPwdRes.code == '000000' && (userType == 0 || userType == 2 && isIdNoCorrect)) {
        //登录
        wxUserLogin(loginOpts).then(function (loginRes) {
          self.refs.toast.open('密码修改成功');
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
        self.refs.toast.open(resetPwdRes.msg);
      };
      self.setState({
        isShowLoading: false
      });
    });
  };

  //点击空白处收起数字键盘
  clickBody(e) {
    let classList = e.target.classList,
      {
        idNo,
        isIdNoFocus
      } = this.state;
    if (!classList.contains('number-board') && isIdNoFocus) {
      this.refs.isIdNoFocus.close();
      this.okInputFun({
        value: idNo,
      });
    };
  };

  render() {
    return (
      <div className='v-wxlogin'>
        <div className='v-open ' onClick={(e) => this.clickBody(e)}>
          {
            this.state.userType==2
            ?
            <div className='input-wrap number-board' onClick={(e)=>this.clickInputOpenKB(e)} data-type='isIdNoFocus'>
              <div className={this.state.isIdNoFocus || !!this.state.idNo ?'placeholder placeholder-up':'placeholder'} >身份证号</div>
              <div className={this.state.isIdNoFocus?'input input-f':'input'}>{this.state.idNo}</div>
              <ClearIcon ref='idNo' isShowClearIcon={this.state.idNoClearIcon} clearValue={()=>this.clearValue('idNo','isIdNoFocus')} />
            </div>
            :
            ''
          }
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
        	<p className='setpwd-tip'>以后将用此密码登录，请不要忘记</p>
          <a className={this.state.finishBtnEnable?'btn':'btn btn-disable'} onClick={(e)=>this.finishResetPassword(e)} otype='button' otitle={wtLoginModule[7]}>完成</a>
        </div>
        <Toast ref='toast' />
        <Loading isShow={this.state.isShowLoading} />
        <NumberKB ref='isIdNoFocus' type='id' maxLength='18' clickFun={(m) => this.clickFun(m)} okFun={(m) => this.okInputFun(m)} shadowFun={(m) => this.okInputFun(m)} events={true} shadow={false} />
      </div>
    );
  }
}
