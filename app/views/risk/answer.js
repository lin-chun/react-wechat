import 'css/risk.scss';
import React from 'react';
import Toast from 'component/Toast';
import Loading from 'component/Loading';
import {
  getRiskQuestions,
  setUserRisk
} from 'api';
import Dialog from 'component/Dialog';

/** 
 * 用户风险评估答题页面
 * 页面 url 可以带 back ，代表风险评测结束之后要跳转到的路径
 * 参数，参照 ./index.js
 * @author zhongzhuhua
 */
export default class RiskAnswer extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  state = {
    // 是否加载完毕
    loaded: false,
    // 是否提交或者选中
    issubmit: false,
    // 是否第一题
    isbegin: true,
    // 答题是否结束
    isend: false,
    // 是否展示下一题
    isnext: true,
    // 第几条题目
    index: 0,
    // 总题目
    all: 0,
    // 问卷
    question: null,
    // 当天问题名称
    name: '',
    // 题目列表 
    answers: null,
    // 每一题答案列表
    list: [],
    // 被选中的答案 index: answerNo
    userScore: {}
  };

  constructor(props) {
    super(props);
  };

  componentWillMount() {
    let self = this;
    getRiskQuestions().then(function (res) {
      if (res.code == '000000') {
        let data = res.data;
        if (data && data.recommendList && data.recommendList.length > 0) {
          data = data.recommendList[0];
          self.setState({
            loaded: true,
            question: data.surveyDTO,
            answers: data.questionAnswerDTOList,
            all: data.questionAnswerDTOList.length
          });
          self.setQuestion('i');
        }
      } else {
        self.setState({
          loaded: true,
          issubmit: false
        });
        self.refs.dialog && self.refs.dialog.open('未找到有效的风险评估测试题目！');
      }
    });
  };

  /**
   * 提交评测结果
   */
  submit() {
    let self = this;
    if (self.state.issubmit) return;
    self.setState({
      loaded: false,
      issubmit: true
    });
    let answerNos = '';
    for (let key in self.state.userScore) {
      let score = self.state.userScore[key];
      answerNos += ',' + score;
    }
    answerNos = answerNos.substr(1);
    setUserRisk(self.state.question.surveyNo, answerNos).then(function (res) {
      self.setState({
        loaded: true,
        issubmit: false
      });
      if (res.code == '000000') {
        let query = self.props.location.query;
        let data = res.data;
        query.ulevel = data.riskLevel;
        self.context.router.push({
          pathname: '/risk/result',
          query: query
        });
      } else {
        self.refs.toast.open(res.msg);
      }
    });
  };

  // 上一题
  goPre() {
    if (this.state.index > 0) {
      this.setQuestion('p');
    }
  };

  // 下一题
  goNext() {
    if (this.state.index + 1 < this.state.all) {
      this.setQuestion('n');
    }
  };

  /**
   * 答题
   * @param index 点击的是第几项
   * @param answerNo 选中项编号
   */
  answerQues(index, answerNo) {
    let self = this;
    let choose = self.refs.answers.querySelector('.choose');
    if (choose != null) {
      choose.className = 'answer';
    }
    self.refs.answers.childNodes[index].className = 'answer choose';
    self.state.userScore[self.state.index] = answerNo;

    if (self.state.index + 1 < self.state.all) {
      self.setQuestion('n');
    }

    if (!self.state.isend) {
      let answersCount = 0;
      let scores = self.state.userScore;
      for(let key in scores) {
        if(scores[key] != null && scores[key] != '') {
          answersCount++;
        }
      }
      if (answersCount == self.state.all) {
        this.setState({
          isend: true
        });
      }
    }
  };

  /**
   * 设置题目
   * @param type ['i','n','p'] ['初始化','下一页','上一页']
   */
  setQuestion(type) {
    let self = this;
    let index = type == 'i' ? 0 : self.state.index + (type == 'n' ? 1 : -1);
    let question = self.state.answers[index];
    let name = question.questionDTO.questionTitle;
    let list = question.answerDTOList;
    self.setState({
      isbegin: index == 0,
      isnext: index + 1 != self.state.all,
      index: index,
      name: name,
      list: list
    });
  };

  render() {
    let loaded = this.state.loaded;
    if (loaded && this.state.answers && this.state.answers.length > 0) {
      return (
        <div className="v-risk-answer">
          <div className="title">{this.state.name}</div>
          <div ref="answers" className="answers">
          {
            this.state.list.map(function(item, index) {
              let score = this.state.userScore[this.state.index];
              let clazz = item.answerNo == score ? 'answer choose' : 'answer';
              return <div onClick={() => this.answerQues(index, item.answerNo)} key={item.answerNo} className={clazz}>
                <div className="radio"></div>
                {item.answerTitle}
              </div>
            }, this)
          }
          </div>
          <div className="bottom">
            <div className="pre">
              {this.state.isbegin ? (<span></span>) : (<span onClick={() => this.goPre()}>上一题</span>)}
            </div>
            <div className="numbers">{this.state.index + 1}/{this.state.all}</div>
            <div className="next">
              {!this.state.isnext ? (<span></span>) : (<span onClick={() => this.goNext('')}>下一题</span>)}
            </div>
          </div>
          <div className="button">
          {
            this.state.isend ? (<button onClick={() => this.submit()}>确认并提交</button>) : (<span></span>)
          }
          </div>
          <Toast ref="toast" />
        </div>
      );
    } else if (loaded) {
      return (
        <Dialog ref="dialog" okFun={() => this.context.router.goBack()} btnOk="确定" />
      );
    } else {
      return (
        <Loading isShow={true} />
      );
    }
  }
};
