import './index.scss';
import {
  init,
  encrypt
} from 'api/security';
import {
  Popup,
  Input,
  Flex,
  FlexItem,
  LoadMore
} from 'react-weui';
import React from 'react';
import KeyBoard from './keyboard';
import stop from 'utils/stopDefault';

/**
 * 密码键盘
 * @author hushiyi
 */
export default class PaywordBoard extends React.Component {
  propTypes: {
    shadowClose: React.PropTypes.boolean,
    // 是否需要遮罩层
    shadow: React.PropTypes.boolean,
    // 输入6个数字之后回调
    callbackPayword: React.PropTypes.func,
    // 是否需要忘记密码
    forget: React.PropTypes.boolean,
    // 标题
    title: React.PropTypes.string,
    // 取消按钮回调
    cancelFun: React.PropTypes.func,
    // 加密方式
    encryptMethod: React.PropTypes.number,
    // 是否需要第二行＋第三行
    moreTitle: React.PropTypes.boolean,
    // 是否需要第三行报错信息
    needThirdTitle: React.PropTypes.boolean,
    // 是否需要第二行title
    needSecTitle: React.PropTypes.boolean,
    // 第二行title信息
    secTitle: React.PropTypes.string,
    // 是否需要警告行
    warn: React.PropTypes.boolean,
    // 警告信息
    warnInfo: React.PropTypes.string,
    // 取消按钮埋点
    otitle: React.PropTypes.string,
    // 输入密码完毕之后埋点
    okTitle: React.PropTypes.string,
  };

  static defaultProps = {
    shadowClose: false,
    shadow: true,
    callbackPayword: () => {},
    forget: true,
    title: '输入交易密码',
    cancelFun: () => {},
    secondTitle: false,
    needSecTitle: false,
    needThirdTitle: false,
    maxMoney: '',
    warn: false,
    warnInfo: '',
    cancelTitle: ''
  };

  state = {
    fullpage_show: false,
    number: ''
  };

  constructor(props) {
    super(props);
  };

  componentDidMount() {
    init();
    if (this.refs.main) {
      let dom = this.refs.main.parentNode.parentNode;
      dom.className = 'c-keyboard-weui shadow';
    }
  };

  // 打开弹窗
  open() {
    this.setState({
      fullpage_show: true
    });
    this.refs.board.resetNumber();
  };

  // 关闭弹窗
  close() {
    this.setState({
      fullpage_show: false
    });
  };

  clear() {
    this.setState({
      number: ''
    });
    this.refs.board.clear();
  };

  // 取消
  cancle() {
    this.clear();
    this.close();
    this.props.cancelFun();
  };

  // 确定按钮事件重写
  okFun(m) {
    this.close();
    this.props.okFun && this.props.okFun(m);
  };

  // 点击事件
  clickFun(m) {
    let self = this;
    this.setState({
      number: m.value
    });
    this.refs.board.isOk(m.value.length == this.props.maxLength);
    if (m.value.length == 6) { 
      // 埋点添加
      self.refs.okTitle.click(); 
      // 回调处理函数
      self.props.callbackPayword({
        password: m.value,
        encodePassword: encrypt(m.value, self.props.encryptMethod)
      });
    }
  };

  render() {
    return (
      <Popup show={this.state.fullpage_show} onRequestClose={e=>this.setState({fullpage_show: !this.props.shadowClose})}>
        <div onWheel={stop} onTouchMove={stop} className="mask"></div>
        <div className="board-main" ref="main">
          <div className="c-keyboard-pay">
            <Flex style={{ 'alignItems': 'center', 'margin': '10px auto', 'width': '90%' }}>
              <FlexItem>
                {this.props.otitle ? 
                  <div className="placeholder otp-cancel" onTouchEnd={()=> {this.cancle();this.clear()}} otitle = {this.props.otitle} otype="button">取消</div>
                :
                  <div className="placeholder otp-cancel" onTouchEnd={()=> {this.cancle();this.clear()}}>取消</div>
                }
              </FlexItem>
              <FlexItem style={{ 'flex': '2', 'textAlign': 'center'}}>
                <div className="placeholder" className="title">{this.props.title}</div>
              </FlexItem>
              <FlexItem>
                <div className="placeholder"></div>
              </FlexItem>
            </Flex>
            {
              this.props.moreTitle ?
              (
                <div>
                  {
                    this.props.needSecTitle ?
                    (
                      <div className="sec-tit">{this.props.secTitle}</div>
                    )
                    :
                    (
                      <div></div>
                    )
                  }
                  {
                    this.props.needThirdTitle ?
                    (
                      this.props.warn ?
                      (
                        <LoadMore loading className="loading">卖出中</LoadMore>
                      )
                      :
                      ( 
                        <div className="warn">{this.props.warnInfo}</div>
                      )
                    )
                    :
                    (<div className="loading"></div>)
                  }
                </div>
              )
              :
              (
                <div className="warn">{this.props.warnInfo}</div>
              )
            }
            <div className="content flex-box paywordContent">
              <span>{this.state.number.length>0&&<i className="dot"></i>}</span>
              <span>{this.state.number.length>1&&<i className="dot"></i>}</span>
              <span>{this.state.number.length>2&&<i className="dot"></i>}</span>
              <span>{this.state.number.length>3&&<i className="dot"></i>}</span>
              <span>{this.state.number.length>4&&<i className="dot"></i>}</span>
              <span>{this.state.number.length>5&&<i className="dot"></i>}</span>
            </div>
            {
              this.props.forget ? 
              (<div className="forget" onTouchEnd={e => this.setState({ showAuto1: true})}>忘记密码?</div>) 
              : 
              (<span></span>)
            }
          </div>
          <span ref="okTitle" otitle={this.props.okTitle} otype="button"></span>
          <KeyBoard ref="board" {...this.props} clickFun={(m) => this.clickFun(m)} btnOk='' isSafe={true} />
        </div> 
      </Popup>
    );
  };
};
