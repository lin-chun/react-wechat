import React from 'react';
import '../../../css/login.scss';

export default class ClearIcon extends React.Component{
	propTypes:{
		isShowClearIcon:propsTypes.boolean
	};

	constructor(props){
		super(props);
		this.state={
			isShowClearIcon:false
		};
	};

	clearValue(e){
		e.stopPropagation();
		this.props.clearValue();
	};
	render(){
		return (
			<div ref='clearIcon' className={this.props.isShowClearIcon?'clear-icon':'clear-icon clear-hid'} onClick={(e)=>this.clearValue(e)}></div>
		)
	}
}