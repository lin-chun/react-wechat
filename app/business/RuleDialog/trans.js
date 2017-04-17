import './index.scss';
import React from 'react';
import {
  Popup
} from 'react-weui';

export default class TransDialog extends React.Component {
  state = {
    fullpage_show: false
  };

  constructor(props) {
    super(props);
  };

  // 打开
  open(type) {
    this.setState({
      fullpage_show: true
    });
  };

  // 关闭
  close() {
    this.setState({
      fullpage_show: false,
      show: 'none'
    });
  };

  render() {
    return (
      <Popup show={this.state.fullpage_show} onRequestClose={e=>this.setState({fullpage_show: false})}>
        <div style={{height: '100vh', overflow: 'auto'}}>
          <div className="b-ruledialog">
            <div className="trans">
              <div className="title">
                请用户（以下称为“您”）仔细阅读本授权委托书并通过网络页面点击确认或以其他方式选择接受本协议，一经确认接受本授权书即生效力。如果您不同意本授权书的任意内容，请不要进行后续操作。  为使用平台委托的第三方机构提供的银行卡核验和代扣付服务（以下简称“本服务”），您了解并同意： 
              </div>
              <div className="row">
                一、银行卡核验是需要您提供发卡行要求的银行卡卡号、持卡人银行预留手机号码等有效身份信息即可完成一致性验证的服务。您保证提供的银行卡资料（包括：卡号、姓名、证件号码、手机号码等）为您本人持有的真实、完整、准确、合法、有效的银行卡信息，并同意将以上信息通过本平台委托的第三方支付机构向发卡银行核验。 
              </div>
              <div className="row">
                二、授权本平台委托的第三方支付机构根据您的指令从您提供的经过核验的银行卡中扣收相应款项用于在本平台购买相应产品或服务； 
              </div>
              <div className="row">
                三、如因您未按照规定提交相关信息或提交的信息错误、虚假、过时或不完整，第三方支付机构有权拒绝为您提供银行卡认证服务，您因此未能使用本服务而产生的损失由您自行承担； 
              </div>
              <div className="row">
                四、本服务涉及银行、第三方支付机构等机构的合作。受银行、第三方支付机构等仅在工作日进行资金划转的现状等各种原因所限，本平台不对资金到账时间做任何承诺，也不承担与此相关的责任，包括但不限于由此产生的利息、货币贬值等损失； 
              </div>
              <div className="row">
                五、如因您账户未启用、挂失、冻结、止付、销户、作废、余额不足等原因导致扣款不成功或无法办理收款入账的，由此产生的责任由您自行承担； 
              </div>
              <div className="row">
                六、本授权书一经您确认，即表示您不可撤销地授权本平台委托的第三方支付机构进行相关银行卡核验和代扣付操作，且该等操作是不可逆转的，您不能以任何理由拒绝付款或要求取消交易。
              </div>
              <button onClick={() => this.close()} className="button">我知道啦</button>
            </div>
          </div>
        </div>
      </Popup>
    );
  };
};
