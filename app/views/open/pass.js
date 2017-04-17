import 'css/open.scss';
import React from 'react';
import Loading from 'component/Loading';
import Toast from 'component/Toast';
import Dialog from 'component/Dialog';
import {
  setItem,
  getItem,
  removeItem,
  getUserInfo
} from 'business/Cache';
import PaywordBoard from 'component/Keyboard/paywordBoard';
import {
  register
} from 'api';
import {
  wtOpen
} from 'business/webtrends';

/**
 * 开户设置交易密码
 * @author zhongzhuhua
 */
export default class OpenPass extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  state = {
    pwd1: '',
    pwd2: '',
    // 是否提交中
    issubmit: false,
    // 是否开户成功
    open: false,
    // 注册失败埋点
    cancelTitle: ''
  };

  constructor(props) {
    super(props);
  };

  componentDidMount() {
    this.openPwd1();
    // 实名验证通过添加 bindcard/index.js
    let openInfo = getItem('openInfo', 1);
    if (openInfo == null) {
      this.context.router.push('/open/idcard');
    }
  };

  // 打开第一个安全键盘
  openPwd1() {
    this.refs.pwd1.clear();
    this.refs.pwd1.open('');
    this.refs.pwd2.close();
  };

  // 第一个安全键盘点击事件
  setSecond(model) {
    let value = model.password;
    if (value && value.length == 6) {
      if (/(\d)\1{4}/.test(value)) {
        this.refs.pwd1.clear();
        this.refs.toast.open('密码过于简单，请重新设置');
      } else if ('9876543210123456789'.indexOf(value) > -1) {
        this.refs.pwd1.clear();
        this.refs.toast.open('不能使用升序或降序连续数字');
      } else {
        this.setState({
          pwd1: value
        });
        this.refs.pwd1.close();
        this.refs.pwd2.clear();
        this.refs.pwd2.open('');
      }
    }
  };

  // 第二个安全键盘点击事件
  submit(model) {
    let self = this;
    let value = model.password;
    if (value && value.length == 6) {
      let pwd1 = self.state.pwd1;
      let pwd2 = value;
      if (pwd1 != pwd2) {
        self.refs.toast.open('交易密码不一致，请重新输入');
        self.openPwd1();
      } else {
        // 实名验证通过添加 bindcard/index.js
        let openInfo = getItem('openInfo', 1);
        let mydata = {
          cifName: openInfo.name,
          idNo: openInfo.id,
          trsPassword: model.encodePassword
        };
        if (self.state.issubmit) return;
        self.setState({
          issubmit: true
        });
        register(mydata).then(function (res) {
          self.setState({
            issubmit: false
          });
          // 埋点
          if (res.code != '000000') {
            self.setState({
              cancelTitle: res.msg.indexOf('留') > -1 ? wtOpen['11'] : wtOpen['12']
            });
          }
          if (res.code == '000000') {
            let user = getUserInfo();
            user.userType = '2';
            setItem('userInfo', user);
            self.refs.dialog.open('恭喜您，开户成功！');
            self.state.open = true;
            removeItem('openInfo', 1);
          } else if (res.code == 'err') {
            self.refs.toast.open(res.msg);
            self.openPwd1();
          } else {
            self.refs.dialog.open('信息验证失败');
          }
        });
      }
    }
  };

  cancel() {
    this.context.router.goBack();
  };

  cancelFun() {
    let self = this;
    if (self.state.open) {
      self.context.router.push((self.props.location.query.back || '/'));
    } else {
      self.context.router.push({
        pathname: '/open/idcard',
        query: self.props.location.query
      });
    }
  };

  render() {
    if (!this.state.issubmit) {
      return (
        <div>
          <PaywordBoard ref="pwd1" forget={false} cancelFun={() => this.cancel()} callbackPayword={(m) => this.setSecond(m)} otitle={wtOpen['15']} okTitle={wtOpen['13']} />
          <PaywordBoard ref="pwd2" forget={false} cancelFun={() => this.cancel()} title="再次确认密码" callbackPayword={(m) => this.submit(m)} encryptMethod={2} otitle={wtOpen['15']} okTitle={wtOpen['14']} />
          <Toast ref="toast" />
          <Dialog ref="dialog" cancelFun={() => this.cancelFun()} btnCancel="知道了" cancelTitle={this.state.cancelTitle} />    
        </div>
      );
    } else {
      return (<Loading isShow={true} />);
    }
  };
};
