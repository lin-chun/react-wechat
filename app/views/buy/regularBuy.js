/**
 * 定期理财买入页
 */
import React from 'react';
import {
  creatOrder
} from 'api';
import 'css/buy/buy.scss'
import WeUI from 'react-weui';
import Tip from 'component/Toast';
import {
  getItem
} from 'business/Cache';
import Loading from 'component/Loading';
import Numberboard from 'component/Keyboard/numberBoard';
const {
  Form,
  Button,
  CellHeader,
  Label,
  CellBody,
  Input,
  FormCell,
  Cells,
  Cell,
  CellFooter,
  Popup,
  PopupHeader,
  Article,
  Switch,
  Agreement,
  Radio
} = WeUI;

class Buy extends React.Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      fullpage_show: false,
      bottom_show: false,
      showRecommend: true,
      value: '',
      // 两个月预估收益
      twoMonthYield: '0.00',
      endmethod: '自动买入下一期',
      // 买入按钮置灰
      checked: false,
      // 勾选条款
      inputChecked: true,
      // 推荐人
      refereeNo: null,
      // 输入金额不足起购金额的标志
      investmentAmountFlag: false,
      // 超过剩余额度的标志
      residueQuotaFlag: false,
      // 产品信息
      productDetail: null,
      // 显示loading
      showLoading: false
    };
  };
  componentWillMount() {
    this.setState({
      productDetail: getItem('productDetail')
    })
  };
  // 勾选协议框
  changeChecked() {
    let flag = true;
    if (parseInt(this.state.value) < 1000 || parseInt(this.state.value) > 2000000) {
      flag = false;
    };
    if (this.state.inputChecked) {
      this.setState({
        inputChecked: false
      })
    } else {
      this.setState({
        inputChecked: true
      })
    }
    if (this.state.inputChecked == false && this.state.value !== '' && flag) {
      this.setState({
        checked: true
      })
    } else {
      this.setState({
        checked: false
      })
    }
  };
  // 提交订单
  order() {
    let self = this;
    // this.refs.tip.open('yeah');
    if (parseInt(this.state.value) > 2000000) {
      self.refs.tip.open('超过限额');
    } else if (this.state.value < 1000) {
      this.setState({
        investmentAmountFlag: true
      });
    } else {
      if (parseInt(this.state.value) > parseInt(this.state.productDetail.residueQuota)) {
        this.setState({
          residueQuotaFlag: true
        });
      } else {
        self.setState({
          showLoading: true
        });
        let renewFlag;
        if (this.state.endmethod == '自动买入下一期') {
          renewFlag = '0';
        } else {
          renewFlag = '1';
        }
        let data = {
          ffProductId: this.props.params.productId,
          amount: this.state.value,
          transactionType: '0',
          renew: renewFlag,
          refereeNo: this.state.refereeNo
        };
        // 创建金融订单
        creatOrder(data).then((res) => {
          self.setState({
            showLoading: false
          });
          if (res.code === '000000') {
            this.context.router.push({
              pathname: '/cashier',
              query: {
                payOrderNo: res.data.payOrderNo,
                orderNo: res.data.orderNo,
                orderAmount: res.data.orderAmount,
                orderChannel: res.data.orderChannel,
                channel: '1001',
                productCode: this.state.productDetail.productNo,
                productType: '2',
                prdName: this.state.productDetail.prdName,
                ffProductId: this.state.productDetail.ffProductId
              }
            });
          } else {
            self.refs.tip.open(res.msg);
          }
        });
      }
    }
  };
  // 调起键盘
  showKeyboard() {
    this.refs.board.open();
  };
  // 确认按钮
  ensure(m) {
    this.refs.board.close();
  };
  // 键盘输入
  clickFun(m) {
    console.log(m.value);
    let flag = true;
    if (parseInt(m.value) < 1000 || parseInt(m.value) > 2000000) {
      flag = false;
    };
    let myYield = (parseFloat(m.value) * (parseFloat(this.state.productDetail.estimatedIncomRate)/100)).toFixed(2);
    this.setState({
      value: m.value,
      twoMonthYield: m.value == '' ? '0.00' : myYield,
      residueQuotaFlag: false
    });
    if (parseInt(m.value) < 1000) {
      this.setState({
        investmentAmountFlag: true
      });
    } else {
      this.setState({
        investmentAmountFlag: false
      });
    }
    if (m.value !== '' && this.state.inputChecked && flag) {
      this.setState({
        checked: true
      })
    } else {
      this.setState({
        checked: false
      })
    }
  };
  setAction() {
    this.setState({fullpage_show: true});
    document.title = '到期设置';
  };
  hideAction() {
    document.title = '买入';
  }
  render() {
    let detail = this.state.productDetail;
    let agreement = '';
    for (let i = 0; i < detail.annexationList.length; i++) {
      if (detail.annexationList[i].annexationKey == 'productTreaty') {
        agreement = detail.annexationList[i].annexationInfo;
      };
    };
    return (
      <div className="v-buy">
        <Tip ref="tip"></Tip>
        <Loading isShow = {this.state.showLoading}/>
	    	<Form>
		    	<FormCell>
		            <CellHeader>
		                <Label>金额</Label>
		            </CellHeader>
		            <CellBody onClick={ () => this.showKeyboard() }>
		                <Input type="tel" placeholder="1000元起购，1元递增" value={this.state.value} disabled/>
		            </CellBody>
		        </FormCell>
		    </Form>
		    <div className="est-tip">
		    	{ this.state.value > 2000000 ?
		    		(<div className="tip">单比最多可买入200万元</div>)
		    		:
		        (
              this.state.investmentAmountFlag ?
              (<div className="tip">起购金额为{this.state.productDetail.investmentAmount}元</div>)
              :
              (
                this.state.residueQuotaFlag ?
                (<div className="tip">剩余可购金额为{this.state.productDetail.residueQuota}</div>)
                :
                (<div>预估两个月收益：<span className="est-money">{this.state.twoMonthYield}元</span><span>（根据过去两个月收益率计算）</span></div>)
              )
            )
		        }
	        </div>
	        <Cells className="end-wrap">
	            <Cell access>
	                <CellBody>
	                   	到期设置
	                </CellBody>
	                <CellFooter onClick={() => this.setAction()}>
	                    {this.state.endmethod}
	                </CellFooter>
	            </Cell>
	        </Cells>
	        <Popup
                show={this.state.fullpage_show}
                onRequestClose={e=>this.setState({fullpage_show: false})}
            >
                <div style={{height: '100vh', overflow: 'scroll', background: '#f5f5f5'}}>
                    <Form radio onClick={() => this.hideAction()}>
		                <FormCell radio className="label-check" onClick={e=>this.setState({endmethod: '自动买入下一期',fullpage_show: false})}>
		                    <CellBody>
		                    	<div className="label-title">自动买入下一期</div>
		                    	<div className="label-content">到期日次日(自然日)为下一个投资周期的起始日，以45个自然日为一个周期，收益不间断。</div>
		                    </CellBody>
		                    <CellFooter>
		                        <Radio name="radio1" value="1" defaultChecked/>
		                    </CellFooter>
		                </FormCell>
		                <FormCell radio className="label-check" onClick={e=>this.setState({endmethod: '赎回至支付账户',fullpage_show: false})}>
		                    <CellBody>
		                    	<div className="label-title">赎回至支付账户</div>
		                    	<div className="label-content">一般情况下，赎回申请成功后，款项会在下一个交易日(T＋1)内到账。</div>
		                    </CellBody>
		                    <CellFooter>
		                        <Radio name="radio1" value="2"/>
		                    </CellFooter>
		                </FormCell>
		            </Form>
		            <div className="end-tips">理财期限内不可取出，可根据你的资金计划，选择合适的到期设置，到期日前一天（自然日）14:50前可随时更改，14:50后将不可更改</div>
                </div>
            </Popup>
            <Form className="end-wrap">
                <FormCell switch>
                    <CellBody>推荐人</CellBody>
                    <CellFooter>
                        <Switch onClick={ this.state.showRecommend == true ? e=>this.setState({showRecommend: false}) : e=>this.setState({showRecommend: true})}/>
                    </CellFooter>
                </FormCell>
                <div className="recommend" style={{display: this.state.showRecommend == true ? 'none' : 'block'}}>
                	<Input type="tel" className="recommendNum" placeholder="填写推荐您买入次产品的客户经理号" onChange={e=>this.setState({refereeNo: e.target.value})}/>
                </div>
            </Form>
            <label className="checkbox-tip" onChange={(e) => this.changeChecked(e)}>
              <input type="checkbox" className="weui-agree__checkbox" value="on" checked={this.state.inputChecked}/>
              <span className="weui-agree__text">&nbsp;&nbsp;我已阅读并同意</span>
            </label>
            <a className="goContract" href={agreement}>富盈7号相关协议</a>
            <div className="keyboardWrap"></div>
            <div className='buy-wrap'>
                  <div className="pay-money">实际支付：<span className="money">{this.state.value}</span></div>
                  {
                    this.state.checked ?
                    (
                      <div className="buy" onClick={ () => this.order() }>买入</div>
                    )
                    :
                    (
                      <div className="buy disable-buy">买入</div>
                    )
                  }
            </div>
            <Popup
                show={this.state.bottom_show}
                onRequestClose={e=>this.setState({bottom_show: false})}
            >
                <PopupHeader/>
                <div className="payErrorTitle">支付失败</div>
                <div className="errorReason">失败原因：超过银行卡支付限额</div>
                <div className="watchError">请查看&nbsp;<a href="">银行卡限额说明</a></div>
                <div className="errorWrap">	
                	<div className="knowError" onClick={ e=>this.setState({bottom_show: false}) }>知道了</div>
                </div>
            </Popup>
            <Numberboard ref="board" type="number" shadowClose={true} shadow={false} frm={true} clickFun={(m) => this.clickFun(m)} okFun={(m) => this.ensure(m)}/>
	    </div>
    );
  };
};

export default Buy;
