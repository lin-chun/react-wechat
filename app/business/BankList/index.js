import './index.scss';
import React from 'react';
import {
  Popup
} from 'react-weui';
import List from './list';

// 银行卡列表
export default class BankList extends React.Component {
  state = {
    fullpage_show: false
  };

  constructor(props) {
    super(props);
  };

  // 关闭弹窗
  close() {
    this.setState({
      fullpage_show: false
    });
  };

  // 打开弹窗
  open() {
    this.setState({
      fullpage_show: true
    });
  };

  render() {
    return (
      <Popup show={this.state.fullpage_show} onRequestClose={e=>this.setState({fullpage_show: false})}>
        <div style={{height: '100vh',overflow: 'auto'}}>
          <div className="b-banklist">
            <div className="title">支持的银行</div>
            <List />
            <div className="button">
                <button onClick={() => this.close()}>知道了</button>
            </div>
          </div>
        </div>
      </Popup>
    );
  };
};
