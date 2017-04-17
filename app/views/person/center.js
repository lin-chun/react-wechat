import React from 'react';
import list from 'business/BankList/datas';
import Loading from 'component/Loading';
import DialogFF from 'component/Dialog';
import Tip from 'component/Toast';
import OtpBoard from 'component/Keyboard/otpBoard';
import PaywordBoard from 'component/Keyboard/paywordBoard';
import {
  getUserInfo,
  removeItem
} from 'business/Cache';

//import Using ES6 syntax
import WeUI from 'react-weui';
import {
  init,
  encrypt
} from 'api/security';
import {
  getUserRisk,
  logout
} from 'api/index';

// 图片
import tel2x from '../../images/personCenter/tel2x.png';
import risk2x from '../../images/personCenter/risk2x.png';
import password2x from '../../images/personCenter/password2x.png';

// 埋点
import {
  wtCenter
} from 'business/webtrends'

const {
  Page,
  Button,
  Cell,
  Cells,
  CellHeader,
  CellBody,
  CellFooter,
  ButtonArea,
  Popup,
  Dialog,
  Toast
} = WeUI;
import "css/center.scss"

class Center extends React.Component {
  constructor(props) {
    super(props)
  }

  state = {
    tel: this.getLocalStorage(),
    bottom_show: false,
    fullpage_show: false,
    isActiveClick: true,
    riskType: '',
    riskUrl: '#/risk',
    showLoading:true,
    style1: {
      buttons: [{
        label: '确定',
        onClick: this.hideDialog.bind(this)
      }]
    },
  }

  getLocalStorage(data) {
    try {
      getUserInfo().mobileNo;
      return String(getUserInfo().mobileNo).replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    } catch (e) {
      console.log(e)
      return ''
    }
  }
  componentDidMount() {
    let self = this;
    getUserRisk().then(function (res) {
      if (res.code === "000000") {
        self.setState({
          showLoading: false
        });
        try {
          switch (res.data.isAssess) {
          case '0':
            return self.setState({
              riskType: "未评估",
              riskUrl: '#/risk?back=' + encodeURI('/center')
            })
          case '1':
            var riskLevel = res.data.riskLevel;
            if (riskLevel == "1") {
              self.setState({
                riskType: "保守型",
              })
            } else if (riskLevel == "2") {
              self.setState({
                riskType: "稳健型",
              })
            } else if (riskLevel == "3") {
              self.setState({
                riskType: "平衡型",
              })
            } else if (riskLevel == "4") {
              self.setState({
                riskType: "成长型",
              })
            } else if (riskLevel == "5") {
              self.setState({
                riskType: "进取型",
              })
            } else {
              self.setState({
                riskType: "",
              })
            }
            return self.setState({
              riskUrl: '#/risk/result?ulevel=' + res.data.riskLevel + '&back=' + encodeURI('/center')
            })
          case '2':
            return self.setState({
              riskType: "评测过期",
              riskUrl: '#/risk/answer?back=' + encodeURI('/center')
            })
          default:
            return
          }
        } catch (err) {
          console.log(err)
        }
      }


    });
  }

  hideDialog() {
    this.setState({
      showAuto1: false,
    });
  }

  logout() {
    let self = this;
    logout().then(function (res) {
      if (res.code == "000000") {
        removeItem('userInfo')
        location.hash = `#/login?backUrl=/center`
      } else {
        self.setState({
          errMsg: res.msg
        })
        self.showToast()
      }
    })
  }

  showToast() {
    this.setState({
      showToast: true
    });
    this.state.toastTimer = setTimeout(() => {
      this.setState({
        showToast: false
      });
    }, 30000);
  }
  render() {
    return (
      <div className="v-center">
        <Loading isShow = {this.state.showLoading} shadow = {2}></Loading>
        <Tip ref="tip" />
        <Cells>
            <Cell>
                <CellHeader>
                    <img src={tel2x}   alt="" style={{display: `block`, width: `20px`, marginRight: `5px`}}/>
                </CellHeader>
                <CellBody>
                    手机号码
                </CellBody>
                <CellFooter className="center-rg-word" otitle = {wtCenter[1]} otype="button">
                    {this.state.tel}
                </CellFooter>
            </Cell>
            <Cell  href={this.state.riskUrl} access>
                <CellHeader>
                    <img  src={risk2x}  alt="" style={{display: `block`, width: `20px`, marginRight: `5px`}}/>
                </CellHeader>
                <CellBody >
                    风险评测
                </CellBody>
                <CellFooter className="center-rg-word" otitle =  {wtCenter[2]} otype="button">
                    {this.state.riskType}
                </CellFooter>
            </Cell>
            <Cell href="javascript:;" access>
                <CellHeader>
                    <img  src={password2x}  alt="" style={{display: `block`, width: `20px`, marginRight: `5px`}}/>
                </CellHeader>
                <CellBody onClick={ e=> this.setState({ showAuto1: true}) } otitle =  {wtCenter[3]} otype="button">
                    密码管理
                </CellBody>
                <CellFooter className="center-rg-word" >
                    
                </CellFooter>
            </Cell>
        </Cells>

        <ButtonArea>
            <Button type="default" className="logout-btn" onClick={e=>this.setState({bottom_show: true})} > 退出登录</Button>
            <Popup
                show={this.state.bottom_show}
                onRequestClose={e=>this.setState({bottom_show: false})}
            >
            <div className = "logout-chose-wrap">
                <div>确定要退出登录吗？</div>
                <Button type="default" className={this.state.isActiveClick?'active':''} onClick={e=>this.setState({isActiveClick: true})} onClick={this.logout.bind(this)}>退出</Button>
                <Button type="default"  className={this.state.isActiveClick?'':'active'} onClick={e=>this.setState({bottom_show: false})}>取消</Button>
            </div>
            </Popup>
        </ButtonArea>
        <Dialog title={''} buttons={this.state.style1.buttons} show={this.state.showAuto1}>
            请去APP修改交易密码
        </Dialog>
        <Toast  show={this.state.showToast}>{this.state.errMsg}</Toast>
        </div>
    );
  }
}
export default Center;
