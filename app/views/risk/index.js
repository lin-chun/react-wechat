import 'css/risk.scss';
import React from 'react';
import {
  riskLevel,
  productType
} from 'business/utils/enums';
import RiskDialog from 'business/RiskDialog';
import {
  wtRisk
} from 'business/webtrends';

/** 
 * 用户风险评估引导页面
 * 页面 url 可以带 back ，代表风险评测结束之后要跳转到的路径
 * 参数 pid 产品id pname = 产品名称，ptype = 产品风险类型， plevel = 所需用户风险等级（改参数已经失效，改成默认 ptype）
       type 页面类型，null 或者 0 代表可以重新评估，1代表去看看其他产品，2代表有仍要购买按钮
       ulevel 用户当前的 level,
       timeout 是否过期 0|1
 * @author zhongzhuhua
 */
export default class RiskIndex extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  state = {
    otitle: ''
  };

  constructor(props) {
    super(props);
  };

  componentDidMount() {
    // 埋点绑定
    let button = this.refs.button;
    let out = this.props.location.query.timeout;
    let pid = this.props.location.query.pid;
    let otitle = '';
    if (pid != null && pid != '') {
      // 购买触发
      if (out == '1') {
        otitle = wtRisk['7']
      } else {
        otitle = wtRisk['6'];
      }
    } else {
      // 主动触发
      if (out == '1') {
        otitle = wtRisk['2'];
      } else {
        otitle = wtRisk['1'];
      }
    }
    this.setState({
      otitle: otitle
    });
  };

  openLevel(type) {
    this.refs.dialog.open(type);
  };

  goAnswer() {
    let query = this.props.location.query;
    this.context.router.push({
      pathname: '/risk/answer',
      query: query
    });
  };

  render() {
    let query = this.props.location.query;
    let pname = query.pname;
    let ptype = productType[query.ptype];
    let plevel = riskLevel[query.ptype];
    let mess = query.timeout === '1' ? '您的风险承受能力评估结果已经过期，请重新进行评估' : '请先进行风险承受能力评估';
    
    return (
      <div>
        <div className="v-risk">
          <div className="file"></div>
          <div className="title">{mess}</div>
          <div style={{display: (pname == null ? 'none' : 'block')}} className="warn">
            您选择的<span>{pname}</span>是<span>{ptype}</span>风险等级产品，
            要求您的风险承受能力至少为<span onClick={() => this.openLevel(query.plevel)} className="level">{plevel}</span>
          </div>
          <div className="bottom">
            <div className="mess">以下问题将对你进行风险承受能力进行评估，请认真作答。测试结果将严格保密。</div>
            <div className="button">
              <button ref="button" className="button-bg" onClick={() => this.goAnswer()} otitle={this.state.otitle} otype="button">开始评估</button>
            </div>
          </div>
        </div>
        <RiskDialog ref="dialog" />
      </div>
    );
  };
};
