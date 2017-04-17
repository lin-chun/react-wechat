import './index.scss';
import {
  Popup,
  Input
} from 'react-weui';
import React from 'react';
import KeyBoard from './keyboard';
import stop from 'utils/stopDefault';

/**
 * 数字键盘
 * @author zhongzhuhua
 */
export default class NumberBoard extends React.Component {
  propTypes: {
    // 点击阴影层关闭
    shadowClose: React.PropTypes.boolean,
    // 是否允许事件穿透，如果允许事件穿透，则 shadowClose 自动失效
    events: React.PropTypes.boolean,
    // 是否需要遮罩层，如果有遮罩层，则 events 失效
    shadow: React.PropTypes.boolean,
    // 是否要变数字
    resort: React.PropTypes.boolean,
    // 点击遮罩方法
    shadowFun: React.PropTypes.func,
    // 关闭事件
    closeFun: React.PropTypes.func,
    // 确定按钮埋点
    okTitle: React.PropTypes.string
  };

  static defaultProps = {
    shadowClose: false,
    events: false,
    shadow: true,
    resort: false,
    shadowFun: () => {},
    closeFun: () => {},
    okTitle: ''
  };

  state = {
    fullpage_show: false,
    boardValue: {
      value: '',
      frmValue: ''
    }
  };

  constructor(props) {
    super(props);
  };

  componentDidMount() {
    if (this.refs.main) {
      let dom = this.refs.main.parentNode.parentNode;
      dom.className = 'c-keyboard-weui' + (this.props.shadow ? ' shadow' : '') + (!this.props.shadow && this.props.events ? ' events' : '');
    }
  };

  // 打开弹窗
  open() {
    this.setState({
      fullpage_show: true
    });
    if (this.props.resort) {
      this.refs.board.resetNumber();
    }
  };

  // 关闭弹窗
  close() {
    this.setState({
      fullpage_show: false
    });
    this.props.closeFun();
  };

  clear() {
    this.refs.board.clear();
    this.state.boardValue = {
      value: '',
      frmValue: ''
    };
  };

  // 确定按钮事件重写
  okFun(m) {
    this.close();
    this.props.okFun && this.props.okFun(m);
  };

  // 点击事件
  clickFun(m) {
    this.state.boardValue = m;
    this.props.clickFun && this.props.clickFun(m);
  };

  // 遮罩点击事件
  shadowFun(e) {
    this.setState({
      fullpage_show: !this.props.shadowClose
    });
    this.props.closeFun();
    this.props.shadowFun && this.props.shadowFun(this.state.boardValue);
  };

  // 是否弹出
  isOpen() {
    return this.state.fullpage_show;
  };

  render() {
    return (
      <Popup show={this.state.fullpage_show}>
        <div onWheel={stop} onTouchMove={stop} onClick={(e) => this.shadowFun(e)} className="mask"></div>
        <div className="board-main" ref="main">
          <KeyBoard ref="board" {...this.props} clickFun={(m) => this.clickFun(m)} okFun={(m) => this.okFun(m)} />
        </div>
      </Popup>
    );
  };
};
