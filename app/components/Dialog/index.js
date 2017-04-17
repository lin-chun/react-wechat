import './index.scss';
import {
  Popup
} from 'react-weui';
import React, {
  Component,
  propTypes
} from 'react';
import Stop from '../utils/stopDefault';

/**
 * 常用弹窗，alert弹窗
 * @author zhongzhuhua
 */
export default class Dialog extends Component {
  propTypes: {
    // 标题
    title: PropTypes.string,
    // 提示的信息
    mess: PropTypes.mess,
    // 点击按钮的时候，是否默执行关闭按钮，默认关闭
    autoClose: PropTypes.bool,
    // 类型 0 底部 popup ， 1 中间 alert
    dtype: PropTypes.string,
    // 遮罩层 0 不透明 1 半透明 2 全透明
    shadow: PropTypes.string,
    // 点击背景是否要关闭弹窗
    shadowClose: propTypes.bool,
    // 是否需要按钮，默认不需要，如果有的话，加上对应的配置
    btnOk: PropTypes.string,
    btnCancel: PropTypes.string,
    okFun: PropTypes.func,
    cancelFun: PropTypes.func,
    // 打开回调
    openFun: PropTypes.func,
    // 关闭回调
    closeFun: PropTypes.func,
    // ok 按钮埋点
    okTitle: PropTypes.string,
    // 取消按钮埋点
    cancelTitle: PropTypes.string
  };
  static defaultProps = {
    title: '',
    mess: '',
    autoClose: true,
    dtype: '0',
    shadow: '1',
    shadowClose: false,
    btnOk: '',
    btnCancel: '',
    okFun: () => {},
    cancelFun: () => {},
    openFun: () => {},
    closeFun: () => {}
  };

  state = {
    isShow: 'none',
    title: '',
    mess: ''
  };

  constructor(props) {
    super(props);
  };

  componentWillMount() {
    let self = this;
    self.setState({
      title: self.props.title,
      mess: self.props.mess
    });
  };

  componentDidMount() {
    if (this.refs.dialog) {
      let dom = this.refs.dialog.parentNode.parentNode;
      dom.className = 'c-dialog popup';
      dom.querySelector('.weui-mask').className = 'weui-mask shadow-' + this.props.shadow;
    }
  };

  // 关闭弹窗
  shadowClose() {
    if (this.props.shadowClose) {
      this.close();
    }
  };

  close() {
    this.setState({
      isShow: 'none'
    });
    this.closeFun && this.closeFun();
  };

  /**
   * 打开弹窗
   * @param title 标题
   */
  open(title) {
    let self = this;
    self.setState({
      isShow: 'block',
      title: title || self.props.title
    });
    self.openFun && self.openFun();
  };

  // 确认按钮事件
  okFun() {
    if (this.props.autoClose) {
      this.close();
    }
    this.props.okFun();
  };

  // 关闭按钮事件
  cancelFun() {
    if (this.props.autoClose) {
      this.close();
    }
    this.props.cancelFun();
  };

  render() {
    let self = this;
    let clazz = {
      main: 'main main-' + self.props.dtype,
      button: 'buttons buttons-' + self.props.dtype
    };
    if (this.props.dtype === '0') {
      return (
        <Popup show={this.state.isShow == 'block'} onRequestClose={() => this.shadowClose()}>
          <div ref="dialog">
            <div className={clazz.main}>
              <div className="title">{self.state.title}</div>
              <div className={clazz.button}>
                {
                  self.props.btnOk ? (<button onClick={() => self.okFun()} className="btn-ok" otitle={self.props.okTitle} otype="button">{self.props.btnOk}</button>) : (<span></span>)
                }
                {
                  self.props.btnCancel ? (<button onClick={() => self.cancelFun()} className="btn-cancel" otitle={self.props.cancelTitle} otype="button">{self.props.btnCancel}</button>) : (<span></span>)
                }
              </div>
            </div>
          </div>
        </Popup>
      );
    } else {
      return (
        <div style={{display: this.state.isShow}} className="c-dialog alert" onClick={() => this.shadowClose()} onTouchMove={(e) => Stop(e)}>
          <div className={'shadow shadow-' + this.props.shadow}></div>
          <div className={clazz.main}>
            <div className="title">{self.state.title}</div>
            <div className={clazz.button}>
              {
                self.props.btnOk ? (<button onClick={() => self.okFun()} className="btn-ok" otitle={self.props.okTitle} otype="button">{self.props.btnOk}</button>) : (<span></span>)
              }
              {
                self.props.btnCancel ? (<button onClick={() => self.cancelFun()} className="btn-cancel" otitle={self.props.cancelTitle} otype="button">{self.props.btnCancel}</button>) : (<span></span>)
              }
            </div>
          </div>
        </div>
      );
    }
  };
};
