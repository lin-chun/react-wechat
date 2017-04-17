import React from 'react';
import { getEarnInfo } from 'api';
import Loading from 'component/Loading';
import WeUI from 'react-weui';
import 'css/position/earnInfo.scss';
import Toast from 'component/Toast';
import Reload from 'component/RequestFailShow';
const { Cells, Cell, CellBody, CellFooter } = WeUI;

class EarnInfo extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			// 收益明细
			earnList: [],
			totalIncome: '',
			dataSize: '',
			isShow: true,
      showRefreshPage: false
		}
	};
	componentWillMount() {
		let self = this;
		let data = {
			ffProductId: self.props.params.productId
		}
		getEarnInfo(data).then(function(res) {
			if (res.code === '000000') {
				let data = res.data;
				self.setState({
					dataSize: data.dataSize
				});
				if (data && data.incomeHistoryList && data.incomeHistoryList.length > 0) {
					self.setState({
						totalIncome: data.totalIncome,
						earnList: data.incomeHistoryList
					})
					console.log(self.state.earnList)
				}
			} else {
				this.setState({
          isShow: false,
          showRefreshPage: true
        })
			}
		})
	};
	render() {
    if (this.state.earnList && this.state.earnList.length > 0) {
      return (
				<div className="v-earn">
					<Toast ref="tip"/>
					<div className="earn">
						<div className="top">累积收益(元) </div>
						<div className="total">{this.state.totalIncome}</div>
					</div>
					<Cells>
						{
							this.state.earnList.map(function(item, index) {
								return (
									<Cell key={index} className="list">
		                <CellBody>
		                  {item.incomeDate}
		                </CellBody>
		                <CellFooter>
		                  +{item.incomeAmount}
		                </CellFooter>
			            </Cell>
								)
							})
						}
			        </Cells>
				</div>
			)
    } else if (this.state.dataSize == '0') {
    	return (
    		<div className="v-earn">
      		<div className="earn">
						<div className="top">累积收益(元) </div>
						<div className="total">0.00</div>
					</div>
				</div>
    	)
    }
    else {
    	return (
    		<div>
    			<Loading isShow={this.state.isShow}></Loading>
          <Reload showRefreshPage = {this.state.showRefreshPage}/>
    		</div>
    	)
    }
	}
}

export default EarnInfo