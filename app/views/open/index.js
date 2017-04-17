import 'css/open.scss';
import React from 'react';
import BankList from 'business/BankList';
import Loading from 'component/Loading';
import Toast from 'component/Toast';
import Dialog from 'component/Dialog';
import OtpBoard from 'component/Keyboard/otpBoard';
import NumberBoard from 'component/Keyboard/numberBoard';
import {
  regBankCard,
  replaceMobile
} from 'utils/regs';
import {
  getBankInfo
} from 'business/BankList/datas';
import TransDialog from 'business/RuleDialog/trans';
import {
  getUserInfo,
  getItem
} from 'business/Cache';
import {
  getCardBin,
  signCardByOpen
} from 'api';
import {
  wtOpen
} from 'business/webtrends';

/** 
 * 绑卡首页
 * 页面 url 可以带 back ，代表开户结束之后要跳转到的路径
 * @author zhongzhuhua
 */
export default class OpenIndex extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  state = {
    issubmit: false,
    timer: null,
    errMsg: '请输入有效的银行卡卡号',
    card: '',
    value: '',
    submitCard: '',
    next: false,
    bankInfo: null,
    bank: null,
    keyCard: false,
    mobile: '',
    // 是否丢失身份校验信息
    lose: false,
  };

  constructor(props) {
    super(props);
  };

  componentWillMount() {
    let userInfo = getUserInfo();
    if (userInfo == null) {
      this.context.router.push('/login?backUrl=/open/idcard');
    }
    this.state.mobile = userInfo.mobileNo;
  };

  componentDidMount() {
    this.checkOpenInfo();
  };

  checkOpenInfo() {
    let self = this;
    // 实名验证通过添加 bindcard/index.js
    let openInfo = getItem('openInfo', 1);
    if (openInfo == null) {
      self.refs.dialogAlert.open('请重新填写用户信息');
      self.setState({
        lose: true,
        issubmit: false
      });
      return false;
    }
    return true;
  };

  // 支持的银行
  lookCard() {
    this.refs.dialog.open();
  };

  // 代扣协议
  openRule() {
    this.refs.dialogTrans.open();
  };

  // 鉴卡
  goPass() {
    let self = this;
    if (self.state.issubmit) return;
    self.setState({
      issubmit: true
    });
    let bank = self.state.bankInfo;
    let openInfo = getItem('openInfo', 1);
    let mydata = {
      cifName: openInfo.name,
      idNo: openInfo.id,
      bindAccountNo: self.state.value,
      bankNo: bank.bankCode,
      bankName: bank.bankName,
      otherBankFlag: bank.otherBankFlag,
      operationType: 0
    };
    console.log(mydata);
    signCardByOpen(mydata).then(function (res) {
      self.setState({
        issubmit: false
      });
      if (res.code == '000000') {
        self.context.router.push({
          pathname: '/open/pass',
          query: self.props.location.query
        });
      } else {
        self.refs.dialogAlert.open(res.msg);
      }
    });
  };

  // 校验短信失败之后确定
  alertOk() {
    if (this.state.lose) {
      this.context.router.goBack();
    } else {
      this.refs.dialogAlert.close();
    }
  };

  // 弹出数字键盘
  showBoard() {
    this.setState({
      boardOpen: true,
      next: false
    });
    this.refs.CardBoard.open(this.state.value);
  };

  // 输入卡号
  inputCard(model) {
    this.setState({
      value: model.value,
      card: model.frmValue
    });
  };

  // 清除卡号
  clearCard() {
    this.refs.CardBoard.clear();
    this.inputCard({
      value: '',
      frmValue: ''
    });
  };

  /**
   * 确认卡号
   * @param check 是否进行校验
   */
  okCard() {
    let self = this;
    let value = this.state.value;
    self.state.value = value;

    clearTimeout(self.state.timer);
    self.state.timer = setTimeout(function () {
      if (value != '' && regBankCard.test(value)) {
        if (self.state.issubmit) {
          return;
        }
        self.setState({
          issubmit: true,
          next: false
        });
        getCardBin(value).then(function (res) {
          let bank = null;
          let name = null;
          if (res.code !== '000000') {
            self.refs.toast.open(res.msg);
          } else {
            let data = res.data;
            self.state.bankInfo = data;
            name = data && data.bankName;
            bank = getBankInfo(data && data.bankCode);
            if (bank == null) {
              self.refs.toast.open('暂不支持该银行');
            }
          }
          self.setState({
            issubmit: false,
            bank: bank,
            next: bank != null && bank.length == 2
          });
        });
      } else {
        self.setState({
          bank: null
        });
        if (value != '') {
          self.refs.toast.open(self.state.errMsg);
        }
      }
    }, 200);
  };

  // 打开 otp 键盘
  showOtp() {
    this.refs.OtpBoard.open();
  };

  clickBody(e) {
    let ele = e && e.target;
    if (ele) {
      let clazz = ele.className.toLowerCase();
      if (clazz !== 'input-value' && clazz !== 'icon-clear') {
        this.refs.CardBoard.close();
        this.okCard();
      }
    }
  };

  render() {
    return (
      <div>
        <div className="v-open" onClick={(e) => this.clickBody(e)}>
          <div className="index">
            <div className="title">
              绑定以 {replaceMobile(this.state.mobile)} 为银行预留手机号的储蓄卡
            </div>
            <div className="mobile-mess">手机号与银行预留手机号不符无法绑卡成功。</div>
            <div className="input">
              <div ref="card" onClick={() => this.showBoard()} className="input-value">{this.state.card}</div>
              <span style={{display: (this.state.card != '' && this.state.boardOpen) ? 'block' : 'none'}} onClick={() => this.clearCard()} className="icon-clear"></span>
              {
                <div style={{display: (this.state.card ? 'block' : 'none')}} className="input-holder"></div>
              }
            </div>
            {
              this.state.bank == null ?
              (
                <div className="bank-list">
                  <div onClick={() => this.lookCard()} className="link">查看支持的银行</div>
                  <div className="memo">建议绑定限额较高的xxx银行卡</div>
                </div>
              )
              :
              (
                <div className="bank-list">
                  <div onClick={() => this.lookCard()} className="link">{this.state.bank[0]}</div>
                  <div className="memo">{this.state.bank[1]}</div>
                </div>
              )
            }
            <div className="buttons">
              <div className="memo">点击“下一步”表示你已同意 <span onClick={() => this.openRule()} otitle={wtOpen['6']} otype="button">代扣协议</span></div>
              <button onClick={() => this.showOtp()} disabled={!this.state.next} otitle={wtOpen['5']} otype="button">下一步</button>
            </div>
          </div>
        </div>
        <BankList ref="dialog" />
        <TransDialog ref="dialogTrans" />
        <NumberBoard ref="CardBoard" shadow={false} events={true} frmSplit={4} clickFun={(m) => this.inputCard(m)} okFun={(m) => this.okCard()} closeFun={() => {this.okCard(); this.setState({boardOpen: false})}} />
        <OtpBoard ref="OtpBoard" successFun={() => this.goPass()} mobile={this.state.mobile} smsTitle={wtOpen['8']} okTitle={wtOpen['10']} cancleTitle={wtOpen['9']} />
        <Toast ref="toast" />
        <Dialog ref="dialogAlert" okFun={() => this.alertOk()} btnOk="知道了" />
        <Loading isShow={this.state.issubmit} />
      </div>
    );
  };
};
