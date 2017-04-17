import React from 'react';
import 'css/property.scss';

// 埋点
import {wtProperty} from 'business/webtrends';

export default class Propertynoaccount extends React.Component {
  render() {
    return (
      <div className="v-property without-property">
        <header className="header">
          <img alt="个人中心" className="flex head" src={this.props.headImg} onClick={this.props.goCenter} otype='button' otitle={wtProperty[1]} />
          <div className="open-account">
            <strong className="title">极速开户</strong>
            <div>
              <span className="tip1">三步搞定</span>
              <span>轻松开户</span>
            </div>
            <a href="#/open/idcard" className="btn" otype='button' otitle={wtProperty[2]}>立即开户</a>
          </div>
        </header>
        <img className="banner" src={this.props.banner} otype='button' otitle={wtProperty[6]} />
        <section className="style-wrap">
          <div className="no-acc-left">
            <div className="no-acc-title">富盈5号，马上购买</div>
            <p className="no-acc-disc">理财产品</p>
          </div>
          <a href="#/product/detail/381CEF5E940D0242E053C081140A55CA" className="go-btn" otype='button' otitle={wtProperty[5]}>买理财</a>
        </section>
      </div>
    );
  };
};
