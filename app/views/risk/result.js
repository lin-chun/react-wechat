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
 * 用户风险评估结果页面
 * 页面 url 可以带 back ，代表风险评测结束之后要跳转到的路径
 * 参数，参照 ./index.js
 * @author zhongzhuhua
 */
export default class RiskResult extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
  };

  openLevel(type) {
    this.refs.dialog.open(type);
  };

  // 产品详情页面
  goBuy() {
    this.context.router.push('/product/detail/' + this.props.location.query.pid);
  };

  // 回首页
  goIndex() {
    this.context.router.push('/');
  };

  // 查看其他产品
  goOther() {
    this.context.router.push('/');
  };

  // 重新评估
  goRisk() {
    this.context.router.push({
      pathname: '/risk/answer',
      query: this.props.location.query
    });
  };

  // 返回上级页面
  goBack() {
    let back = this.props.location.query.back;
    back = back == null || back == '' ? '/' : back;
    this.context.router.push(back);
  };

  render() {
    let query = this.props.location.query;
    let pname = query.pname;
    let ptype = productType[query.ptype];
    let ulevel = riskLevel[query.ulevel];
    // 是否超过风险等级
    let isover = query.plevel > query.ulevel;
    // 页面类型，null 或者 0 代表可以重新评估，1代表去看看其他产品，2代表有仍要购买按钮，
    // 如果 ulevel 大于 plevel 的话，则该项无效
    let type = query.type;
    // 建议购买类型
    let btype = '';
    if (isover) {
      for (let key in productType) {
        if (key <= query.ulevel) {
          btype += '、' + productType[key];
        }
      }
      btype = btype.substr(1);
    }
    return (
      <div>
        <div className="v-risk">
          <div className="file"></div>
          <div className="title">
            您的风险承受能力评估结果为
            <div className="result">
              <span onClick={() => this.openLevel(query.ulevel)}>{ulevel}</span>
            </div>
          </div>
          <div style={{display:(pname == null || pname == '' ? 'none' : 'block')}} className="warn warn-result">
            您选择的<span>{pname}</span>是<span>{ptype}</span>风险等级产品。
            {
              isover ? 
                type == 2 ? 
                (<span className="overwarn">已超过您的风险承受能力，请确认是否继续购买。</span>)
                :
                (<span className="overwarn">已超过您的风险承受能力。</span>)
              : (<label className="overwarn">非常适合您哦，赶紧购买吧。</label>)
            }
            {
              isover ?
                (type == null || type == 0) ?
                (<div className="overwarn-mess">若要购买，需要重新评估。</div>)
                :
                (<div className="overwarn-mess">建议您选择<span>{btype}</span>风险等级的产品哦。</div>)
              : (<span></span>)
            }
          </div>
          {
            pname != null && pname !='' ?
            (
              <div className="bottom bottom-result">
              {
                isover ?
                  type == 2 ?
                  (
                    <div className="button">
                      <button ref="btnBuy" className="button-bg" onClick={() => this.goBuy()} otitle={wtRisk['13']} otype="button">仍要购买</button>
                      <button ref="btnNext" className="button-bd" onClick={() => this.goIndex()} otitle={wtRisk['14']} otype="button">下次再说</button>
                    </div>
                  )
                  :
                  type == 1 ?
                  (
                    <div className="button">
                      <button ref="btnOther" className="button-bg" onClick={() => this.goOther()} otitle={wtRisk['12']} otype="button">去看看其他产品</button>
                    </div>
                  )
                  :
                  (
                    <div className="button">
                      <button ref="btnRetest" className="button-bg" onClick={() => this.goRisk()} otitle={wtRisk['10']} otype="button">重新评估</button>
                      <button ref="btnNext" className="button-bd" onClick={() => this.goIndex()} otitle={wtRisk['11']} otype="button">下次再说</button>
                    </div>
                  )
                :
                (
                <div className="button">
                  <button ref="btnYes" className="button-bg" onClick={() => this.goBuy()} otitle={wtRisk['8']} otype="button">现在购买</button>
                  <button ref="btnNext" className="button-bd" onClick={() => this.goIndex()} otitle={wtRisk['9']} otype="button">下次再说</button>
                </div>
                )
              }
              </div>
            )
            :
            (
              <div className="bottom bottom-result">
                <div className="button">
                  <button ref="btnRetest" className="button-bg" onClick={() => this.goRisk()} otitle={wtRisk['5']} otype="button">重新评估</button>
                  <button ref="btnBack" className="button-bd" onClick={() => this.goBack()} otitle={wtRisk['3']} otype="button">返回</button>
                </div>
              </div>
            )
          }
        </div>
        <RiskDialog ref="dialog" />
      </div>
    );
  };
};
