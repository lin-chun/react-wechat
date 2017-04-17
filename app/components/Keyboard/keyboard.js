import React, {
  Component,
  propTypes
} from 'react';
import stop from 'utils/stopDefault';

/**
 * 键盘模块
 * @author zhongzhuhua
 */
export default class KeyBoard extends Component {
  propTypes: {
    // 键盘类型 number[纯数字键盘] int[整型数字] float[浮点数字] id[身份证]
    type: PropTypes.string,
    // 是否要安全设置，如果 true ，则点击数字不出现阴影，防止录屏
    isSafe: PropTypes.boolean,
    // 确认按钮文本，如果该值为 null 或者 '' ，则样式切换成无确定按钮盘
    btnOk: PropTypes.string,
    // 是否展示格式化后的值
    frm: PropTypes.boolean,
    // 每隔多少个字符添加一个 frmChar，0 = 不加
    frmSplit: PropTypes.number,
    // 添加的字符间隔，判断的时候已 state 中为主，目前只支持 , ， - / space[空格]
    // null 的时候， number 默认空格 int 和 float 默认[,]
    frmChar: PropTypes.string,
    // float 类型小数点后最多允许多少位
    frmFloat: PropTypes.number,
    // number id 类型的最大长度，等于 0 的话， id 默认 18，其他默认 22，判断的时候以 state 为主
    maxLength: PropTypes.number,
    // int 和 float 的时候，最大值
    // maxValue: PropTypes.number,
    // 键盘点击事件
    clickFun: PropTypes.func,
    // 确认按钮点击事件
    okFun: PropTypes.func,
    // 取消回调
    calcelFun: PropTypes.func,
    // 清除回调
    clearFun: PropTypes.func,
    // 确定按钮点击埋点
    okTitle: PropTypes.substr
  };
  static defaultProps = {
    type: 'number',
    isSafe: false,
    btnOk: '确认',
    frm: true,
    frmSplit: 0,
    frmChar: null,
    frmFloat: 2,
    maxLength: 0,
    // maxValue: 9999999999,
    clickFun: () => {},
    okFun: () => {},
    calcelFun: () => {},
    clearFun: () => {},
    okTitle: ''
  };

  state = {
    maxLength: 0,
    frmChar: ' ',
    // 实际值
    value: '',
    // 格式化之后的值
    frmValue: '',
    // 未确定之前的值
    oldValue: '',
    // 未确定之前的格式化后的值
    oldFrmValue: '',
    // 是否可以点击确定按钮
    isOk: true,
    // 重新排序
    sort: false,
    // 键盘键
    keys: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  };

  constructor(props) {
    super(props);
    if (this.props.type === 'id') {
      this.state.keys.push('X');
    } else if (this.props.type === 'float') {
      this.state.keys.push('.');
    }
  };

  // 清除
  clear() {
    this.state.value = '';
    this.state.oldValue = '';
    this.state.frmValue = '';
    this.state.oldFrmValue = '';
    this.props.clearFun(this.state);
  };

  /**
   * 重置
   * @param v boolean 是否可以点击确认按钮
   */
  reset(v) {
    this.clear();
    this.setState({
      isOk: v
    });
  };

  // 赋值
  setValue(value) {
    this.state.value = value;
    this.formatValue();
  };

  // 获取值
  getValue() {
    return this.state.value;
  };

  // 获取格式化的值
  getFrmValue() {
    return this.state.frmValue == null ? this.state.value : this.state.frmValue;
  };

  // 点击数字键盘
  click(e) {
    stop(e);
    let value = this.state.value;
    let type = this.props.type;
    let len = 0;
    let frmValue = '';
    let ele = e && e.target;
    let pidx = value.indexOf('.');
    if (ele) {
      let val = ele.getAttribute('data-value');
      if ((val && val.length == 1) || val == 'back') {
        if (val == 'back') {
          if (value.length > 0) {
            value = value.substr(0, value.length - 1);
          }
        } else {
          // 字符串长度
          len = value.length;
          if (type == 'id' || type == 'number') {
            // 判断是否超过最大长度
            let maxLength = this.state.maxLength;
            if (value.length < maxLength) {
              if (val == 'X') {
                if (value.length == 17) {
                  value = value + val;
                }
              } else {
                value = value + val;
              }
            }
          } else if (type == 'float' || type == 'int') {
            // let maxValue = this.props.maxValue;
            value = value == '' ? '0' : value;
            if (val == '.') {
              // 如果输入的是点，则判断是否已经有点了
              if (value.indexOf('.') == -1) {
                value = value + val;
              }
            } else {
              if (value == '0') {
                value = val;
              } else {
                // 如果有小数点，就判断小数点是否超过
                if (pidx != -1 && len - pidx > this.props.frmFloat) {} else {
                  value = value + val;
                }
              }
            }
          }
        }
      }
    }

    // 格式化字符串
    this.state.value = value;
    this.formatValue();
    this.props.clickFun({
      value: this.state.value,
      frmValue: this.state.frmValue
    });
  };

  // 格式化字符串
  formatValue() {
    let frmValue = '';
    let value = this.state.value;
    let pidx = value.indexOf('.');
    let frmSplit = this.props.frmSplit;
    let frmChar = this.state.frmChar;
    let len = value.length;
    let isFrm = frmSplit > 0 && len > frmSplit;
    if (isFrm) {
      if (this.props.type == 'int' || this.props.type == 'float') {
        // 如果有小数点，而且是数字，则切数字
        let valueInt = value;
        if (pidx > -1) {
          valueInt = value.substr(0, pidx);
        }
        valueInt = valueInt.replace(new RegExp('(\\d+?)(?=(?:\\d{' + frmSplit + '})+$)', 'g'), '$1' + frmChar);
        frmValue = valueInt;
        if (pidx > -1) {
          frmValue = frmValue + value.substr(pidx);
        }
      } else {
        for (let key in value) {
          let v = value[key];
          frmValue = frmValue + (key >= frmSplit && key % frmSplit == 0 ? frmChar : '') + v;
        }
      }
    } else {
      frmValue = value;
    }
    this.state.frmValue = frmValue;
  };

  // 确认按钮点击事件
  ok() {
    if (this.refs.btnOk.className == 'button-ok') {
      this.state.oldValue = this.state.value;
      this.state.oldFrmValue = this.state.frmValue;
      this.props.okFun(this.state);
    }
  };

  // 取消
  calcel() {
    this.state.value = this.state.oldValue;
    this.state.frmValue = this.state.oldFrmValue;
    this.props.calcelFun(this.state);
  };

  /**
   * 设置确定按钮是否可以点击
   * @param v 是否可以点击确定按钮
   */
  isOk(v) {
    this.setState({
      isOk: v
    });
  };

  // 重置数字
  resetNumber() {
    this.setState({
      sort: true
    });
  };

  // 数组乱序
  _sort(keys) {
    for (var j, x, i = keys.length; i; j = parseInt(Math.random() * i), x = keys[--i], keys[i] = keys[j], keys[j] = x);
    return keys;
  };

  componentWillMount() {
    let len = 22;
    if (this.props.maxLength == 0) {
      if (this.props.type == 'id') {
        len = 18;
      }
    } else {
      len = this.props.maxLength;
    }
    this.state.maxLength = len;
    let str = this.props.frmChar;
    if (str == null || !(str == ' ' || str == ',' || str == '，' || str == '/' || str == '-')) {
      if (this.props.type == 'int' || this.props.type == 'float') {
        str = ',';
      } else {
        str = ' ';
      }
    } else {
      str = ' ';
    }
    this.state.frmChar = str;
  };

  render() {
    // 获取所有的键
    let keys = this.state.keys;
    if (this.state.sort) {
      keys = this._sort(keys);
      this.state.sort = false;
    }
    let char = keys.length == 11 ? keys[10] : '';
    let isNine = this.props.btnOk == null || this.props.btnOk == '';
    let back = null;
    if (isNine) {
      back = (<div className="flex-1" data-value="back"><span className="back" data-value="back"></span></div>);
    } else {
      back = (<div className="flex-1" data-value=""></div>);
    }
    let clazz = {
      btnOk: (this.state.isOk ? 'button-ok' : 'button-ok disabled'),
      keyboard: 'c-keyboard' + (isNine ? ' keynine' : '') + (this.props.isSafe ? '' : ' unsafe')
    };
    return (
      <div className={clazz.keyboard}>
        <div className="main user-select">
          <div className="sec" onTouchStart={(e) => this.click(e)}>
            <div className="flex">
              <div className="flex-1" data-value={keys[1]}>{keys[1]}</div>
              <div className="flex-1" data-value={keys[2]}>{keys[2]}</div>
              <div className="flex-1" data-value={keys[3]}>{keys[3]}</div>
            </div>
            <div className="flex">
              <div className="flex-1" data-value={keys[4]}>{keys[4]}</div>
              <div className="flex-1" data-value={keys[5]}>{keys[5]}</div>
              <div className="flex-1" data-value={keys[6]}>{keys[6]}</div>
            </div>
            <div className="flex">
              <div className="flex-1" data-value={keys[7]}>{keys[7]}</div>
              <div className="flex-1" data-value={keys[8]}>{keys[8]}</div>
              <div className="flex-1" data-value={keys[9]}>{keys[9]}</div>
            </div>
            <div className="flex">
              <div className="flex-1" data-value={char}>{char}</div>
              <div className="flex-1" data-value={keys[0]}>{keys[0]}</div>
              {back}
            </div>
          </div>
          <div className="button">
            <div className="button-back" data-value="back" onTouchStart={(e) => this.click(e)}><span className="back" data-value="back"></span></div>
            <button ref="btnOk" className={clazz.btnOk} disabled={!this.state.isOk} data-value="ok" onTouchStart={() => this.ok()} otitle={this.props.okTitle} otype="button">{this.props.btnOk}</button>
          </div>
        </div>
      </div>
    );
  };
};
