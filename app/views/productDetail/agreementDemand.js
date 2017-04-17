/**
 * 定期理财买入协议
 */
import React from 'react';
import 'css/agreement/agreementRegular.scss'
import WeUI from 'react-weui';
import {
  getItem
} from 'business/Cache';
const {
  CellBody,
  Cells,
  Cell,
  CellFooter
} = WeUI;

class Agreement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contract: '',
      notice: '',
      risk: '',
      declar: ''
    }
  };
  componentWillMount() {
    let detail = getItem('productDetail');
      // 获取各种协议
    for (let i = 0; i < detail.annexationList.length; i++) {
      if (detail.annexationList[i].annexationInfoName == '产品相关协议') {
        for (let j = 0; j < detail.annexationList[i].list.length; j++) {
          if (detail.annexationList[i].list[j].annexationKey == 'assetsPact') {
            this.setState({
              contract: detail.annexationList[i].list[j].annexationInfo
            });
          };
          if (detail.annexationList[i].list[j].annexationInfoName == '募集公告') {
            this.setState({
              notice: detail.annexationList[i].list[j].annexationInfo
            });
          };
          if (detail.annexationList[i].list[j].annexationKey == 'productAnnounce') {
            this.setState({
              risk: detail.annexationList[i].list[j].annexationInfo
            });
          };
          if (detail.annexationList[i].list[j].annexationInfoName == '委托人申明书') {
            this.setState({
              declar: detail.annexationList[i].list[j].annexationInfo
            });
          };
        }
      }
    }
  };
  render() {
    return ( 
      <div className="v-agreement">
        <Cells className="notice-list">
          <Cell href={ this.state.contract } access>
            <CellBody>产品合同</CellBody>
            <CellFooter />
          </Cell>
          <Cell href={ this.state.notice } access>
            <CellBody>募集公告</CellBody>
            <CellFooter />
          </Cell>
          <Cell href={ this.state.risk } access>
            <CellBody>风险揭示</CellBody>
            <CellFooter />
          </Cell>
          <Cell href={ this.state.declar } access>
            <CellBody>委托人申明</CellBody>
            <CellFooter />
          </Cell>
        </Cells>
      </div>
    );
  };
};

export default Agreement;
