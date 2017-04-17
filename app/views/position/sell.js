/**
 * 活期卖出结果页
 */
import React from 'react';
import {
  Link
} from 'react-router';
import 'css/buy/buyRegularResult.scss';
import imgSuccess from 'images/success.png';
import imgError from 'images/error.png';
import imgDealing from 'images/dealing.png';

class SellResult extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      // 卖出是否成功
      success: true,
      // 卖出状态是否是处理中
      deal: true,
      data: null,
      productId: '',
      amount: ''
    };
  };
  componentWillMount() {
    console.log(this.props);
    let statusName = this.props.location.query.orderStatusName,
      amount = this.props.location.query.orderAmount == undefined ? '' : this.props.location.query.orderAmount;
    if (statusName == '支付成功') {
      this.setState({
        success: true,
        deal: false
      });
    } else if (statusName == '失败') {
      this.setState({
        success: false
      });
    } else {
      this.setState({
        success: true,
        deal: true
      });
    };
    this.setState({
      amount: amount,
      productId: this.props.params.productId,
      data: {
        dealing: '卖出申请已提交',
        success: '卖出申请提交成功',
        error: '可能出了点问题，请稍后再试'
      }
    })
  };
  goPosition() {
    this.context.router.push({
      pathname: '/position/' + this.props.location.query.productId
    });
  };
  render() {
    return (
      <div className="v-buy-result">
         {
          this.state.success == true ?
            (
              
              this.state.deal == true ?
              (
                <div>
                  <div className="img-wrap">
                      <div className="showImg"><img src={ imgDealing }/></div>
                  </div>
                  <div className="buy-state">{ this.state.data.dealing }</div>
                  <div className="state-tip state-demand-tip">稍后查看最新状态</div>
                  <div className="button" onClick={() => this.goPosition()}>查看持仓</div>
                </div>
              )
              :
              (
                <div>
                  <div className="img-wrap">
                      <div className="showImg"><img src={ imgSuccess }/></div>
                  </div>
                  <div className="buy-state">{ this.state.data.success }</div>
                  <div className="order-info order-money">金额{this.state.amount}元</div>
                  <div className="button" onClick={() => this.goPosition()}>查看持仓</div>
                </div>
              )
            )
            :
            (
              <div>
                <div className="img-wrap">
                    <div className="showImg"><img src={ imgError }/></div>
                </div>
                <div className="buy-state">{ this.state.data.error }</div>
                <div className="button" onClick={() => this.goPosition()}>再试一次</div>
              </div>
            )
         }
         
	    </div>
    );
  };
};

export default SellResult;
