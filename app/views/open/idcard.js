import 'css/open.scss';
import React from 'react';
import {
  regName,
  regIdCard,
  replaceMobile
} from 'utils/regs';
import Loading from 'component/Loading';
import Dialog from 'component/Dialog';
import NumberBoard from 'component/Keyboard/numberBoard';
import {
  getCustInfo,
  checkUserIdInfo,
  logout
} from 'api';
import {
  setItem,
  removeItem,
  getUserInfo
} from 'business/Cache';
import Toast from 'component/Toast';
import {
  wtOpen
} from 'business/webtrends';

/**
 * 开户绑卡-身份证校验
 * 页面 url 可以带 back ，代表开户结束之后要跳转到的路径
 * @author zhongzhuhua
 */
export default class OpenIdCard extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  state = {
    // 用户是否登录
    login: true,
    // 登录用户的手机号
    mobile: '',
    // 是否提交中
    issubmit: false,
    // 是否已经被开户
    isopen: false,
    // 名称是否正确
    isName: false,
    // 身份证是否正确
    isId: false,
    name: '',
    id: '',
    // 数字键盘是否展开
    boardOpen: false
  };

  constructor(props) {
    super(props);
  };

  componentDidMount() {
    if (!this.state.isopen) {
      this.checkName();
    }
    // 判断用户
    let user = getUserInfo();
    if (user == null) {
      this.state.login = false;
      this.refs.alert.open('请先登录');
    } else {
      this.state.mobile = user.mobileNo;
      if (user.userType == '2') {
        this.state.isopen = true;
        this.refs.alert.open('您已经开户成功，请勿重复开户');     
      }
    }
  };

  // 清除姓名
  clearName() {
    this.refs.name.value = '';
    this.checkName();
  };

  // 清除身份证
  clearId() {
    this.refs.board.clear();
    this.setState({
      id: '',
      frmId: '',
      isId: false
    });
  };

  // 校验用户名
  checkName() {
    let value = this.refs.name.value;
    this.setState({
      isName: regName.test(value),
      name: value
    });
  };

  // 输入身份证
  clickFun(model) {
    // this.refs.name.value = '大伙子';
    // this.checkName();
    // model = {
    //   value: '440582199002022364',
    //   frmValue: '440582199002022364'
    // };
    // 440582199001012914 
    let value = model.frmValue;
    this.state.id = model.value;
    this.setState({
      frmId: model.frmValue
    });
    this.checkId(false);
  };

  /**
   * 校验身份证
   * @param tip 是否要提示
   */
  checkId(toast) {
    let self = this;
    let isId = regIdCard.test(self.state.id);
    self.setState({
      isId: isId
    });
    if (!isId && self.state.id != '') {
      if (toast) {
        self.refs.toast.open('请输入有效身份证件');
      }
    } else {
      self.refs.toast.close();
    }
  };

  // 提交校验
  submit() {
    if (this.state.issubmit) return;
    this.setState({
      issubmit: true
    });
    let self = this;
    getCustInfo(self.state.id, self.refs.name.value).then(function (res) {
      let isopen = false;
      // 获取用户登录数据中的手机号码
      let mobile = '';
      let err = '';
      if (res.code != '000000') {
        err = res.msg;
      } else {
        let user = res.data;
        // 如果未开户则跳转到开户页面，否则提示错误弹窗
        if (user) {
          if (user.custSignFlag == 'Y') {
            isopen = true;
            mobile = replaceMobile(user.mobileNo);
          }
        }
      }
      // 如果已经开户，则提示；否则跳转到开户页面
      if (isopen) {
        if (replaceMobile(self.state.mobile) == mobile) {
          self.refs.alert.open('您已经开户成功，请勿重复开户');          
        } else {
          self.refs.dialog.open('您的身份证已经与账户' + mobile + '进行绑定，您可以使用' + mobile + '登录或修改身份证。');
        }
        self.setState({
          issubmit: false,
          isopen: true
        });
      } else {
        if (err != '') {
          self.refs.alert.open(err);
          self.setState({
            issubmit: false,
            isopen: false
          });
        } else {
          self.checkUser();
        }
      }
    });
  };

  // 联网核查
  checkUser() {
    let self = this;
    checkUserIdInfo(self.state.id, self.refs.name.value).then((res) => {
      self.setState({
        issubmit: false,
        isopen: false
      });
      if (res.code == '000000') {
        setItem('openInfo', {
          id: self.state.id,
          name: self.refs.name.value
        }, 1);
        self.context.router.push({
          pathname: '/open',
          query: self.props.location.query
        });
      } else {
        self.refs.alert.open('身份信息核查失败');
      }
    });
  };

  dialogCancel() {
    if (this.state.isopen) {
      let back = this.props.location.query.back;
      if (back) {
        this.context.router.push(back);
      } else {
        this.context.router.push('/');
      }
    } else if (this.state.login === false) {
      this.context.router.push('/login?backUrl=' + this.props.location.pathname + this.props.location.search);
    } else {
      this.setState({
        issubmit: false,
        isopen: false
      });
      this.refs.alert && this.refs.alert.close();
      this.refs.dialog && this.refs.dialog.close();
    }
  };

  // 换号码到登录
  changeLogin() {
    logout();
    removeItem('userInfo');
    this.context.router.push('/login');
  };

  clickBody(e) {
    let ele = e && e.target;
    if (ele) {
      let clazz = ele.className.toLowerCase();
      if (clazz !== 'input-id' && clazz !== 'icon-clear') {
        this.refs.board.close();
      }
    }
  };

  render() {
    return (
      <div>
        <div className="v-open" onClick={(e) => this.clickBody(e)}>
          <div className="idcard">
            <div className="input">
              <input ref="name" value={this.state.name} onChange={() => this.checkName()} onBlur={() => this.setState({nameFocus: false})} onFocus={() => this.setState({nameFocus: true})} placeholder="姓名" maxLength="6" />
              <span style={{'display': this.state.name != '' && this.state.nameFocus ? 'block' : 'none'}} onClick={() => this.clearName()} className="icon-clear"></span>
            </div>
            <div className="input">            
              <div ref="id" className="input-id" onClick={() => {this.refs.board.open(this.state.id); this.setState({boardOpen: true})}}>{this.state.frmId}</div>
              <span style={{'display': (this.state.id != '' && this.state.boardOpen) ? 'block' : 'none'}} onClick={() => this.clearId()} className="icon-clear"></span>
            </div>
            <button className="button" onClick={() => this.submit()} disabled={!this.state.isName || !this.state.isId} otitle={wtOpen['1']} otype="button">下一步</button>
          </div>
        </div>
        <NumberBoard ref="board" shadow={false} events={true} clickFun={(m) => this.clickFun(m)} closeFun={() => {this.checkId(true); this.setState({boardOpen: false})}} type="id" />
        <Dialog ref="alert" shadow={false} cancelFun={() => this.dialogCancel()} btnCancel="知道了" cancelFun={() => this.dialogCancel()} />
        <Dialog ref="dialog" shadow={false} okFun={() => this.changeLogin()} cancelFun={() => this.dialogCancel()} btnOk="更换手机登录" btnCancel="取消" cancelTitle={wtOpen['4']} okTitle={wtOpen['3']} />
        <Loading isShow={this.state.issubmit} />
        <Toast ref="toast" />
      </div>
    );
  };
};
