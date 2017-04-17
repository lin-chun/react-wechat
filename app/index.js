/** 
 * 总入口页
 * @author all
 */
import React from 'react';
import ReactDOM from 'react-dom';

import {
  Router,
  Route,
  hashHistory
} from 'react-router';

import Home from 'views/home';
// 用户中心
import Center from 'bundle-loader?lazy!views/person/center';
// 风险评测
import Risk from 'bundle-loader?lazy!views/risk';
import RiskAnswer from 'bundle-loader?lazy!views/risk/answer';
import RiskResult from 'bundle-loader?lazy!views/risk/result';
// 开户绑卡
import Open from 'bundle-loader?lazy!views/open';
import OpenIdcard from 'bundle-loader?lazy!views/open/idcard';
import OpenPass from 'bundle-loader?lazy!views/open/pass';
// 产品详情
import ProductDetail from 'bundle-loader?lazy!views/productDetail';
// 资产中心
import Property from 'bundle-loader?lazy!views/person/property';
// 注册、登录
import Login from 'bundle-loader?lazy!views/login/login';
import Inputpwd from 'bundle-loader?lazy!views/login/inputpwd';
import Register from 'bundle-loader?lazy!views/login/register';
// 找回密码
import ResetNewPassword from 'bundle-loader?lazy!views/login/resetNewPassword';
// 交易规则
import PayRule from 'bundle-loader?lazy!views/productDetail/payRule';
// 产品相关协议
import AgreementRegular from 'bundle-loader?lazy!views/productDetail/agreementRegular';
import AgreementDemand from 'bundle-loader?lazy!views/productDetail/agreementDemand';
// 买入页
import Buy from 'bundle-loader?lazy!views/buy/regularBuy';
import DemandBuy from 'bundle-loader?lazy!views/buy/demandBuy';
// 买入结果页
import buyRegularResult from 'bundle-loader?lazy!views/buy/buyRegularResult';
import buyDemandResult from 'bundle-loader?lazy!views/buy/buyDemandResult';
// 持仓页 交易明细 收益明细 订单详情
import Position from 'bundle-loader?lazy!views/position';
import EarnInfo from 'bundle-loader?lazy!views/position/earnInfo';
import DealInfo from 'bundle-loader?lazy!views/position/dealInfo';
import OrderDetail from 'bundle-loader?lazy!views/position/orderDetail';
// 活期卖出结果页
import Sell from 'bundle-loader?lazy!views/position/sell'
// 收银台
import Cashier from 'bundle-loader?lazy!views/cashier/cashier';

// 如果不使用 bundle-loader 则需要按照这种方式配置
// const DemoSecond = (location, cb) => {
//   require.ensure([], require => {
//     cb(null, require('views/demo/second').default)
//   });
// };

// WebTrends 使用了不标准的属性名：otitle/otype，react会过滤掉
// 此处把otitle/otype设为合法的属性名(注：可能后面接口会改)
import ReactInjection from "react-dom/lib/ReactInjection";
ReactInjection.DOMProperty.injectDOMPropertyConfig({
  Properties: {
    otitle: 0,
    otype: 0,
    key: 0
  }
});

// 懒加载
function lazyLoadComponent(lazyModule) {
  return (location, cb) => {
    lazyModule(module => cb(null, module.default));
  };
};

// router entry
class App extends React.Component {
  render() {
    document.title = this.props.children.props.route.title || '';
    return (
      <div>
        {this.props.children}
      </div>
    );
  };
};
// 路由配置
ReactDOM.render(
  <Router history={hashHistory}>
    <Route component={App} >
      <Route path="/" component={Home} title="项目名称" />
      <Route path="/index" component={Home} title="项目名称" />
      <Route path='/center' getComponent={lazyLoadComponent(Center)} title="个人中心" />
      {/* /risk* query { back: 完成后跳转到的地址 } , 其他参数参考 risk/index.js 注释 */}
      <Route path="/risk" getComponent={lazyLoadComponent(Risk)} title="风险评测" />
      <Route path="/risk/answer" getComponent={lazyLoadComponent(RiskAnswer)} title="风险评测" />
      <Route path="/risk/result" getComponent={lazyLoadComponent(RiskResult)} title="风险评测结果" />
      {/* /open* query { back: 完成后跳转到的地址 } */}
      <Route path="/open" getComponent={lazyLoadComponent(Open)} title="开户" />
      <Route path="/open/idcard" getComponent={lazyLoadComponent(OpenIdcard)} title="身份验证" />
      <Route path="/open/pass" getComponent={lazyLoadComponent(OpenPass)} title="" />
      <Route path='/property' getComponent={lazyLoadComponent(Property)} title="资产中心" />
      <Route path='/login' getComponent={lazyLoadComponent(Login)} title="验证手机号" />
      <Route path='/inputpwd' getComponent={lazyLoadComponent(Inputpwd)} title="登录" />
      <Route path='/register' getComponent={lazyLoadComponent(Register)} title="设置登录密码" />
      <Route path='/resetNewPassword' getComponent={lazyLoadComponent(ResetNewPassword)} title="设置一个新密码" />
      <Route path='/product/detail/:productId' getComponent={lazyLoadComponent(ProductDetail)} title="产品详情" />
      <Route path='/product/pay-rule' getComponent={lazyLoadComponent(PayRule)} title="交易规则" />
      <Route path='/agreement-regular/:productId' getComponent={lazyLoadComponent(AgreementRegular)} title="产品相关协议" />
      <Route path='/agreement-demand/:productId' getComponent={lazyLoadComponent(AgreementDemand)} title="活产品相关协议" />
      <Route path='/buy/regular-buy/:productId' getComponent={lazyLoadComponent(Buy)} title="买入" />
      <Route path='/buy/demand-buy/:productId' getComponent={lazyLoadComponent(DemandBuy)} title="买入" />
      <Route path='/buy/regular-result' getComponent={lazyLoadComponent(buyRegularResult)} title="买入结果页" />
      <Route path='/buy/demand-result' getComponent={lazyLoadComponent(buyDemandResult)} title="买入结果页" />
      <Route path='/sell-result' getComponent={lazyLoadComponent(Sell)} title="卖出结果页" />
      <Route path='/earnInfo/:productId' getComponent={lazyLoadComponent(EarnInfo)} title="收益明细" />
      <Route path='/dealInfo/:productId' getComponent={lazyLoadComponent(DealInfo)} title="交易明细" />
      <Route path='/position/:productId' getComponent={lazyLoadComponent(Position)} title="持有页" />
      <Route path='/orderDetail' getComponent={lazyLoadComponent(OrderDetail)} title="交易明细" />
      <Route path='/cashier' getComponent={lazyLoadComponent(Cashier)} title="收银台" />
    </Route>
  </Router>,
  document.getElementById('root')
);
