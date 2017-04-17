import React from 'react';
import {
  getItem
} from 'business/Cache';
import Toast from 'component/Toast';
import Loading from 'component/Loading';
import RequestFailShow from 'component/RequestFailShow';
import {
  queryAsset,
  checkLoginState
} from 'api';
import {
  init
} from 'api/security';

// 埋点
import {
  wtProperty
} from 'business/webtrends';

import PropertyWithoutAccount from './propertynoaccount';
import HeadImg from 'images/property/head.png';
import Banner from 'images/property/banner.png';

// 没有理财产品和亿超市产品
class NoFinancialAndMarket extends React.Component {
  render() {
    return (
      <div>
        <section className='property-wrap no-account-wrap'>
          <div className='pflex style-flex'>
            <h1 className='property-style'>理财<span className='unit'>(元)</span></h1>
            <div className='each-money'>0.00</div>
          </div>
          <div className='each-profit'>
              <span className='each-profit-first'>昨日收益：<em className='num'>+0.00</em></span>
              <span>累计收益：<em className='num'>+0.00</em></span>
            </div>
        </section>
        <section className='property-wrap no-account-wrap'>
          <div className='pflex style-flex'>
            <h1 className='property-style'>金融亿超市<span className='unit'>(元)</span></h1>
            <div className='each-money'>0.00</div>
          </div>
          <div className='each-profit'>
            <span className='each-profit-first'>昨日收益：<em className='num'>+0.00</em></span>
            <span>累计收益：<em className='num'>+0.00</em></span>
          </div>
        </section>
      </div>
    );
  };
};

//无基金
class NoFund extends React.Component {
  render() {
    return (
      <section className='property-wrap no-account-wrap'>
        <div className='pflex style-flex'>
          <h1 className='property-style'>基金<span className='unit'>(元)</span></h1>
          <div className='each-money'>0.00</div>
        </div>
        <div className='each-profit'>
          <span className='each-profit-first'>昨日收益：<em className='num'>+0.00</em></span>
          <span>累计收益：<em className='num'>+0.00</em></span>
        </div>
      </section>
    );
  };
};

//理财产品-有资产
class FinancialAndMarket extends React.Component {
  render() {
    let financeList = this.props.financeList,
      marketList = this.props.marketList,
      financeCurrentList,
      financeFixedList,
      marketCurrentList,
      marketFixedList;

    financeCurrentList = financeList.currentList && financeList.currentList.map((item) => { //投资理财活期
      let yesterdayIncome = item.yesterdayIncome >= 0 ? `+${item.yesterdayIncome}` : item.yesterdayIncome,
        totalIncome = item.totalIncome >= 0 ? `+${item.totalIncome}` : item.totalIncome;
      return (
        <div onClick={()=>location.hash=`#/position/${item.ffProductId}`} otype='button' otitle={wtProperty[7]}>
          <div className='pflex style-flex'>
            <div className='style-name'>{item.productName}</div>
            <div className='each-money'>{item.possessionAsset}</div>
          </div>
          <div className='each-profit financial-line'>
              <span className='each-profit-first'>昨日收益：<em className='num'>{yesterdayIncome}</em></span>
              <span>累计收益：<em className='num'>{totalIncome}</em></span>
          </div>
        </div>
      );
    });
    financeFixedList = financeList.fixedList && financeList.fixedList.map((item) => { //投资理财定期
      let dateIncomeEnd = item.dateIncomeEnd.split(' ')[0];
      return (
        <div>
          <div className='pflex style-flex'>
          <div className='style-name'>{item.productName}</div>
          <div className='each-money'>{item.possessionAsset}</div>
        </div>
        <div className='each-profit financial-line txt-left'>{dateIncomeEnd}到期</div>
        </div>
      );
    });
    marketCurrentList = marketList.currentList && marketList.currentList.map((item) => { //金融亿超市活期
      let yesterdayIncome = item.yesterdayIncome >= 0 ? `+${item.yesterdayIncome}` : item.yesterdayIncome,
        totalIncome = item.totalIncome >= 0 ? `+${item.totalIncome}` : item.totalIncome;
      return (
        <div onClick={()=>location.hash=`#/position/${item.ffProductId}`} otype='button' otitle={wtProperty[8]}>
          <div className='pflex style-flex'>
          <div>
            <span className='style-name'>{item.productName}</span>
            <span className='style-flag'>亿超市</span>
          </div>
          <div className='each-money'>{item.possessionAsset}</div>
        </div>
        <div className='each-profit'>
            <span className='each-profit-first'>昨日收益：<em className='num'>{yesterdayIncome}</em></span>
            <span>累计收益：<em className='num'>{totalIncome}</em></span>
        </div>
        </div>
      );
    });
    marketFixedList = marketList.fixedList && marketList.fixedList.map((item) => { //金融亿超市定期
      let dateIncomeEnd = item.dateIncomeEnd.split(' ')[0];
      return (
        <div>
          <div className='pflex style-flex'>
          <div>
            <span className='style-name' style={{display:`inline-block`}}>{item.productName}</span>
            <span className='style-flag'>亿超市</span>
          </div>
          <div className='each-money'>{item.possessionAsset}</div>
        </div>
        <div className='each-profit txt-left'>{dateIncomeEnd}到期</div>
        </div>
      );
    });
    return (
      <section className='property-wrap with-account'>
        <h1 className='property-style'>理财<span className='unit'>(元)</span></h1>
        {financeCurrentList}
        {financeFixedList}
        {marketCurrentList}
        {marketFixedList}
      </section>
    );
  };
};

//有基金
class Fund extends React.Component {
  render() {
    let fundList = this.props.fundList,
      fundCurrentList,
      fundFixedList;
    fundCurrentList = fundList.currentList && fundList.currentList.map((item) => { //基金活期
      let yesterdayIncome = item.yesterdayIncome >= 0 ? `+${item.yesterdayIncome}` : item.yesterdayIncome,
        totalIncome = item.totalIncome >= 0 ? `+${item.totalIncome}` : item.totalIncome;
      return (
        <div onClick={()=>location.hash=`#/position/${item.ffProductId}`} otype='button' otitle={wtProperty[9]}>
          <div className='pflex style-flex'>
            <div className='style-name'>{item.productName}</div>
            <div className='each-money'>{item.possessionAsset}</div>
          </div>
          <div className='each-profit pflex'>
            <div className='txt-left flex'>{item.productCode}</div>
            <div>
              <span className='each-profit-first'>昨日收益：<em className='num'>{yesterdayIncome}</em></span>
              <span>累计收益：<em className='num'>{totalIncome}</em></span>
            </div>
          </div>
        </div>
      );
    });
    fundFixedList = fundList.fixedList && fundList.fixedList.map((item) => { //基金定期
      let dateIncomeEnd = item.dateIncomeEnd.split(' ')[0];
      return (
        <div>
          <div className='pflex style-flex'>
            <div className='style-name'>{item.productName}</div>
            <div className='each-money'>{item.possessionAsset}</div>
          </div>
          <div className='each-profit txt-left'>{dateIncomeEnd}到期</div>
        </div>
      );
    });
    return (
      <section className='property-wrap with-account'>
        <h1 className='property-style'>基金<span className='unit'>(元)</span></h1>
        {fundCurrentList}
        {fundFixedList}
      </section>
    );
  };
};

//总资产解释说明
class TotalPropertyExplain extends React.Component {
  isShowOrHidden() {
    this.props.isShow(false);
  };
  render() {
    return (
      <div className='property-mask' onClick={()=>this.isShowOrHidden()} style={{display:this.props.showPropertyExplain?`block`:`none`}}>
        <h1 className='p-mask-title' ref='totalTitle'>总资产介绍</h1>
        <p className='p-mask-explain' ref='explainContent'>总资产＝电子账户余额+理财总资产</p>
        <button className='p-mask-btn'>知道了</button>
      </div>
    );
  }
};

export default class Property extends React.Component {
  constructor(props) {
    super(props);
    let userInfo = getItem('userInfo'),
      userType = !!userInfo ? userInfo.userType : -1;

    this.state = {
      userInfo: userInfo,
      userType: userType,
      requestCount: 1, //初始化时需要请求的接口数
      totalPossessionAsset: '0.00', //总资产
      currentTotalIncome: '0.00', //总的累计收益
      currentYesterdayTotalIncome: '0.00', //总的昨日收益
      showPropertyExplain: false, //是否显示总资产解释浮层
      financeList: [], //投资理财
      marketList: [], //金融亿超市
      fundList: [] //基金
    };
  };

  componentWillMount() {
    let self = this,
      {
        userInfo,
        userType
      } = self.state,
      financialOptions = {
        'categoryNo': '120' //投资理财
      },
      fundOptions = {
        'categoryNo': '110' //基金
      },
      marketOptions = {
        'categoryNo': '220', //金融亿超市
        'winChnlId': '1131'
      };

    checkLoginState().then((res) => {
      if (res == -1) {
        self.setState({
          requestCount: -1
        });
      } else if (res == 0) {
        location.hash = '#/login?backUrl=/property';
      } else { //已登录
        if (userType == -1) {
          location.hash = '#/login?backUrl=/property';
        } else if (userType == 0) {
          self.setState({
            requestCount: 0
          });
        } else {
          init().then(() => {
            //请求投资理财
            self.requestForData(financialOptions, 'financeList');
            //以下两个目前不做2017-04-05,requestCount也要一并修改
            //请求基金
            // self.requestForData(fundOptions, 'fundList');
            //请求金融亿超市
            // self.requestForData(marketOptions, 'marketList');
          });
        };
      };
    });
  };

  //请求接口公共方法
  requestForData(opt, type) { //资产相关数据后期可优化到div中的三元表达式上
    let self = this;
    queryAsset(opt).then(function (res) {
      let {
        requestCount,
        totalPossessionAsset,
        currentTotalIncome,
        currentYesterdayTotalIncome
      } = self.state;
      if (res.code == '000000') {
        let assetList = res.data && res.data.assetList,
          financeList = assetList && assetList.financeList, //投资理财
          eaccountList = assetList && assetList.eaccountList, //电子账户
          availableAmount = eaccountList ? +eaccountList.availableAmount : 0, //电子账户余额
          totalAsset = availableAmount + (+totalPossessionAsset) + (+financeList.totalPossessionAsset);
        self.setState({
          requestCount: requestCount - 1,
          totalPossessionAsset: totalAsset.toFixed(2),
          currentTotalIncome: (+currentTotalIncome + (+financeList.currentTotalIncome)).toFixed(2), //累计总收益
          currentYesterdayTotalIncome: (+financeList.currentYesterdayTotalIncome + (+currentYesterdayTotalIncome)).toFixed(2), //昨日收益 
          [type]: financeList
        });
      } else {
        self.setState({
          requestCount: -1
        });
      };
    });
  };

  showOrHiddenPropertyExplain(m) {
    this.setState({
      showPropertyExplain: m
    });
  };

  //跳转到个人中心
  goCenter() {
    location.hash = `/center`;
  };

  render() {
    if (this.state.requestCount > 0) {
      return (
        <Loading isShow='true' />
      );
    } else if (this.state.requestCount === -1) {
      return (
        <RequestFailShow showRefreshPage='true'/>
      )
    } else {
      if (this.state.userType == 0) {
        return (
          <PropertyWithoutAccount headImg={HeadImg} banner={Banner} goCenter={this.goCenter} />
        );
      } else if (this.state.userType == 2) {
        let financialDOM,
          marketDOM,
          fundDOM;
        return (
          <div className='v-property'>
            <header className='header'>
              <img alt='个人中心' className='flex head' src={HeadImg} onClick={()=>this.goCenter()} otype='button' otitle={wtProperty[1]} />
              <div className='no-property'>
                <strong className='total-money'>{this.state.totalPossessionAsset}</strong>
                <div className='total-property'><span className='explain-icon' onClick={()=>this.showOrHiddenPropertyExplain(true)} otype='button' otitle={wtProperty[3]}></span>总资产(元)</div>
                <div className='all-profit'>
                  <span className='all-profit-first'>昨日收益：{+this.state.currentYesterdayTotalIncome>=0?'+'+this.state.currentYesterdayTotalIncome:'-'+this.state.currentYesterdayTotalIncome}</span>
                  <span>累计收益：{+this.state.currentTotalIncome>=0?'+'+this.state.currentTotalIncome:'-'+this.state.currentYesterdayTotalIncome}</span>
                </div>
              </div>
            </header>
            <img className='banner' src={Banner} otype='button' otitle={wtProperty[6]} />
            {
              ((this.state.financeList.currentList && this.state.financeList.currentList.length>0) || (this.state.financeList.fixedList && this.state.financeList.fixedList.length>0) || (this.state.marketList.currentList && this.state.marketList.currentList.length>0) || (this.state.marketList.fixedList && this.state.marketList.fixedList.length>0))
              ?
              <FinancialAndMarket financeList={this.state.financeList} marketList={this.state.marketList} />
              :
              <NoFinancialAndMarket />
            }
            {
              (this.state.financeList && this.state.financeList.fundList)
              ?
              <Fund fundList={this.state.fundList} />
              :
              <NoFund />
            }
            <TotalPropertyExplain isShow={(m)=>this.showOrHiddenPropertyExplain(m)} showPropertyExplain={this.state.showPropertyExplain} />
            <Toast ref='toast' /> 
          </div>
        );
      } else {
        return (
          <RequestFailShow showRefreshPage='true'/>
        );
      }
    }
  };
};
