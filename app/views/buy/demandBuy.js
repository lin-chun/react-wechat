/**
 * 活期理财买入页
 */
import React from 'react';
import {
  creatOrder,
  getTime
} from 'api';
import 'css/buy/buy.scss'
import WeUI from 'react-weui';
import Main from 'component/Toast';
import {
  getItem,
  getUserInfo
} from 'business/Cache';
import { init } from 'api/security';
import Loading from 'component/Loading';
import stop from 'utils/stopDefault';
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
      value: '',
      // 时间
      time: '',
      // 两个月预估收益
      twoMonthYield: '0.00',
      // 买入按钮置灰
      checked: false,
      // 勾选条款
      inputChecked: true,
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
    });
    getTime().then((res) => {
      this.setState({
        time: res.data
      })
    })
  };
  // 勾选协议框
  changeChecked(e) {
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
    };
    console.log('OK');
    console.log(this.state.inputChecked)
    if (this.state.inputChecked == false && this.state.value !== '' && flag) {
      this.setState({
        checked: true
      })
    } else {
      this.setState({
        checked: false
      })
    };
  };
  order() {
    let self = this;
    if (parseInt(this.state.value) > 2000000) {
      console.log('超过限额');
    } else if (this.state.value < 1000) {
      this.setState({
        investmentAmountFlag: true
      });
    } else {
      if (parseInt(this.state.value) > parseInt(this.state.productDetail.residueQuota)) {
        console.log('超过剩余额度');
        this.setState({
          residueQuotaFlag: true
        });
      } else {
        // 判断是否满足年龄限制
        function computeAge(nowTime, startDate) {
          startDate = new Date(startDate);
          var newDate = nowTime - startDate.getTime();
          // 向下取整  例如 10岁 20天 会计算成 10岁
          // 如果要向上取整 计算成11岁，把floor替换成 ceil
          return Math.floor(newDate / 1000 / 60 / 60 / 24 / 365);
        };
        let userInfo = getUserInfo();
        let myTime = this.state.time.timestamp,
          minBuyAge = this.state.productDetail.payAgeLower,
          maxBuyAge = this.state.productDetail.maxBuyAge,
          age = computeAge(myTime, userInfo.birthDate);
        if (age < minBuyAge || age > maxBuyAge) {
          console.log('不符合年龄限制条件');
          self.refs.tip.open('买入者年龄需满足' + minBuyAge + '-' + maxBuyAge + '岁');
        } else {
          self.setState({
            showLoading: true
          });
          let data = {
            ffProductId: this.props.params.productId,
            amount: this.state.value,
            transactionType: '0'
          };
          // 创建金融订单
          creatOrder(data).then((res) => {
            self.setState({
              showLoading: false
            });
            if (res.code === '000000') {
              console.log(res);
              this.context.router.push({
                pathname: '/cashier',
                query: {
                  payOrderNo: res.data.payOrderNo,
                  orderNo: res.data.orderNo,
                  orderAmount: res.data.orderAmount,
                  orderChannel: res.data.orderChannel,
                  channel: '1001',
                  productCode: this.state.productDetail.productNo,
                  productType: '1',
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
    };
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
        <Main ref="tip"></Main>
        <Loading isShow = {this.state.showLoading}/>
        <Form>
          <FormCell>
                <CellHeader>
                    <Label>金额</Label>
                </CellHeader>
                <CellBody onClick={() => this.showKeyboard()}>
                    <Input type="tel" placeholder="1000元起购" value={this.state.value} disabled/>
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
          <label className="checkbox-tip" onChange={(e) => this.changeChecked(e)}>
            <input type="checkbox" className="weui-agree__checkbox" value="on" checked={this.state.inputChecked}/>
            <span className="weui-agree__text">&nbsp;&nbsp;我已阅读并同意</span>
          </label>
          <a className="goContract" href={agreement}>富盈5号相关协议</a>
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
          <Numberboard ref="board" type="number" shadowClose={true} shadow={false} frm={true} clickFun={(m) => this.clickFun(m)} ensure={(m) => this.ensure(m)}/>

      </div>
    );
  };
};

export default Buy;
