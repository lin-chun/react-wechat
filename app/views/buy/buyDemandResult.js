/**
 * 活期买入结果页
 */
import React from 'react';
import {
  Link
} from 'react-router';
import 'css/buy/buyRegularResult.scss';
import imgSuccess from 'images/success.png';
import imgError from 'images/error.png';
import imgDealing from 'images/dealing.png';
import {
  dealNumber
} from 'utils/regs';
import {
  getItem
} from 'business/Cache';

class BuyResult extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };
  data = {
    orderStatus: this.props.location.query.orderStatus,
    amount: dealNumber(this.props.location.query.amount)
  };
  constructor(props) {
    super(props);
    this.state = {
      // 申购是否成功
      success: null,
      // 申购状态是否是处理中
      deal: null,
      productDetail: getItem('productDetail')
    };
  };
  componentWillMount() {
    console.log(this.props.location.query);
    switch (this.data.orderStatus) {
      case '0':
        this.setState({
          success: true,
          deal: true
        });
        break;
      case '1':
        this.setState({
          success: true,
          deal: false
        });
        break;
      case '2':
        this.setState({
          success: false
        });
        break;
      default:
        return;
    }
  };
  goPosition() {
    this.context.router.push({
      pathname: '/position/' + this.state.productDetail.ffProductId
    });
  };
  goIndex() {
    this.context.router.push({
      pathname: '/product/detail/' + this.state.productDetail.ffProductId
    });
  };
  render() {
    const dealing = '买入申请已提交';
    const success = '买入申请提交成功';
    const error = '可能出了点问题，请稍后再试';
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
                  <div className="buy-state">{ dealing }</div>
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
                  <div className="buy-state">{ success }</div>
                  <div className="order-info order-money">金额{this.data.amount}元</div>
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
                <div className="buy-state">{ error }</div>
                <div className="button" onClick={() => this.goIndex()}>再试一次</div>
              </div>
            )
         }
         
	    </div>
    );
  };
};

export default BuyResult;
