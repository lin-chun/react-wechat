import './index.scss';
import React from 'react';
import {
  riskLevel
} from '../utils/enums';
import {
  Popup
} from 'react-weui';

let content = {
  1: '从总体投资来看，稳定是您考虑的首要因素，一般您希望在保证本金安全的基础上能有一些增值收入。愿意承受较低的风险，对投资回报的要求不高。',
  2: '从总体投资来看，在风险较小的情况下获得一定的收益是您主要的投资目的。您通常愿意使本金面临一定的风险，但在做投资决定时，对风险总是客观存在的道理有清楚的认识，会仔细地对将要面临的风险进行认真的分析。总体来看，愿意承受市场的平均风险。',
  3: '从总体投资来看，在风险较小的情况下获得一定的收益是您主要的投资目的。您通常愿意使本金面临一定的风险，但在做投资决定时，对风险总是客观存在的道理有清楚的认识，会仔细地对将要面临的风险进行认真的分析。总体来看，愿意承受市场的平均风险。',
  4: '从总体投资来看，您追求较高的投资收益，并愿承受较大的投资风险和投资波动，希望自己的投资风险与市场的整体风险持平。您有较高的收益目标，且对风险有清醒的认识。',
  5: '从总体投资来看，您追求较高的投资收益，并愿承受较大的投资风险和投资波动，希望自己的投资风险与市场的整体风险持平。您有较高的收益目标，且对风险有清醒的认识。'
};

// 风险等级说明弹窗
export default class RiskDialog extends React.Component {
  state = {
    show: 'hidden',
    fullpage_show: false,
    title: '',
    content: ''
  };

  constructor(props) {
    super(props);
  };

  // 打开
  open(type) {
    type = type == null || type == '' ? 1 : type;
    this.setState({
      fullpage_show: true,
      show: 'block'
    });
    this.setContent(type);
  };

  // 关闭
  close() {
    this.setState({
      fullpage_show: false,
      show: 'none'
    });
  };

  // 设置内容
  setContent(type) {
    this.setState({
      title: riskLevel[type],
      content: content[type]
    });
  };

  render() {
    return (
      <Popup show={this.state.fullpage_show} onRequestClose={e=>this.setState({fullpage_show: false})}>
        <div style={{height: '100vh',overflow: 'auto'}}>
          <div className="b-riskdialog">
            <div className="title">{this.state.title}</div>
            <div className="content">{this.state.content}</div>
            <div className="button">
              <button onClick={() => this.close()}>知道了</button>
            </div>
          </div>
        </div>
      </Popup>
    );
  };
};
