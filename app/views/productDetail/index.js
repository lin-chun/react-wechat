import React from 'react';
import {
  getProductDetail,
  getPosition,
  getTime,
  getSevthYield,
  getMillionIncome,
  getUserRisk,
  checkLoginState
} from 'api';
import Loading from 'component/Loading';
import Dialog from 'component/Dialog';
import Demand from 'component/DemandFinancing';
import Regular from 'component/RegularFinancing';
import Main from 'component/PopupBottom/popupBottom';
import WeUI from 'react-weui';
import {
  setItem,
  getItem,
  getUserInfo
} from 'business/Cache';
import { init } from 'api/security';
import Toast from 'component/Toast';
import Reload from 'component/RequestFailShow';
import { getMillSevth, getQrnhSevth, usualSevth } from 'business/handleEchart';

const {
  Tab,
  TabBody,
  NavBar,
  NavBarItem,
  Article,
  Cells,
  Cell,
  CellBody,
  CellFooter
} = WeUI;

class ProductDetail extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      userInfo: null,
      tipsText: '',
      display: false,
      tab: 0,
      // 产品风险等级
      riskLevel: '',
      // 是否评估过
      isAssess: '',
      // 用户风险等级
      userRiskLevel: '',
      productDetail: null,
      position: null,
      sevthYearYield: null,
      millionIncome: null,
      // 时间 
      time: '',
      // 下拉弹窗传入对象
      popupData: {
        title: '',
        content: '',
        openText: '',
        closeText: '',
        url: ''
      },
      sevthData: {
        xList: null,
        yList: null
      },
      showLoading: false,
      totalAmount: '',
      isShow: true,
      showRefreshPage: false
    }
  };

  // 风险等级转换
  riskLevelData(riskLevel) {
    const data = {
      '1': '极低',
      '2': '低',
      '3': '较低',
      '4': '中等',
      '5': '较高',
      '6': '高'
    }
    return data[riskLevel]
  };

  componentWillMount() {
    console.log(this.props);
    let productId = this.props.params.productId;
    if (productId == '381CEF5E940D0242E053C081140A55CA') {
      document.title = '富盈5号';
    } else {
      document.title = '富盈7号';
    }
    init().then(() => {
      getProductDetail(productId, 'V2.0.0').then((res) => {
        if (res.code === '000000') {
          console.log(res);
          this.setState({
            riskLevel: this.riskLevelData(res.data.productRiskLevel),
            productDetail: res.data
          }, () => {
            this.getSevth('0', (res) => {
              let arr = getQrnhSevth(res.data.list);
              this.refs.chart.chartLine(arr, '0');
            });
          });
          setItem('productDetail', res.data);
        } else {
          this.setState({
            isShow: false,
            showRefreshPage: true
          })
        }
      });
      //判断是否登录
      checkLoginState().then((res) => {
        console.log(res)
        if(res==-1){  //网络请求出错或其它错误

        }else if(res==0){  //未登录
          if (!!getItem('userInfo')) { //有缓存

          } else {

          }
        }else{  //res=1，已登录
          if(!getItem('userInfo')){  //没有缓存

          }else{
            let userInfo = getUserInfo();
            this.setState({
              userInfo: userInfo
            });
            getPosition(productId).then((res) => {
              if (res.code === '000000') {
                console.log(res);
                this.setState({
                  position: res.data,
                  totalAmount: res.data.totalAmount
                })
              } else {
                this.setState({
                  isShow: false,
                  showRefreshPage: true
                })
              }
            });
            getUserRisk().then((res) => {
              if (res.code === '000000') {
                console.log(res);
                this.setState({
                  isAssess: res.data.isAssess,
                  userRiskLevel: res.data.riskLevel
                });
              } else {
                this.setState({
                  isShow: false,
                  showRefreshPage: true
                })
              }
            })
          }
        }
      });
      getTime().then((res) => {
        if (res.code === '000000') {
          this.setState({
            time: res.data
          });
        } else {
          this.setState({
            isShow: false,
            showRefreshPage: true
          })
        }
      });
    }) 
  };
  componentDidMount(preProps, preState) {
    document.body.scrollTop = 0;
  };
  // 计算年龄
  computeAge(nowTime, startDate) {
    startDate = new Date(startDate);
    var newDate = nowTime - startDate.getTime();
    // 向下取整  例如 10岁 20天 会计算成 10岁
    // 如果要向上取整 计算成11岁，把floor替换成 ceil
    return Math.floor(newDate / 1000 / 60 / 60 / 24 / 365);
  };
  // 点击购买富盈7号,需要先验证是否登录－开户－年龄限制－是否需要做风评
  checkConditionRegular() {
    this.refs.chart.closeTooltip();
    let userInfo = this.state.userInfo;
    // 是否登录
    if (userInfo !== null) {
        let myTime = this.state.time.timestamp,
        minBuyAge = this.state.productDetail.payAgeLower,
        maxBuyAge = this.state.productDetail.maxBuyAge,
        age = this.computeAge(myTime, userInfo.birthDate);
      // 是否开户
      if (userInfo.userType == '2') {
        // 年龄限制
        if (age < minBuyAge) {
          this.refs.tip.open('买入次产品的最低年龄是' + minBuyAge);
        } else if (age > maxBuyAge) {
          this.refs.tip.open('买入次产品的最高年龄是' + maxBuyAge);
        } else {
          // 是否需要做风评
          if (this.state.isAssess == '1') {
            // 风险测评有效
            if (parseInt(this.state.userRiskLevel) > parseInt(this.state.productDetail.productRiskLevel)) {
              this.context.router.push({
                pathname: '/buy/regular-buy/' + this.props.params.productId
              })
            } else {
              // 风险等级高于用户风险测评等级，具体使用abc哪种方案，待确认
              this.refs.popupPage.show();
              this.setState({
                popupData: {
                  title: '这款产品超过您的风险承受能力',
                  content: '请确认是否继续购买',
                  openText: '继续购买',
                  closeText: '下次再说',
                  url: '/buy/regular-buy/' + this.props.params.productId
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
                back: '/product/detail/' + this.props.params.productId,
                timeout: this.state.isAssess == '2' ? '1' : '0'
              }
            });
          }
        }
      } else {
        this.context.router.push({
          pathname: '/open/idcard',
          query: {
            back: '/product/detail/' + this.props.params.productId
          }
        })
      }
    } else {
      this.context.router.push({
        pathname: '/login',
        query: {
          backUrl: '/product/detail/' + this.props.params.productId
        }
      })
    };
  };
  // 点击购买富盈5号
  checkConditionDemand() {
    console.log('购买富盈5号');
    this.refs.chart.closeTooltip();
    // 是否登录
    let userInfo = this.state.userInfo;
    if (userInfo !== null) {
      // 是否开户
      if (userInfo.userType == '2') {
        // 是否需要做风评
        if (this.state.isAssess == '1') {
          // 风险测评有效
          if (parseInt(this.state.userRiskLevel) > parseInt(this.state.productDetail.productRiskLevel)) {
            this.context.router.push({
              pathname: '/buy/demand-buy/' + this.props.params.productId
            });
          } else {
            // 风险等级高于用户风险测评等级，具体使用abc哪种方案，待确认
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
              back: '/product/detail/' + this.props.params.productId,
              timeout: this.state.isAssess == '2' ? '1' : '0',
              ptype: this.state.productDetail.productRiskLevel
            }
          });
        }
      } else {
        this.context.router.push({
          pathname: '/open/idcard',
          query: {
            back: '/product/detail/' + this.props.params.productId
          }
        })
      }
    } else {
      this.context.router.push({
        pathname: '/login',
        query: {
          backUrl: '/product/detail/' + this.props.params.productId
        }
      })
    };
  };
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
  reChangeOne() {
    this.refs.chart.clickTabOne();
    let arr = usualSevth(this.state.sevthYearYield.list);
    this.refs.chart.chartLine(arr);
  };
  changeOne() {
    let self = this;
    self.refs.chart.clickTabOne();
    switch(this.refs.chart.judgeState()) {
      case 'seven':
        self.getSevth('0', function(res) {
          let arr = getQrnhSevth(self.state.sevthYearYield.list);
          console.log(arr)
          self.refs.chart.chartLine(arr, '0');
        });
        break;
      case 'month':
        self.getSevth('1', function(res) {
          let arr = getQrnhSevth(self.state.sevthYearYield.list);
          console.log(arr)
          self.refs.chart.chartLine(arr, '1');
        });
        break;
      case 'year':
        self.getSevth('2', function(res) {
          let arr = getQrnhSevth(self.state.sevthYearYield.list);
          console.log(arr)
          self.refs.chart.chartLine(arr, '2');
        });
        break;
    };
  };
  // nav 切换年化收益
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
        this.refs.tip.open(res.msg);
      }
    });
  };
  reChangeTwo() {
    this.refs.chart.clickTabTwo();
    this.getMillion('0', (res) => {
      let arr = getMillSevth(this.state.millionIncome.list);
      this.refs.chart.chartLineTwo(arr);
    });
  };
  changeTwo() {
    let self = this;
    self.refs.chart.clickTabTwo();
    switch(this.refs.chart.judgeState()) {
      case 'seven':
        self.getMillion('0', function(res) {
          let arr = getMillSevth(self.state.millionIncome.list);
          self.refs.chart.chartLineTwo(arr, '0');
        });
        break;
      case 'month':
        self.getMillion('1', function(res) {
          let arr = getMillSevth(self.state.millionIncome.list);
          self.refs.chart.chartLineTwo(arr, '1');
        });
        break;
      case 'year':
        self.getMillion('2', function(res) {
          let arr = getMillSevth(self.state.millionIncome.list);
          self.refs.chart.chartLineTwo(arr, '2');
        });
        break;
    };
  };
  // 切换7日 1月 3月 tab
  sevthTabOne() {
    this.refs.chart.clickSeven();
    this.getSevth('0', (res) => {
      let arr = getQrnhSevth(this.state.sevthYearYield.list);
      this.refs.chart.chartLine(arr, '0');
    });
  };
  sevthTabTwo() {
    this.refs.chart.clickMonth();
    this.getSevth('1', (res) => {
      let arr = getQrnhSevth(this.state.sevthYearYield.list);
      console.log(arr)
      this.refs.chart.chartLine(arr, '1');
    });
  };
  sevthTabThree() {
    this.refs.chart.clickYear();
    this.getSevth('2', (res) => {
      let arr = getQrnhSevth(this.state.sevthYearYield.list);
      console.log(arr)
      this.refs.chart.chartLine(arr, '2');
    });
  };
  // 切换万分收益 1月 3月 tab
  millionTabOne() {
    this.refs.chart.clickSeven();
    this.getMillion('0', (res) => {
      let arr = getMillSevth(this.state.millionIncome.list);
      this.refs.chart.chartLineTwo(arr, '0');
    });
  };
  millionTabTwo() {
    this.refs.chart.clickMonth();
    this.getMillion('1', (res) => {
      let arr = getMillSevth(this.state.millionIncome.list);
      this.refs.chart.chartLineTwo(arr, '1');
    });
  };
  millionTabThree() {
    this.refs.chart.clickYear();
    this.getMillion('2', (res) => {
      let arr = getMillSevth(this.state.millionIncome.list);
      this.refs.chart.chartLineTwo(arr, '2');
    });
  };
  // 跳转到产品持有页
  goPosition() {
    this.context.router.push({
      pathname: '/position/' + this.props.params.productId
    });
  };
  // 定期跳转相关协议
  goAgreement() {
    this.context.router.push({
      pathname: '/agreement-regular/' + this.props.params.productId
    });
  };
  // 活期跳转相关协议
  goDemandAgreement() {
    this.context.router.push({
      pathname: '/agreement-demand/' + this.props.params.productId
    });
  };
  // 定期跳转交易规则
  goPayRule() {
    this.context.router.push('/product/pay-rule');
  };
  render() {
    if (this.state.productDetail && this.state.sevthYearYield) {
      let detail = this.state.productDetail;
      let mark = detail.prdTips;
      let markArr = mark.split(",");
      let isBuyMore = false;
      let issueUrl = '';
      let onOfThreeTitle = '';
      let onOfThreeCont = '';
      // 获取富盈7号各种协议
      if (detail.productId == '10027280') {
        for (let i = 0; i < detail.annexationList.length; i++) {
          if (detail.annexationList[i].annexationInfoName == '产品相关协议') {
            for (let j = 0; j < detail.annexationList[i].list.length; j++) {
              if (detail.annexationList[i].list[j].annexationInfoName == '常见问题') {
                issueUrl = detail.annexationList[i].list[j].annexationInfo;
              }
            }
          }
        };
      };
      // 获取富盈5号各种协议
      if (detail.productId == '10000400') {
        for (let i = 0; i < detail.annexationList.length; i++) {
          if (detail.annexationList[i].annexationKey == 'disclaimer') {
            onOfThreeTitle = detail.annexationList[i].annexationInfoName;
            onOfThreeCont = detail.annexationList[i].annexationInfo;
          };
          if (detail.annexationList[i].annexationKey == 'faq') {
            issueUrl = detail.annexationList[i].annexationInfo;
          }
        };
      };
      if (this.state.position !== null && parseFloat(this.state.position.totalAmount) > 0) {
        isBuyMore = true;
      } else {
        isBuyMore = false;
      };
      return (
        <div>
            <Toast ref="tip"></Toast>
            <Loading isShow={ this.state.showLoading }></Loading>
            {   detail.productId == '10027280' ?
                (
                    <Regular ref="chart" myYield={detail.yield}
                        markArrOne={markArr[0]}
                        markArrTwo={markArr[1]}
                        state={detail.statusName}
                        investmentAmount={detail.investmentAmount}
                        incomeUnit={detail.incomeUnit}
                        payRule={() => this.goPayRule()}
                        renewPeriod={detail.renewPeriod}
                        productRiskLevel={this.state.riskLevel}
                        isOff={detail.productStatusCode}
                        buyMore={isBuyMore}
                        position={this.state.totalAmount}
                        cumulativeRule={detail.cumulativeRule}
                        renewPeriodDesc={detail.renewPeriodDesc}
                        incomeRateTypeDesc={detail.incomeRateTypeDesc}
                        redeemRule={detail.redeemRule}
                        prdName={detail.prdName}
                        issueCompany={detail.productPublishSide}
                        tabOne={() => this.reChangeOne()}
                        tabTwo={() => this.reChangeTwo()}
                        agreement={() => this.goAgreement()}
                        buy={() => this.checkConditionRegular()}/>
                )
                :
                (
                    <Demand ref="chart" myYield={detail.yield}
                        markArrOne={markArr[0]}
                        markArrTwo={markArr[1]}
                        state={detail.statusName}
                        investmentAmount={detail.pfirstAmt}
                        incomeUnit={detail.incomeUnit}
                        renewPeriod={detail.renewPeriod}
                        productRiskLevel={this.state.riskLevel}
                        isOff={detail.productStatusCode}
                        buyMore={isBuyMore}
                        productIntroduce={detail.productIntroduce}
                        investDirect={detail.investDirect}
                        distributionWay={detail.distributionWay}
                        incomeType={detail.incomeType}
                        incomeInstruction={detail.incomeInstruction}
                        redeemRule={detail.redeemRule}
                        tabOne={() => this.changeOne()}
                        tabTwo={() => this.changeTwo()}
                        agreement={() => this.goDemandAgreement()}
                        issue={issueUrl}
                        position={this.state.totalAmount}
                        goPosition={() => this.goPosition()}
                        onOfThreeTitle={onOfThreeTitle}
                        onOfThreeCont={onOfThreeCont}
                        sevthTabOne={() => this.sevthTabOne()}
                        sevthTabTwo={() => this.sevthTabTwo()}
                        sevthTabThree={() => this.sevthTabThree()}
                        millionTabOne={() => this.millionTabOne()}
                        millionTabTwo={() => this.millionTabTwo()}
                        millionTabThree={() => this.millionTabThree()}
                        buy={() => this.checkConditionDemand()}/>
                )
            }
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
  };
};

export default ProductDetail;
