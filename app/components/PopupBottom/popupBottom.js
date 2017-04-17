import React, {
  Component,
  propTypes
} from 'react';
import {
  Link
} from 'react-router';
import WeUI from 'react-weui';
import './popupBottom.scss';
const {
  Popup,
  PopupHeader
} = WeUI;
class Main extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      // tab切换
      tab: 0,
      flag: 0,
      // 解释段落
      popupPage_show: false
    }
  };
  propTypes: {
    // title
    title: PropTypes.string,
    // content
    content: PropTypes.string,
    // open按钮文字
    openText: PropTypes.string,
    // close按钮文字
    closeText: PropTypes.string,
    // 跳转地址
    url: PropTypes.string
  };
  static defaultProps = {
    title: '',
    content: '',
    openText: '',
    closeText: '',
    url: ''
  };
  show() {
    this.setState({
      popupPage_show: true
    })
  };
  render() {
    const {
      
    } = this.props
    return (
      <div className="popupPage">
          <Popup
              show={this.state.popupPage_show}
              onRequestClose={e=>this.setState({popupPage_show: false})}
          >
              <div className="popup-title">{this.props.title}</div>
              <div className="popup-content">{this.props.content}</div>
              <Link className="popup-open" to={this.props.url}>{this.props.openText}</Link>
              <div className="popup-close" onClick={e=>this.setState({popupPage_show: false})}>{this.props.closeText}</div>
          </Popup>
      </div>
    )
  }
}

export default Main
