import './index.scss';
import {
  Popup,
  Input
} from 'react-weui';
import React from 'react';
import KeyBoard from './keyboard';
import stop from 'utils/stopDefault';

/**
 * 交易键盘
 * @author linchun
 */
export default class TranBoard extends React.Component {
  propTypes: {
    shadowClose: React.PropTypes.boolean,
    // 是否需要遮罩层
    shadow: React.PropTypes.boolean,
    all: React.PropTypes.string,
    expectTime: React.PropTypes.string,
    showTime: React.PropTypes.boolean
  };

  static defaultProps = {
    shadowClose: false,
    shadow: true,
    all: '',
    expectTime: '',
    showTime: false
  };

  state = {
    fullpage_show: false,
    sellMoney: ''
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

  // 打开弹窗
  open() {
    this.setState({
      fullpage_show: true
    });
  };

  // 关闭弹窗
  close() {
    this.setState({
      fullpage_show: false
    });
  };

  clear() {
    this.refs.board.clear();
    this.close();
    this.setState({
      sellMoney: ''
    });
  };

  // 确定按钮事件重写
  okFun(m) {
    // this.close();
    this.props.okFun && this.props.okFun(m);
  };

  // 点击事件
  clickFun(m) {
    this.props.clickFun && this.props.clickFun(m);
    this.setState({
      sellMoney: m.frmValue
    })
  };

  // 全部卖出
  sellAll() {
    this.refs.board.setValue(this.props.all);
    console.log(this.props.all)
    let frmValue = this.refs.board.getFrmValue();
    this.setState({
      sellMoney: frmValue
    });
  };

  render() {
    const {inputMoney} = this.props;
    return (
      <Popup show={this.state.fullpage_show}>
        <div onWheel={stop} onTouchMove={stop} className="mask"></div>
        <div className="board-main" ref="main">
          <div className="c-keyboard-tran">
            <div className="sell-title">请输入卖出金额<span onTouchEnd={() => this.clear()}>取消</span></div>
            <div className="sell-money">最多可卖出：{this.props.all}<span onTouchEnd={ () => this.sellAll() }>全额卖出</span></div>
            {
              this.props.showTime ?
              (<div className="sell-accountTime">预计到账时间 {this.props.expectTime}</div>)
              :
              (<div className="sell-accountTime"></div>)
            }
            
            <div className="recommend" onTouchEnd={inputMoney}>
                <Input type="tel" ref="num" className="num" placeholder="卖出金额" value={this.state.sellMoney} disabled/>
            </div>
          </div>
          <KeyBoard ref="board" {...this.props} type="float" clickFun={(m) => this.clickFun(m)} okFun={(m) => this.okFun(m)} />        
        </div>
      </Popup>
    );
  };
};
