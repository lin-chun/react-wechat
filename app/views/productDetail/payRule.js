import React from 'react';
import 'css/payRule.scss';
/**
 * 定期理财买入页
 */
class PayRule extends React.Component {
	constructor(props) {
    super(props);
	};
	componentDidMount(preProps, preState) {
		document.body.scrollTop = 0;
	};
  render() {
		return (
    	<div className="v-payrule">
	    	<div className="tit">收益规则</div>
	    	<div className="con">
	    		<div className="con-tit">买入后，下一个交易日（T＋1）开始计算收益，如遇节假日顺延</div>
	    		<ul className="pay-wrap">
	    			<li>
	    				<div className="buy-time">买入时间</div>
	    				<div>开始计算收益</div>
	    				<div>收益到账</div>
	    			</li>
	    			<li>
	    				<div>周一15:00至<p>周二15:00</p></div>
	    				<div>周三</div>
	    				<div>周四</div>
	    			</li>
	    			<li>
	    				<div>周二15:00至<p>周三15:00</p></div>
	    				<div>周四</div>
	    				<div>周五</div>
	    			</li>
	    			<li>
	    				<div>周三15:00至<p>周四15:00</p></div>
	    				<div>周五</div>
	    				<div>周六</div>
	    			</li>
	    			<li>
	    				<div>周四15:00至<p>周五15:00</p></div>
	    				<div>下周一</div>
	    				<div>下周二</div>
	    			</li>
	    			<li>
	    				<div>周五15:00至<p>下周一15:00</p></div>
	    				<div>下周二</div>
	    				<div>下周三</div>
	    			</li>
	    		</ul>
	    	</div>
	    	<div className="tit">到期设置</div>
	    	<div className="end-date">
	    		<div className="con-tit">理财期限内不可取出，可根据你的资金计划，选择合适的到期设置，到期日前一天（自然日），14:50前可随时更改，14:50后将不可更改。</div>
	    		<div className="sec-tit">到期后－自动买入下一期</div>
	    		<div className="con-tit">到期日次日（自然日）为下一个投资周期的起始日，以45个自然日为一个周期，收益不间断。</div>
	    		<div className="sec-tit">到期后－赎回至支付账户</div>
	    		<div className="con-tit">到期日系统自动发起赎回申请，一般情况下，赎回申请成功后，款项会在下一个交易日（T＋1）24:00前到账。</div>
	    		<ul className="account-wrap">
	    			<li>
	    				<div>到账时间</div>
	    				<div>资金到账时间</div>
	    			</li>
	    			<li>
	    				<div>周一</div>
	    				<div>周二</div>
	    			</li>
	    			<li>
	    				<div>周二</div>
	    				<div>周三</div>
	    			</li>
	    			<li>
	    				<div>周三</div>
	    				<div>周四</div>
	    			</li>
	    			<li>
	    				<div>周四</div>
	    				<div>周五</div>
	    			</li>
	    			<li>
	    				<div>周五</div>
	    				<div>下周一</div>
	    			</li>
	    			<li>
	    				<div>周六</div>
	    				<div>下周二</div>
	    			</li>
	    			<li>
	    				<div>周日</div>
	    				<div>下周二</div>
	    			</li>
	    		</ul>
	    		<div className="con-tit">注：如遇到国家法定节假日，则资金到账时间及收益截止日期顺延，申请产品总份额合计超过上一日产品总份额的10%(含10%)时，触发本产品巨额赎回，触发巨额赎回后，当日全额赎回份额顺延至下一个交易日处理。</div>
	    	</div>
	    </div>
    )
  };
};

export default PayRule;