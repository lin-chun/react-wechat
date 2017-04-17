import React from 'react';
import './index.scss';

/**
 * Toast 提示
 * props times 提示消失的时间，默认 3000 毫秒
 * @author zhongzhuhua
 */
export default class Toast extends React.Component {
  propTypes: {
    times: React.PropTypes.number
  };
  static defaultProps = {
    times: 3000
  };

  state = {
    show: false,
    msg: '',
    timer: null
  };

  constructor(props) {
    super(props);
  };

  // 打开
  open(msg) {
    let self = this;
    clearTimeout(self.state.timer);
    self.setState({
      show: true,
      msg: msg
    });
    self.state.timer = setTimeout(function() {
      self.setState({
        show: false
      });
    }, self.props.times)
  };

  // 关闭
  close() {
    clearTimeout(this.state.timer);
    this.setState({
      show: false
    });
  };

  render() {
    return (
      <div style={{display: (this.state.show && this.state.msg != null && this.state.msg != '' ? 'block' : 'none')}} className="c-toast">
        <div>{this.state.msg}</div>
      </div>
    );
  };
};
