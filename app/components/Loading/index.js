import './index.scss';
import React, {
  Component,
  PropTypes
} from 'react';
import Stop from 'utils/stopDefault';

/** 
 * 加载中
 * @author zhongzhuhua
 */
export default class Loading extends Component {
  propTypes: {
    // 是否展示
    isShow: PropTypes.bool,
    // 多少秒后隐藏
    second: PropTypes.number,
    // 遮罩层类型，0 透明 ，1 半透明，2 不透明
    shadow: PropTypes.number
  };
  static defaultProps = {
    isShow: false,
    second: 15000,
    shadow: 0
  };
  state = {
    timer: null,
    timeover: false
  };
  componentWillMount() {
    this.state.shadowClass = 'mask ' + ('shadow-' + this.props.shadow);
  };
  render() {
    let self = this;
    let second = self.props.second;
    let display = self.state.timeover ? 'none' : self.props.isShow ? 'block' : 'none';
    if (self.state.timeover) {
      self.state.timeover = false;
    }
    if (self.props.isShow && self.state.timer == null) {
      self.state.timer = setTimeout(function() {
        self.setState({
          timeover: true
        });
      }, second);
    } else {
      clearTimeout(self.state.timer);
      self.state.timer = null;
    }

    return (
      <div ref="Loading" onTouchMove={(e) => Stop(e)} className="c-loading" style={{ display: display }}>
        <div className={this.state.shadowClass}>
          <div className="img"></div>
        </div>
      </div>
    );
  };
};
