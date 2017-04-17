/*
 *@description 网络请求失败后显示的提示和刷新按钮的页面，一般用于加载页面失败时显示
 *@usage 控制showRefreshPage：true显示, false隐藏
 *@author yuxiaoli 2017-04-06
 */
import React from 'react';
import './index.scss';

export default class RequestFailShow extends React.Component{
	render(){
		return(
			<div className={this.props.showRefreshPage?'request-fail request-fail-show':'request-fail'}>
				<div className='fail-icon'></div>
				<p>当前网络有问题，请稍后再试。</p>
				<a href='javascript:void(0);' className='btn' onClick={()=>location.reload()}>刷新试试</a>
			</div>
		);
	};
};