import React from 'react';
import Loading from 'component/Loading';
import NumberBoard from 'component/Keyboard/numberBoard';
import Dialog from 'component/Dialog';
import OtpBoard from 'component/Keyboard/otpBoard';
import PaywordBoard from 'component/Keyboard/paywordBoard';
import TranBoard from 'component/Keyboard/tranBoard';
import Configs from 'api/configs';
import {
  getWxCondeLink
} from '../login/components/publicFun';
import {
  setItem
} from 'business/Cache';
import {
  test
} from 'api';

/** 
 * 默认首页，测试页
 * @author zhongzhuhua
 */
class Home extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };
  state = {
    LoadingShow: false
  };
  constructor(props) {
    super(props);
  };
  Loading() {
    console.log('Loading');
    this.setState({
      LoadingShow: true
    });
  };
  toRisk() {
    this.context.router.push({
      pathname: '/risk',
      query: {
        // 产品类型
        ptype: 3,
        // 产品所需用户风险等级
        plevel: 5,
        // 产品代码
        pid: 'P0001',
        // 产品名称
        pname: '汇金180天 103期',
      }
    });
  };
  toOpen() {
    this.context.router.push('/open/idcard');
  };
  number() {
    this.refs.number.open();
  };
  dialog() {
    this.refs.dialog.open();
  };
  myAlert() {
    this.refs.alert.open('标题');
  };
  toLogin() {
    location.hash = '/login';
  };
  dialogSafe() {
    this.refs.safeBoard.open();
  };
  reLogin() {
    test();
  };
  login(type) {
    setItem('userInfo', {
      'customerId': '820041482745490504',
      'mobileNo': '15063461893',
      'userType': type
    });
  };
  dialogOtp() {
    this.refs.OtpBoard.open();
  };
  dialogPay() {
    this.refs.safe.open();
  };
  dialogTran() {
    this.refs.tran.open();
  };
  callbackPayword(m) {
    console.log(m);
  };
  toFive() {
    this.context.router.push({
      pathname: '/product/detail/' + '381CEF5E940D0242E053C081140A55CA',
    });
  };
  toSeven() {
    this.context.router.push({
      pathname: '/product/detail/' + '60CE45614DA04DC78556E31F5F5DA841',
    });
  }
  render() {
    return (
      <div style={{fontSize: '30px'}} >
        <div onClick={() => this.toFive()}>富盈5号</div>
        <div onClick={() => this.toSeven()}>富盈7号</div> 
        <div onClick={() => this.toOpen()}>开户绑卡</div>
       {/* {<div onClick={() => this.number()}>数字键盘</div>
        <div onClick={() => this.toRisk()}>风险评估</div>
        <div onClick={() => this.dialog()}>弹窗</div>
        <div onClick={() => this.myAlert()}>alert</div>
        <div onClick={() => this.dialogSafe()}>变数键盘</div>
        <div onClick={() => this.dialogOtp()}>otp</div>
        <div onClick={() => this.dialogPay()}>安全键盘</div>
        <div onClick={() => this.dialogTran()}>交易键盘</div>
        <div onClick={() => this.Loading()}>Loading测试</div>
        <div onClick={() => this.reLogin()}>续登</div> }*/}
        <div onClick={() => this.toLogin()}>opt鉴权登录</div>
        <div onClick={() => this.context.router.push('property')}>资产中心</div>
        <div onClick={() => this.context.router.push('center')}>个人中心</div>
        {
          Configs.env == 'dev' ? (<div onClick={() => this.toRisk()}>风险评估</div>) : (<span></span>)
        }
        {
          Configs.env == 'dev' ? (<div onClick={() => this.login(0)}>假装登录低门槛</div>) : (<span></span>)
        }
        {
          Configs.env == 'dev' ? (<div onClick={() => this.login(2)}>假装登录高门槛</div>) : (<span></span>)
        }
        <Loading isShow={this.state.LoadingShow} />
        <NumberBoard ref="number" shadow={false} shadowClose={true} type="float" />
        <OtpBoard ref="OtpBoard" mobile={this.state.mobile}/>          
        <PaywordBoard ref="safe" callbackPayword={(m) => this.callbackPayword(m)} />
        <TranBoard ref="tran" />
        <Dialog ref="dialog" title="测试" shadowClose={true} shadow={0} btnOk="确认" btnCancel="取消" />
        <Dialog ref="alert" dtype={1} shadow={1} btnOk="确认" btnCancel="取消" />
        <NumberBoard ref="safeBoard" btnOk="" shadowClose={true} resort={true} type="int" />
      </div>
    );
  };
};

export default Home;
