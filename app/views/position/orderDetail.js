// 订单详情页
import React from 'react';
import 'css/position/orderDetail.scss';
import imgSuccess from 'images/success.png';
import imgError from 'images/error.png';
import imgDealing from 'images/dealing.png';

class OrderDetail extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			// 申购/赎回
			isBuy: '',
			// 订单状态
			orderState: '',
			// 金额
			value: '',
			// 时间
			time: '',
			// 方式
			channel: ''
		}
	};
	componentWillMount() {
		console.log(this.props.location.query);
		let data = this.props.location.query;
		this.setState({
			isBuy: data.type == '0' ? "买入" : "卖出",
			orderState: data.stateName,
			state: data.state,
			value: data.value,
			time: data.time,
			channel: data.channel
		})
	};
	render() {
		return (
			<div className="v-order-list">
				<div className="top">
				{
					this.state.state == '21' || this.state.state == '41' ?
					(<div className="icon"><img src={imgSuccess} /></div>)
					:
					(	
						this.state.state == '00' || this.state.state =='02' || this.state.state == '10' || this.state.state == '13' || this.state.state == '20' ?
						(<div className="icon"><img src={imgDealing} /></div>)
						:
						(<div className="icon"><img src={imgError} /></div>)
					
					)
				}
					<div className="result">{this.state.orderState}</div>
				</div>
				<ul className="content">
					<li>
						<span>{this.state.isBuy}金额(元)</span>
						<span>{this.state.value}</span>
					</li>
					<li>
						<span>{this.state.isBuy}时间</span>
						<span>{this.state.time}</span>
					</li>
					<li>
						<span>{this.state.isBuy}方式</span>
						<span>{this.state.channel}</span>
					</li>
				</ul>
			</div>
		)
	}
}

export default OrderDetail