import React from 'react'
import WeUI from 'react-weui';
import 'css/position/position.scss';
import {
  getDealInfo,
  getPosition,
  getProductDetail,
  getSevthYield,
  getMillionIncome,
  creatOrder,
  getTime,
  getUserRisk
} from 'api';
import Loading from 'component/Loading';
import PasswordBoard from 'component/Keyboard/paywordBoard';
import TranBoard from 'component/Keyboard/tranBoard';
import Main from 'component/PopupBottom/popupBottom';
import {
  getMillSevth,
  getQrnhSevth
} from 'business/handleEchart';
import {
  getUserInfo,
  setItem
} from 'business/Cache';
import Toast from 'component/Toast';
import {
  init
} from 'api/security';
import Highcharts from 'highcharts';
import High from 'highcharts/modules/exporting';
High(Highcharts);
import Reload from 'component/RequestFailShow';
// require('business/loginTest').login(4);

const {
  Tab,
  TabBody,
  NavBar,
  NavBarItem,
  Article,
  Cells,
  Cell,
  CellBody,
  CellFooter,
  Popup,
  Input
} = WeUI;

class Position extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };
  constructor(props) {
    super(props);
    this.chartLine = this.chartLine.bind(this);
    this.state = {
      // tab切换
      tab: 0,
      seven: 0,
      month: 1,
      year: 1,
      flag: 0,
      // 解释段落
      positionTipPage_show: false,
      // 输入密码弹窗
      sellPassword_show: false,
      // 买入确认订单列表
      buyConfirm: [],
      // 卖出确认订单列表
      sellConfirm: [],
      // 退款到账中列表
      refund: [],
      // 到账中列表
      account: [],
      // 买入确认订单总金额
      buyConfirmTotal: '',
      // 卖出确认订单总金额
      sellConfirmTotal: '',
      // 退款到账订单总金额
      refundTotal: '',
      // 到账中订单总金额
      accountTotal: '',
      // 持仓返回数据
      position: null,
      // 交易明细
      dealInfo: null,
      // 产品详情
      productDetail: null,
      number: '',
      // 七日年化描点
      sevthYearYield: null,
      // 万份收益描点
      millionIncome: null,
      // 输入金额
      value: '',
      // 显示格式化的金额
      frmValue: '',
      // 密码
      password: '',
      // 是否需要第三行
      needThirdTitle: false,
      // 是否报错,true:不报错
      isWarn: true,
      // 输入密码报错信息
      warnInfo: '报错',
      // 显示预计到账时间
      showTime: false,
      // 预计到账时间
      expectTime: '',
      // 输入密码弹窗第二行title
      secTitle: '',
      showLoading: false,
      // 是否评估过
      isAssess: '',
      // 用户风险等级
      userRiskLevel: '',
      // 下拉弹窗传入对象
      popupData: {
        title: '',
        content: '',
        openText: '',
        closeText: '',
        url: ''
      },
      isShow: true,
      showRefreshPage: false
    }
  };
  componentWillMount() {
    let userInfo = getUserInfo();
    console.log(userInfo);
    let list = [];
    let self = this;
    init().then(() => {
      Promise.all([
        new Promise(function (resolve) {
          getPosition(self.props.params.productId).then((res) => {
            if (res.code === '000000') {
              self.setState({
                position: res.data
              });
              return resolve(res);
            } else {
              self.setState({
                isShow: false,
                showRefreshPage: true
              })
            }
          });
        }),
        new Promise(function (resolve) {
          getUserRisk().then((res) => {
            if (res.code === '000000') {
              console.log(res);
              self.setState({
                isAssess: res.data.isAssess,
                userRiskLevel: res.data.riskLevel
              });
              return resolve(res);
            } else {
              self.setState({
                isShow: false,
                showRefreshPage: true
              })
            }
          })
        }),
        new Promise(function (resolve) {
          let data = {
            ffProductId: self.props.params.productId
          };
          getDealInfo(data).then((res) => {
            if (res.code === '000000') {
              list = res.data.orderList;
              self.filterAndMerge(list);
              self.setState({
                dealInfo: res.data
              });
              return resolve(res);
            } else {
              self.setState({
                isShow: false,
                showRefreshPage: true
              })
            }
          });
        }),
        new Promise(function (resolve) {
          getProductDetail(self.props.params.productId, 'V2.0.0').then((res) => {
            if (res.code === '000000') {
              self.setState({
                productDetail: res.data
              });
              setItem('productDetail', res.data);
              return resolve(res);
            } else {
              self.setState({
                isShow: false,
                showRefreshPage: true
              })
            }
          });
        })
      ]).then(function () {
        new Promise(function (resolve) {
          getSevthYield(self.props.params.productId, '0').then((res) => {
            if (res.code === '000000') {
              let arr = getQrnhSevth(res.data.list);
              self.chartLine(arr, '0');
            } else {
              self.setState({
                isShow: false,
                showRefreshPage: true
              })
            }
          });
        })
      });
    })
  };
  // 过滤与合并 买入确认中 卖出确认中 到账中 退款到账中 四种类型的订单
  filterAndMerge(options) {
    let buyConfirmArr = [],
      sellConfirmArr = [],
      refundArr = [],
      accountArr = [],
      buyTotal = 0,
      sellTotal = 0,
      refundTotal = 0,
      accountTotal = 0;
    for (let i = 0; i < options.length; i++) {
      if (options[i].orderType == '0' && options[i].orderStatus == '20') {
        buyConfirmArr.push(options[i]);
        buyTotal += parseFloat(options[i].orderAmount);
        this.setState({
          buyConfirm: buyConfirmArr,
          buyConfirmTotal: buyTotal
        })
      } else if (options[i].orderType == '1' && options[i].orderStatus == '20') {
        sellConfirmArr.push(options[i]);
        sellTotal += parseFloat(options[i].orderAmount);
        this.setState({
          sellConfirm: sellConfirmArr,
          sellConfirmTotal: sellTotal
        })
      } else if (options[i].orderStatus == '02') {
        refundArr.push(options[i]);
        refundTotal += parseFloat(options[i].orderAmount);
        this.setState({
          refund: refundArr,
          refundTotal: refundTotal
        })
      } else if (options[i].orderStatus == '13') {
        accountArr.push(options[i]);
        accountTotal += parseFloat(options[i].orderAmount);
        this.setState({
          account: accountArr,
          accountTotal: accountTotal
        })
      }
    }
  };

  // 跳转到收益明细页
  goEarnInfo() {
    this.context.router.push({
      pathname: '/earnInfo/' + this.props.params.productId
    });
  };

  // 跳转到订单明细页
  goDealInfo() {
    this.context.router.push({
      pathname: '/dealInfo/' + this.props.params.productId
    });
  };
  // 跳转到过滤的订单明细页
  goFilterDealInfo() {
    this.context.router.push({
      pathname: '/dealInfo/' + this.props.params.productId,
      query: {
        isFilter: '1'
      }
    });
  };
  // 卖出流程
  sell() {
    this.closeTooltip();
    this.refs.keyboard.open();
  };
  // 追加买入
  buyMore() {
    let userInfo = getUserInfo();
    // 是否登录
    if (userInfo) {
      // 是否开户
      if (userInfo.userType == '2') {
        // 是否需要做风评
        if (this.state.isAssess == '1') {
          // 风险测评有效
          if (parseFloat(this.state.userRiskLevel) > parseFloat(this.state.productDetail.productRiskLevel)) {
            this.context.router.push({
              pathname: '/buy/demand-buy/' + this.props.params.productId
            })
          } else {
            this.refs.popupPage.show();
            this.setState({
              popupData: {
                title: '这款产品超过您的风险承受能力',
                content: '请确认是否继续购买',
                openText: '继续购买',
                closeText: '下次再说',
                url: '/buy/demand-buy/' + this.props.params.productId
              }
            });
          }
        } else {
          // 风险评测已失效或没做风险测评
          this.context.router.push({
            pathname: '/risk',
            query: {
              pid: this.props.params.productId,
              pname: this.state.productDetail.prdName,
              back: '/position/' + this.props.params.productId,
              timeout: this.state.isAssess == '2' ? '1' : '0',
              ptype: this.state.productDetail.productRiskLevel
            }
          });
        }
      } else {
        this.context.router.push({
          pathname: '/open/idcard',
          query: {
            back: '/position/' + this.props.params.productId
          }
        })
      }
    } else {
      this.context.router.push({
        pathname: '/login',
        query: {
          backUrl: '/position/' + this.props.params.productId
        }
      })
    };
  };
  chartLine(data, type) {
    let xList = data.xList;
    let yList = data.yList;
    let categories = xList;
    for (let i = 0; i < yList.length; i++) {
      yList[i] = parseFloat(yList[i])
    }
    let stepNum = 1;
    switch (type) {
      case '0':
        stepNum = 1;
        break;
      case '1':
        stepNum = 4;
        break;
      case '2':
        stepNum = 12;
        break;
      default:
        break;
    };
    let chart = new Highcharts.Chart('container', {// 图表初始化函数，其中 container 为图表的容器 div               
      chart: {
          type: 'area'
        },
        title: {
          text: '手指移至下方曲线上，可查看近七日年化（％）',
          style: {
            fontSize: 14,
            color: '#666',
            textAlign: 'center',
            fontWeight: '400'
          }
        },
        xAxis: {
          tickWidth: 0,
          gridLineWidth: 0,
          tickPosition: 'inside',
          labels: {
            formatter: function() {
              return categories[this.value];
            },
            style: {
              color: '#999'
            },
            step: stepNum
          },
          tickInterval: 1
        },
        yAxis: {
          title: {
            text: ''
          },
          min: 1,
          labels: {
            align: 'right',
            x: 0,
            y: -2,
            formatter: function() {
              return this.value + '.00%'
            },
            style: {
              color: '#999'
            }
          }
        },
        credits: {
          enabled: false
        },
        exporting: {
          enabled: false
        },
        legend: {
          enabled: false
        },
        tooltip: {
          backgroundColor: '#1673d0',
          borderRadius: 8,
          borderColor: '#1673d0',
          style: {
            fontSize: '14px',
            color: '#fff'
          },
          formatter: function(p) {
            console.log(this)
            return '<div class="tooltip" style="line-height:27px;">' + this.y +'<div>';
          }
        },
        plotOptions: {
          series: {
            fillOpacity: 0.3
          },
          area: {
            marker: {
              enabled: false,
              symbol: 'circle',
              radius: 2,
              states: {
                hover: {
                  enabled: true
                }
              }
            }
          }
        },
        series: [{
          data: yList,
          color: '#4990e2',
          lineWidth: 1
        }]
    });
  }
  chartLineTwo(data, type) {
    let xList = data.xList;
    let yList = data.yList;
    let categories = xList;
    for (let i = 0; i < yList.length; i++) {
      yList[i] = parseFloat(yList[i])
    }
    let stepNum = 1;
    switch (type) {
      case '0':
        stepNum = 1;
        break;
      case '1':
        stepNum = 4;
        break;
      case '2':
        stepNum = 12;
        break;
      default:
        break;
    };
    let chart = new Highcharts.Chart('container', {// 图表初始化函数，其中 container 为图表的容器 div               
      chart: {
          type: 'area'
        },
        title: {
          text: '手指移至下方曲线上，可查看万份收益（元）',
          style: {
            fontSize: 14,
            color: '#666',
            textAlign: 'center',
            fontWeight: '400'
          }
        },
        xAxis: {
          tickWidth: 0,
          gridLineWidth: 0,
          tickPosition: 'inside',
          labels: {
            formatter: function() {
              return categories[this.value];
            },
            style: {
              color: '#999'
            },
            step: stepNum
          },
          tickInterval: 1
        },
        yAxis: {
          title: {
            text: ''
          },
          min: 0,
          labels: {
            align: 'right',
            x: 0,
            y: -2,
            formatter: function() {
              return this.value
            },
            style: {
              color: '#999'
            }
          }
        },
        credits: {
          enabled: false
        },
        exporting: {
          enabled: false
        },
        legend: {
          enabled: false
        },
        tooltip: {
          backgroundColor: '#1673d0',
          borderRadius: 8,
          borderColor: '#1673d0',
          style: {
            fontSize: '14px',
            color: '#fff'
          },
          formatter: function(p) {
            console.log(this)
            return '<div class="tooltip" style="line-height:27px;">' + this.y +'<div>';
          }
        },
        plotOptions: {
          series: {
            fillOpacity: 0.3
          },
          area: {
            marker: {
              enabled: false,
              symbol: 'circle',
              radius: 2,
              states: {
                hover: {
                  enabled: true
                }
              }
            }
          }
        },
        series: [{
          data: yList,
          color: '#4990e2',
          lineWidth: 1
        }]
    });
  }
  // tab 切换七日年化
  getSevth(timePeriod, callback) {
    this.setState({
      showLoading: true
    });
    getSevthYield(this.props.params.productId, timePeriod).then((res) => {
      this.setState({
        showLoading: false
      });
      if (res.code === '000000') {
        this.setState({
          sevthYearYield: res.data
        });
        callback && callback(res)
      } else {
        this.refs.tip.open(res.msg);
      }
    });
  };
  tabOne() {
    this.setState({
      tab: 0
    });
    if (this.state.seven == 0) {
      this.getSevth('0', (res) => {
        let arr = getQrnhSevth(this.state.sevthYearYield.list);
        console.log(arr)
        this.chartLine(arr, '0');
      });
    };
    if (this.state.month == 0) {
      this.getSevth('1', (res) => {
        let arr = getQrnhSevth(this.state.sevthYearYield.list);
        console.log(arr)
        this.chartLine(arr, '1');
      });
    };
    if (this.state.year == 0) {
      this.getSevth('2', (res) => {
        let arr = getQrnhSevth(this.state.sevthYearYield.list);
        console.log(arr)
        this.chartLine(arr, '2');
      });
    };
  };
  // tab 切换年化收益
  getMillion(timePeriod, callback) {
    this.setState({
      showLoading: true
    });
    getMillionIncome(this.props.params.productId, timePeriod).then((res) => {
      this.setState({
        showLoading: false
      });
      if (res.code === '000000') {
        this.setState({
          millionIncome: res.data
        });
        callback && callback(res)
      } else {
        self.refs.tip.open(res.msg);
      }
    });
  };
  tabTwo() {
    this.setState({
      tab: 1
    });
    if (this.state.seven == 0) {
      this.getMillion('0', (res) => {
        let arr = getMillSevth(this.state.millionIncome.list);
        this.chartLineTwo(arr, '0');
      });
    };
    if (this.state.month == 0) {
      this.getMillion('1', (res) => {
        let arr = getMillSevth(this.state.millionIncome.list);
        this.chartLineTwo(arr, '1');
      });
    };
    if (this.state.year == 0) {
      this.getMillion('2', (res) => {
        let arr = getMillSevth(this.state.millionIncome.list);
        this.chartLineTwo(arr, '2');
      });
    };
  };
  // 阻止默认事件
  stopScroll(e) {
    e.preventDefault();
    e.stopPropagation();
  };
  // cancel
  cancelMoney() {
    console.log('cancel');
    this.setState({
      sellPage_show: false
    })
    this.refs.keyboard.hide();
  };
  // 输入金额
  clickFun(model) {
    let value = model.frmValue;
    this.setState({
      value: model.value,
      frmValue: model.frmValue
    });
  };
  // 去输入交易密码
  goPassword(m) {
    console.log(m)
    if (m.value == '' || m.value == '0') {
      this.refs.tip.open('卖出金额不能为空');
    } else if (parseFloat(m.value) < 0.1) {
      this.refs.tip.open('卖出金额需要大于0.1元');
    } else {
      if (parseFloat(m.value) > parseFloat(this.state.position.totalAmount)) {
        this.refs.tip.open('您最多可卖出' + this.state.position.totalAmount + '元');
      } else {
        this.refs.keyboard.close();
        this.refs.passBoard.open();
        this.setState({
          secTitle: '最多可卖出：' + this.state.position.totalAmount
        });
      }
    }
  };
  // 取消密码输入框
  cancelPass() {
    this.setState({
      needThirdTitle: false
    });
  };
  // 输入密码完成之后的回调
  showResult(p) {
    this.setState({
      showLoading: true
    });
    let data = {
      ffProductId: this.props.params.productId,
      amount: this.state.value,
      transactionType: '1',
      tranPwd: p.encodePassword
    };
    console.log(data);
    // 创建金融订单
    creatOrder(data).then((res) => {
      this.setState({
        needThirdTitle: true,
        showLoading: false
      });
      if (res.code === '000000') {
        this.context.router.push({
          pathname: '/sell-result',
          query: {
            orderAmount: res.data.orderAmount,
            orderStatusName: res.data.orderStatusName,
            productId: this.props.params.productId
          }
        });
      } else if (res.code === '200010' || res.code === '200011') {
        this.setState({
          needThirdTitle: true,
          isWarn: false,
          warnInfo: res.msg
        })
      } else {
        this.context.router.push({
          pathname: '/sell-result',
          query: {
            orderStatusName: '失败',
            productId: this.props.params.productId
          }
        });
      }
    });
  };
  // 切换7日 1月 3月 tab
  sevthTabOne() {
    this.setState({
      seven: 0,
      month: 1,
      year: 1
    });
    this.getSevth('0', (res) => {
      let arr = getQrnhSevth(this.state.sevthYearYield.list);
      console.log(arr)
      this.chartLine(arr, '0');
    });
  };
  sevthTabTwo() {
    this.setState({
      month: 0,
      seven: 1,
      year: 1
    });
    this.getSevth('1', (res) => {
      let arr = getQrnhSevth(this.state.sevthYearYield.list);
      console.log(arr)
      this.chartLine(arr, '1');
    });
  };
  sevthTabThree() {
    this.setState({
      year: 0,
      seven: 1,
      month: 1
    });
    this.getSevth('2', (res) => {
      let arr = getQrnhSevth(this.state.sevthYearYield.list);
      console.log(arr)
      this.chartLine(arr, '2');
    });
  };
  // 切换年化 7日 1月 3月 
  millionTabOne() {
    this.setState({
      seven: 0,
      month: 1,
      year: 1
    });
    this.getMillion('0', (res) => {
      let arr = getMillSevth(this.state.millionIncome.list);
      this.chartLineTwo(arr, '0');
    });
  };
  millionTabTwo() {
    this.setState({
      month: 0,
      seven: 1,
      year: 1
    });
    this.getMillion('1', (res) => {
      let arr = getMillSevth(this.state.millionIncome.list);
      this.chartLineTwo(arr, '1');
    });
  };
  millionTabThree() {
    this.setState({
      year: 0,
      seven: 1,
      month: 1
    });
    this.getMillion('2', (res) => {
      let arr = getMillSevth(this.state.millionIncome.list);
      this.chartLineTwo(arr, '2');
    });
  };
  // 点击输入金额框时显示到账日期
  inputMoney() {
    let tomorrow = '';
    getTime().then((res) => {
      if (res.code === '000000') {
        tomorrow = parseInt(res.data.timestamp);
        console.log(tomorrow);
        tomorrow = new Date(tomorrow).setDate(new Date(tomorrow).getDate() + 1);
        tomorrow = new Date(tomorrow).toLocaleDateString().replace('/', '-').replace('/', '-');
        this.setState({
          showTime: true,
          expectTime: tomorrow
        });
      } else {
        this.refs.tip.open(res.msg);
      }
    })
  };
  // tooltip关闭
  closeTooltip() {
    let childs = this.refs.chartLine.childNodes;
    if (childs && childs.length == 2) {
      childs[1].style.display = 'none';
    }
  };
  // positionPage show
  positionPage() {
    this.closeTooltip();
    this.setState({
      positionTipPage_show: true
    });
  }
  render() {
    if (this.state.dealInfo && this.state.position && this.state.productDetail) {
      let yesterdayIncome = this.state.position.dataList[0].yesterdayIncome || '',
        totalIncome = this.state.position.dataList[0].totalIncome || '';
      console.log('---------');
      return (
        <div className="v-position">
              <Toast ref="tip"></Toast>
              <Loading isShow={this.state.showLoading}></Loading>
              <div className="info">
                  <div className="title">持有资产（元）</div>
                  <div className="my-money">{this.state.position.totalAmount}</div>
              </div>
              <div className="limit-line">
                  <div className="limit-money">
                      <p className="title">昨日收益(元)</p>
                      <p className="title">{yesterdayIncome}</p>
                  </div>
                  <div className="limit-risk">
                      <p className="title">累积收益(元)</p>
                      <p className="title">{totalIncome}</p>
                  </div>
              </div>
              <Tab>
                  <NavBar className="nav" >
                    <NavBarItem active={this.state.tab == 0} onClick={() => this.tabOne()}>
                        <div>近七日年化</div>
                        <div className="yield">{this.state.productDetail.yield}%</div>
                    </NavBarItem>
                    <NavBarItem active={this.state.tab == 1} onClick={() => this.tabTwo()}>
                        <div>万份收益</div>
                        <div className="yield">{this.state.productDetail.incomeUnit}</div>
                    </NavBarItem>
                </NavBar>
                <TabBody>
                    <Article>
                        <div id="container" className="chart-body" ref="chartLine"></div>
                    </Article>
                    <div className="tab-change">
                    {
                      this.state.tab == 0 ?
                      (
                        <div className="wrap">
                        {
                          this.state.seven == 1 ?
                          (<div onClick={() => this.sevthTabOne()}>7日</div>)
                          :
                          (<div className="choosed">7日</div>)
                        }
                        {
                          this.state.month == 1 ?
                          (<div onClick={() => this.sevthTabTwo()}>1个月</div>)
                          :
                          (<div className="choosed-month">1个月</div>)
                        }
                        {
                          this.state.year == 1 ?
                          (<div onClick={() => this.sevthTabThree()}>3个月</div>)
                          :
                          (<div className="choosed-year">3个月</div>)
                        }
                        </div>
                      )
                      :
                      (
                        <div className="wrap">
                          {
                            this.state.seven == 1 ?
                            (<div onClick={() => this.millionTabOne()}>7日</div>)
                            :
                            (<div className="choosed">7日</div>)
                          }
                          {
                            this.state.month == 1 ?
                            (<div onClick={() => this.millionTabTwo()}>1个月</div>)
                            :
                            (<div className="choosed-month">1个月</div>)
                          }
                          {
                            this.state.year == 1 ?
                            (<div onClick={() => this.millionTabThree()}>3个月</div>)
                            :
                            (<div className="choosed-year">3个月</div>)
                          }
                        </div>
                      )
                    }
                    </div>
                </TabBody>
              </Tab>
              <Cells className="notice-list">
                  <Cell access onClick={ () => this.goDealInfo() }>
                      <CellBody>
                          交易明细
                      </CellBody>
                      <CellFooter/>
                  </Cell>
                  <Cell access onClick={ () => this.goEarnInfo() }>
                      <CellBody>
                          收益明细
                      </CellBody>
                      <CellFooter/>
                  </Cell>
              </Cells>
              <div className="buy-sell">
              {
                parseFloat(this.state.position.totalAmount) > 0 ?
                (
                  <div className='sell' onClick={ () => this.sell() }>
                    卖出
                  </div>
                )
                :
                (
                  <div className='sell-disable'>
                    卖出
                  </div>
                )
              }
              {
                /[256]/.test(this.state.productDetail.productStatusCode) ?
                (
                  <div className='buy-disable'>
                    {this.state.productDetail.statusName}
                  </div>
                )
                :
                (
                  <div className='buy' onClick={ () => this.buyMore() }>
                    追加买入
                  </div>
                )
              }
    
              </div>
            <PasswordBoard ref="passBoard" moreTitle={true} needSecTitle={true} needThirdTitle={this.state.needThirdTitle} warn={this.state.isWarn} encryptMethod={2} maxLength={"6"} warnInfo={this.state.warnInfo} secTitle={this.state.secTitle} callbackPayword={(p) => this.showResult(p)} cancelFun={() => this.cancelPass()} />
            <TranBoard ref="keyboard" all={this.state.position.totalAmount} showTime={this.state.showTime} expectTime={this.state.expectTime} inputMoney={() => this.inputMoney()} value={this.state.frmValue} frmSplit={3} clickFun={(m) => this.clickFun(m)} okFun={(m) => this.goPassword(m)}/>
            <Main ref="popupPage" title={this.state.popupData.title} content={this.state.popupData.content} openText={this.state.popupData.openText} closeText={this.state.popupData.closeText} url={this.state.popupData.url}></Main>
          </div>
      )
    } else {
      return (
        <div>
            <Toast ref="tip"></Toast>
            <Loading isShow={this.state.isShow}></Loading>
            <Reload showRefreshPage = {this.state.showRefreshPage}/> 
        </div>
      )
    }
  }
}

export default Position
