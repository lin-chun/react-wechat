import React from 'react';
import { getTime, getDealInfo } from 'api';
import Loading from 'component/Loading';
import 'css/position/dealInfo.scss';
import Toast from 'component/Toast';
import Reload from 'component/RequestFailShow';

class DealInfo extends React.Component {
	static contextTypes = {
	    router: React.PropTypes.object.isRequired
	};
	constructor(props){
		super(props);
		this.goOrderDetail = this.goOrderDetail.bind(this);
		this.state = {
			// 时间
			time: '',
			// 交易列表
			dealList: [],
			// 筛选的交易列表
			filterList: [],
			// 页面入口判断
			normalEnter: true,
			// 底部展示文案
			bottomInfo: '点击查看更多历史交易',
			showLoading: false,
			isShow: true,
      showRefreshPage: false,
      // 是否展示当日
      showToday: true
		}
	};
	componentWillMount() {
		let myTime = '';
		let listArr = [];
		let today = '';
		let query = this.props.location.query.isFilter;
		if (query == '1') {
			this.setState({
				normalEnter: false
			})
		};
		getTime().then((res) => {
			if (res.code === '000000') {
				myTime = res.data.timestamp;
				today = res.data.timestamp;
				myTime = new Date(myTime*1).toLocaleDateString().replace('/', '年').replace('/', '月') + '日';
				today = new Date(today*1).toLocaleDateString().replace('/', '-').replace('/', '-');
				console.log(today)
				this.setState({
					time: myTime
				});
				let data = {
					ffProductId: this.props.params.productId,
					startDate: today,
					endDate: today
				}
				getDealInfo(data).then((res) => {
					if (res.code === '000000') {
						console.log(res);
						listArr = res.data.orderList;
						this.filterOrder(listArr);
						this.setState({
							dealList: listArr
						});
					} else {
						this.setState({
	            isShow: false,
	            showRefreshPage: true
	          })
					}
				});
			} else {
				this.setState({
          isShow: false,
          showRefreshPage: true
        })
			}
		});
		
	};
	// 筛选 02到账中 20确认中 13退款到账中的订单
	filterOrder(options) {
		let filterListArr = [];
		for (let i = 0; i < options.length; i++) {
			if (options[i].orderStatus == '20' || options[i].orderStatus == '02' || options[i].orderStatus == '13') {
				// console.log(options[i])
				filterListArr.push(options[i])
				this.setState({
					filterList: filterListArr
				})
			}
		}
	};
	goOrderDetail(type, stateName, time, value, channel, state) {
		this.context.router.push({
	    pathname: '/orderDetail',
	    query: {
	    	type: type,
	    	stateName: stateName,
	    	state: state,
	    	time: time,
	    	value: value,
	    	channel: channel
	    }
		});
	};
	// 更多订单
	moreList() {
		let data = {
			ffProductId: this.props.params.productId
		};
		if (this.state.bottomInfo == '点击查看更多历史交易') {
			this.setState({
		      	showLoading: true
		    });
			getDealInfo(data).then((res) => {
				this.setState({
			      	showLoading: false
			    });
				if (res.code === '000000') {
					let listArr = res.data.orderList;
					this.filterOrder(listArr);
					this.setState({
						dealList: listArr,
						bottomInfo: '没有更多订单了',
						showToday: false
					});
				} else {
					this.refs.tip.open(res.msg);
				}
			});
		} else {

		}
	};
	render() {
		if (this.state.dealList && this.state.dealList.length > 0) {
			return (
				<div className="v-deal">
					<Toast ref="tip"/>
					<Loading isShow={ this.state.showLoading }></Loading>
					<div className="deal">{ this.state.showToday ? this.state.time : '全部订单'}</div>
					<div className="wrap">
						<ul className="list">
							{	this.state.normalEnter == true ?

								(
									this.state.dealList.map(function(item, index) {
										return (
											<li key={index} onClick={() => this.goOrderDetail(item.orderType, item.orderStatusName, item.orderCreateTime, item.orderAmount, item.orderChannel, item.orderStatus)}>
												<div className="top">
													<span>{ item.orderType == '0' ? '买入' : '卖出' }</span>
													<span className="right">{ item.orderAmount }</span>
												</div>
												<div className="bottom">
													<span>{ item.orderCreateTime }</span>
													<span className="right">{ item.orderStatusName }</span>
												</div>
											</li>
										)
									}.bind(this))
								)
								:
								(
									this.state.filterList.map(function(item, index) {
										return (
											<li key={index} onClick={() => this.goOrderDetail(item.orderType, item.orderStatusName, item.orderCreateTime, item.orderAmount, item.orderChannel, item.orderStatus)}>
												<div className="top">
													<span>{ item.orderType == '0' ? '买入' : '卖出' }</span>
													<span className="right">{ item.orderAmount }</span>
												</div>
												<div className="bottom">
													<span>{ item.orderCreateTime }</span>
													<span className="right">{ item.orderStatusName }</span>
												</div>
											</li>
										)
									}.bind(this))
								)
							}
						</ul>
					</div>
					{
						this.state.normalEnter == true ?
						(
							<div className="more" onClick={() => this.moreList()}>{this.state.bottomInfo}</div>
						)
						:
						(
							<div className="more">没有更多订单了</div>
						)
					}
					
				</div>
			)
		} else {
        	return (
        		<div>
        			<Toast ref="tipErr"/>
        			<Loading isShow={this.state.isShow}></Loading>
        			<Reload showRefreshPage = {this.state.showRefreshPage}/>
        		</div>
        	)
        }
	}
}

export default DealInfo