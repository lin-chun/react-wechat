import './index.scss';
import {
  Popup
} from 'react-weui';
import React, {
  Component,
  PropTypes
} from 'react';
import KeyBoard from './keyboard';
import {
  sendSms,
  checkSms
} from 'api';
import {
  replaceMobile
} from 'utils/regs';
import stop from 'utils/stopDefault';

/**
 * otp 键盘
 * @author zhongzhuhua
 */
export default class OtpBoard extends Component {
  propTypes: {
    // 默认最长 6 位
    maxLength: PropTypes.number,
    // 多少秒重发
    second: PropTypes.number,
    // 手机号码
    mobile: PropTypes.string,
    // 验证码类型，根据 api sendSms 中定
    otpType: PropTypes.string,
    // 验证通过
    successFun: PropTypes.func,
    // 点击获取验证码埋点
    smsTitle: PropTypes.string,
    // 取消按钮埋点
    cancleTitle: PropTypes.string,
    // 确定按钮埋点
    okTitle: PropTypes.string
  };

  static defaultProps = {
    isShow: false,
    maxLength: 6,
    second: 60,
    mobile: '',
    otpType: 15,
    successFun: () => {},
    okTitle: '',
    cancleTitle: '',
    smsTitle: ''
  };

  state = {
    fullpage_show: false,
    mess: '',
    value: '',
    btn: '获取验证码',
    timer: null,
    // 是否发送短信验证码
    isSend: false,
    open: this.open,
    close: this.close
  };

  constructor(props) {
    super(props);
  };

  componentDidMount() {
    if (this.refs.main) {
      let dom = this.refs.main.parentNode.parentNode;
      dom.className = 'c-keyboard-weui shadow';
    }
  };

  /**
   * 打开弹窗
   * @param v 默认的值
   */
  open() {
    this.setState({
      fullpage_show: true,
      isSend: false,
      btn: '获取验证码',
      value: '',
      mess: ''
    });
    this.refs.board.reset(false);
    this.clearTime();
  };

  // 清除定时器
  clearTime() {
    clearInterval(this.state.timer);
    this.state.timer = null;
  };

  // 关闭弹窗
  close() {
    this.setState({
      fullpage_show: false
    });
  };

  // 点击事件
  clickFun(m) {
    this.setState({
      value: m.value
    });
    this.refs.board.isOk(m.value.length == this.props.maxLength);
  };

  // 确定按钮事件重写
  okFun(m) {
    let self = this;
    self.refs.board.isOk(false);
    checkSms(self.props.mobile, m.value, self.props.otpType).then(function(res) {
      self.open();
      if (res.code == '000000') {
        self.close();
        self.props.successFun(m);
      } else {
        self.setState({
          err: true,
          mess: res.msg
        });
      }
    });
  };

  // 取消
  cancle() {
    this.close();
  };

  // 发送验证码
  sendSms() {
    let self = this;
    if (self.state.isSend) {
      return;
    }
    self.state.isSend = true;
    sendSms(self.props.mobile, self.props.otpType).then(function (res) {
      if (res.code == '000000') {
        self.setState({
          err: false,
          mess: '验证码已经发送至手机' + (replaceMobile(self.props.mobile) || '')
        });
      } else {
        self.setState({
          err: true,
          mess: res.msg
        });
      }
    });

    let second = self.props.second;
    self.state.timer = setInterval(function () {
      self.setState({
        btn: (second--) + '秒后重发'
      });
      if (second == 1) {
        self.clearTime();
        self.setState({
          btn: '重新发送',
          isSend: false
        });
      }
    }, 1000);
  };

  // 清除值
  clearValue() {
    this.refs.board.clear();
    this.clickFun({
      value: ''
    });
  };

  render() {
    let clazz = {
      err: 'mess' + (this.state.err ? ' error' : '')
    };
    return (
      <Popup show={this.state.fullpage_show}>
        <div onWheel={stop} onTouchMove={stop} className="mask"></div>
        <div className="board-main" ref="main">
          <div className="c-keyboard-opt">
            <div className="title">
              <span onTouchEnd={() => this.cancle()} otitle={this.props.cancleTitle} otype="button">取消</span>
              输入验证码
            </div>
            <div className={clazz.err}>&nbsp;{this.state.mess}&nbsp;</div>
            <div className="input">
              <div className="input-value">{this.state.value}</div>
              <span onClick={() => this.clearValue()} className="icon-clear"></span>
              <button className="input-button" disabled={this.state.isSend} onTouchEnd={() => this.sendSms()} otitle={this.props.smsTitle} otype="button">{this.state.btn}</button>
              {
                <div style={{display: (this.state.value ? 'block' : 'none')}} className="input-holder"></div>
              }
            </div>
          </div>
          <KeyBoard ref="board" {...this.props} clickFun={(m) => this.clickFun(m)} okFun={(m) => this.okFun(m)} />
        </div>
      </Popup>
    );
  };
};
