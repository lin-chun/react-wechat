import './index.scss';
import React from 'react';
import {
  list
} from './datas';

// 银行卡列表
export default class BankListList extends React.Component {
  constructor(props) {
    super(props);
  };

  getList() {
    let doms = [];
    for (let key in list) {
      let model = list[key];
      if (key == '00286') {
        continue;
      }
      doms.push(
        <div key={key}>
          <div className="title">{model[0]}</div>
          <div className="mess">{model[1]}</div>
        </div>
      );
    }
    return doms;
  };

  render() {
    let html = this.getList();
    return (
      <div className="content">{html}</div>
    );
  };
};
