import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { common } from 'redux/modules/common';
import PaywordKB from 'components/Keyboard/paywordKB'
import NumberKB from 'components/Keyboard/numberKB'
import OptKB from 'components/Keyboard/optKB'
//import Using ES6 syntax
import WeUI from 'react-weui';
const {Cells, Cell, CellHeader, CellBody, ButtonArea, Button, Popup, CellFooter, Flex, Icon} = WeUI;
import "styles/cashier.scss"
import { paymentAction,payAction } from 'redux/modules/payment';
@connect((state) => ({
    paymentState: state.paymentState,
    payState: state.payState,
  }),
  (dispatch) => bindActionCreators({
    paymentAction,
    payAction
  }, dispatch)
)


class QuickPay extends Component {
	componentDidMount() {
	    console.log("************")
	   	console.log(this.props)
  	};
	
    state = {
        paywordKB: false,
        numberKB: false,
        optKB: false
    }
    render() {
        return (
            <div >
      		<section>
				<div className="quickPay-content">
					<p className="quickpay-title">商户</p>
					<p className="quickpay-detail">金科***</p>
				</div>
				<div className="quickPay-content">
					<p className="quickpay-title">身份证</p>
					<p className="quickpay-detail">138********123</p>
				</div>
				<div className="quickPay-content">
					<p className="quickpay-title">银行卡</p>
					<p className="quickpay-detail">622222222222222</p>
					<p className="quickpay-detail">工商银行</p>
				</div>
				<div className="quickPay-content">
					<p className="quickpay-title">银行预留手机号</p>
					<p className="quickpay-detail">138********123</p>
				</div>
			</section>
			<section className="get-verification-code">
		    	<Flex>
		    		<input className="flex-2 opt-input"/>
		    		<span className="btn-get-v-code flex-1"> 获取验证码</span>
		    	</Flex>
		    </section> 
		    <section className="agree-content"> 
		    	<Icon value="success-no-circle agree-icon" />
		    	<span>我已阅读并同意</span>
		    	<span className="protocol-url">《个人授权代付协议》</span>
		    </section> 
		    <ButtonArea className="btn-pay">
	            	<Button>下一步</Button>
	        </ButtonArea>
	    </div>
        );
    }
}
export default QuickPay
