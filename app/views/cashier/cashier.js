import 'css/cashier.scss';
import React from 'react';
import {
  checkBank,
  getBankInfo
} from 'business/BankList/datas';
import Loading from 'component/Loading';
import Dialog from 'component/Dialog';
import Tip from 'component/Toast';
import OtpBoard from 'component/Keyboard/otpBoard';
import PaywordBoard from 'component/Keyboard/paywordBoard';
// import Main from 'component/PopupBottom/popupBottom'; 不用了
import {
  getUserInfo
} from 'business/Cache';
import {
  pay,
  getPaymentList
} from 'api/index';
import {
  dealNumber
} from 'utils/regs';
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  ButtonArea,
  Button,
  Popup
} from 'react-weui';

// 埋点
import {wtCashier} from 'business/webtrends'

// 风控
import PaWebJs from 'business/pawebjs';
let fp = new PaWebJs().get();

export default class Cashier extends React.Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };
  paymentPostData = {
    orderNo: this.props.location.query.orderNo,
    payOrderNo: this.props.location.query.payOrderNo,
    productCode: this.props.location.query.productCode,
    channel: this.props.location.query.channel, //金融产品传1001
    ffOs: 'H5',
  };
  payPostData = {
    payAcct: '',
    amount: this.props.location.query.orderAmount,
    orderNo: this.props.location.query.orderNo,
    channelCode: '',
    ffProductId: '',
    ffOs: 'H5',
    payOrderNo: this.props.location.query.payOrderNo,
    channel: this.props.location.query.channel,
    productCode: this.props.location.query.productCode,
    blackBox:fp||""
  };
  constructor(props) {
    super(props);
    this.state.productName = this.props.location.query.prdName;
    this.state.buyMoney = dealNumber(this.props.location.query.orderAmount);
  };
  // 初始化判断是否开过户
  componentDidMount() {
    let self = this;
    this.setState({
      showLoading: true
    })
    self.getBankInfoList().then(function (res) {
      if (getUserInfo().userType != "2") {
        location.hash = `/open`
      };
      self.setState({
        showLoading: false
      });
    });
  };
  static defaultProps = {};

  state = {
    bankName: '',
    showLoading: false,
    numKBvalue: '',
    paywordKB: false,
    productName: '',
    buyMoney: '',
    canPay: '',
    payResultUrl: {
      '1': '/buy/demand-result?',
      '2': '/buy/regular-result?'
    },
    popupData: {
        title: '',
        content: '',
        openText: '',
        closeText: '',
        url: ''
    },
  };
  getOtpRes(res) {
    console.log(res)
  };
  transferNum(numKBvalue) {
    this.setState({
      numKBvalue
    });
  };

  // 弹出数字键盘
  showBoard() {
    this.refs.OtpBoard.open();
  };

  // 弹出数字键盘
  showPaywordBoard() {
    this.refs.PaywordBoard.open();
  };

  // 弹出提示框
  dialog(title) {
    this.refs.dialog.open('已绑定的银行卡暂不支持支付，请更换其他银行卡进行支付');
  };

  // 密码键盘回调
  callbackPayword(number) {
    this.payPostData.payType = '1';
    this.payPostData.tranPassword = number.encodePassword;
    this.payReq(this.payPostData);
  };

  // 点击支付
  payBtn() {
    this.payPostData.payType = '0';
    this.payReq(this.payPostData);
  };

  // 点击otp确认
  optBtnPost(m) {
    this.payPostData.payType = '2';
    this.payPostData.smsCode = m.value;
    this.payReq(this.payPostData);
  };

  // 获取银行卡列表
  getBankInfoList() {
    let self = this;
    return getPaymentList(this.paymentPostData).then(function (res) {
      //userType 0：低门槛用户，1：高门槛用户
      //changeCardFlag  0: 不需要换绑卡，1：需要换绑卡
      if (res.code == '000000') {
        self.payPostData.ffProductId = res.data.ffProductId
          // 低门槛用户去开户
        if (res.data.userType === '0') {
          // location.hash = '/open/idcard';
          return;
        }
        // 高门槛用户
        var bankNum = self.payPostData.payAcct = res.data.list[0].payAcct;
        if (checkBank(res.data.list[0].bankCode)) {
          let bandDataArray = getBankInfo(res.data.list[0].bankCode);
          self.payPostData.channelCode = res.data.list[0].channelCode;
          self.setState({
            bankName: bandDataArray[0],
            limitInfo: bandDataArray[1],
            canPay: true
          });
        } else {
          self.payPostData.channelCode = res.data.list[0].channelCode;
          self.setState({
            bankName: res.data.list[0].bankName,
            limitInfo: '暂无限额信息',
            canPay: false
          });
        }
        self.setState({
          'bankNo': bankNum.substring(bankNum.length - 4, bankNum.length)
        });
      } else {
        self.refs.tip.open(res.msg);
      }
    });
  };
  // 支付请求
  payReq(params) {
    let self = this;
    self.setState({
      showLoading: true
    });
    pay(params).then(function (res) {
      self.setState({
        showLoading: false,
      });
      /**
       * 支付状态吗
       * 240309  交易密码错误
       * 200010  交易密码锁定
       * 240318  超出限额
       * 240310  没有风控
       * 000001  系统异常
       * 240209  主账户不支持，换绑卡
       */
      if (res.code === '000000') {
        debugger
        switch (res.data.resultType) {
        case '0': //支付成功
          // productType = 1 获取理财
          // productType = 2 定期理财
          if (self.props.location.query.productType == '1') {
            location.hash = self.state.payResultUrl['1'] + `orderStatus=${res.data.orderStatus}&amount=${self.payPostData.amount}`;
          } else if (self.props.location.query.productType == '2') {
            location.hash = self.state.payResultUrl['2'] + `orderStatus=${res.data.orderStatus}&amount=${self.payPostData.amount}`;
          } else {
            return;
          }
        case '1': //安全键盘
          return self.showPaywordBoard();
        case '2': //OTP
          return self.showBoard();
        default:
          return;
        }
      }else if(res.code === '200010'){
        self.refs.dialogNoOk.open(res.msg);
        self.setState({
          popupData: {
            btnCancel: '知道了',
            cancelTitle:wtCashier[3],
          }
        });
      }else if(res.code === '240318'){
        self.refs.dialogNoOk.open(res.msg);
        self.setState({
          popupData: {
            btnCancel: '知道了',
            cancelTitle:wtCashier[5]
          }
        });
        
      }else if(res.code === '240310'){
        self.refs.dialogNoOk.open(res.msg);
        self.setState({
          popupData: {
            btnCancel: '知道了',
            cancelTitle:wtCashier[6]
          }
        });
        
      }else if(res.code === '000001'){
        self.refs.dialogNoOk.open(res.msg);
        self.setState({
          popupData: {
            btnCancel: '知道了',
            cancelTitle:wtCashier[7]
          }
        });  
      }else if(res.code === '240209'){
        self.refs.dialogChange.open(res.msg);
      }else if(res.code === '240309'){
        self.setState({
          warnInfo: res.msg
        });
      }
      else {
        self.refs.tip.open(res.msg);
      }
    });
  };

  render() {
    let btnPayCN = this.state.canPay ? 'btn-pay ' : 'btn-pay disabled';
    let btnPayDis = this.state.canPay ? '' : 'disabled';
    {/*<Main ref="popupPage" title={this.state.popupData.title} content={this.state.popupData.content} openText={this.state.popupData.openText} closeText={this.state.popupData.closeText} url={this.state.popupData.url} otitle={this.state.popupData.otitle}></Main>*/}
    return (
      <div className="v-cashier">
        <div>{this.state.numKBvalue}</div>
        <div className="product-title">{this.state.productName}</div>
        <div className="bug-money-title">支付金额</div>
        <div className="bug-money">¥{this.state.buyMoney}</div>
        <Cells>
          <Cell>
            <CellHeader style={{ position: 'relative', marginRight: '10px' }}>
            </CellHeader>
            <CellBody>
              {<p className="bannk-name">{this.state.bankName ? this.state.bankName +'('+this.state.bankNo+')':"暂无银行卡信息"} </p>}
              <p className="limit-money">{this.state.limitInfo}</p>
            </CellBody>
          </Cell>
        </Cells>
        <ButtonArea>
          <button disabled={btnPayDis} className={btnPayCN} onClick={this.payBtn.bind(this)} otitle = {wtCashier[1]} otype="button">确认支付</button>
        </ButtonArea>
        <Dialog ref="dialogChange" shadow={1} btnOk="换一张" btnCancel="取消" okFun={() => location.hash = "/open"} cancelFun={() => this.refs.dialog.close()} />
        <Dialog ref="dialogNoOk" shadow={1}  btnCancel={this.state.popupData.btnCancel}  cancelTitle={this.state.popupData.cancelTitle}   />
        <Loading isShow = {this.state.showLoading} shadow = {2}></Loading>
        <OtpBoard ref="OtpBoard" successFun={(m) => this.optBtnPost(m)} mobile={this.state.mobile} otitle={wtCashier[4]} />
        <PaywordBoard  ref="PaywordBoard" maxLength="6" callbackPayword={this.callbackPayword.bind(this)} encryptMethod={2} otitle={wtCashier[2]} warnInfo={this.state.warnInfo}/>
      </div>
    );
  };
};
