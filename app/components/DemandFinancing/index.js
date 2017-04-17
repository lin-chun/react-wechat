import './index.scss';
import {
  Tab,
  TabBody,
  NavBar,
  NavBarItem,
  Article,
  Cells,
  Cell,
  CellBody,
  CellFooter
} from 'react-weui';
import React from 'react';
import Highcharts from 'highcharts';
import High from 'highcharts/modules/exporting';
High(Highcharts);

/**
 * 活期理财，富盈5号
 * @author linchun
 */
export default class DemandFinancing extends React.Component {
  constructor(props) {
    super(props);
    this.chartLine = this.chartLine.bind(this);
    this.state = {
      tab: 0,
      seven: 0,
      month: 1,
      year: 1
    };
  };
  chartLine(data, type) {
    let xList = data.xList;
    let yList = data.yList;
    let categories = xList;
    for (let i = 0; i < yList.length; i++) {
      yList[i] = parseFloat(yList[i])
    }
    let stepNum = 1;
    switch (type) {
      case '0':
        stepNum = 1;
        break;
      case '1':
        stepNum = 4;
        break;
      case '2':
        stepNum = 12;
        break;
      default:
        break;
    };
    let chart = new Highcharts.Chart('container', {// 图表初始化函数，其中 container 为图表的容器 div               
      chart: {
          type: 'area'
        },
        title: {
          text: '手指移至下方曲线上，可查看近七日年化（％）',
          style: {
            fontSize: 14,
            color: '#666',
            textAlign: 'center',
            fontWeight: '400'
          }
        },
        xAxis: {
          tickWidth: 0,
          gridLineWidth: 0,
          tickPosition: 'inside',
          labels: {
            formatter: function() {
              return categories[this.value];
            },
            style: {
              color: '#999'
            },
            step: stepNum
          },
          tickInterval: 1
        },
        yAxis: {
          title: {
            text: ''
          },
          min: 1,
          labels: {
            align: 'right',
            x: 0,
            y: -2,
            formatter: function() {
              return this.value + '.00%'
            },
            style: {
              color: '#999'
            }
          }
        },
        credits: {
          enabled: false
        },
        exporting: {
          enabled: false
        },
        legend: {
          enabled: false
        },
        tooltip: {
          backgroundColor: '#1673d0',
          borderRadius: 8,
          borderColor: '#1673d0',
          style: {
            fontSize: '14px',
            color: '#fff'
          },
          formatter: function(p) {
            console.log(this)
            return '<div class="tooltip" style="line-height:27px;">' + this.y +'<div>';
          }
        },
        plotOptions: {
          series: {
            fillOpacity: 0.3
          },
          area: {
            marker: {
              enabled: false,
              symbol: 'circle',
              radius: 2,
              states: {
                hover: {
                  enabled: true
                }
              }
            }
          }
        },
        series: [{
          data: yList,
          color: '#4990e2',
          lineWidth: 1
        }]
    });
  }
  // chartLine(data, type) {
  //   let xList = data.xList;
  //   let yList = data.yList;
  //   let max = 4;
  //   let intervalNum = 'auto';
  //   switch (type) {
  //     case '0':
  //       intervalNum = 'auto';
  //       break;
  //     case '1':
  //       intervalNum = 4;
  //       break;
  //     case '2':
  //       intervalNum = 12;
  //       break;
  //     default:
  //       break;
  //   };
  //   for (let key in yList) {
  //     if (yList[key] > max) {
  //       max = yList[key];
  //     }
  //   }
  //   max = Math.ceil(max);
  //   // 基于准备好的dom，初始化echarts实例
  //   let myChart = echarts.init(this.refs.chartLine);
  //   // 绘制图表
  //   myChart.setOption({
  //     title: {
  //       show: true,
  //       text: '手指移至下方曲线上，可查看近七日年化（％）',
  //       textStyle: {
  //         fontSize: 14,
  //         color: '#666',
  //         textAlign: 'center',
  //         fontWeight: '400'
  //       },
  //       x: 'center'
  //     },
  //     tooltip: {
  //       show: true,
  //       trigger: 'axis',
  //       // formatter: '{c}',
  //       backgroundColor: 'transparent',
  //       padding: [0, 0],
  //       textStyle: {
  //         fontSize: 18
  //       },
  //       axisPointer: {
  //         type: 'none'
  //       },
  //       confine: true,
  //       formatter: function(params) {
  //         var res = '';
  //         for (var i = 0, l = params.length; i < l; i++) {
  //           res = '<div class="tooltip" style="line-height:27px;">' + params[i].value + '<div>';
  //         };
  //         return res;
  //       },
  //       position: function(p, params, dom) {
  //         console.log(p);
  //         console.log(params);
  //         console.log(dom);
  //         return [p[0] + 10, p[1] - 10];
  //       }
  //     },
  //     grid: {
  //       left: '3%',
  //       right: '4%',
  //       bottom: '3%',
  //       containLabel: true
  //     },
  //     xAxis: [{
  //       type: 'category',
  //       boundaryGap: false,
  //       data: xList,
  //       axisLine: {
  //         show: false
  //       },
  //       axisTick: {
  //         show: false
  //       },
  //       axisLabel: {
  //         textStyle: {
  //           color: '#999'
  //         },
  //         interval: intervalNum
  //       }
  //     }],
  //     yAxis: [{
  //       type: 'value',
  //       min: 1,
  //       max: max,
  //       axisLine: {
  //         show: false
  //       },
  //       axisTick: {
  //         show: false
  //       },
  //       axisLabel: {
  //         textStyle: {
  //           color: '#999'
  //         },
  //         formatter: '{value}.00%'
  //       },
  //       splitNumber: max
  //     }],
  //     series: [{
  //       type: 'line',
  //       stack: '收益',
  //       label: {
  //         normal: {
  //           show: false,
  //           position: 'top'
  //         }
  //       },
  //       areaStyle: {
  //         normal: {}
  //       },
  //       data: yList,
  //       itemStyle: {
  //         normal: {
  //           color: '#4990e2',
  //           lineStyle: {
  //             width: 2,
  //             type: 'solid'
  //           },
  //           areaStyle: {
  //             color: '#c6d4f1'
  //           }
  //         },
  //         emphasis: {
  //           color: 'blue'
  //         }
  //       },
  //       symbol: 'none'
  //     }]
  //   });
  // };
  // chartLineTwo(data, type) {
  //   let xList = data.xList;
  //   let yList = data.yList;
  //   let intervalNum = 'auto';
  //   switch (type) {
  //     case '0':
  //       intervalNum = 'auto';
  //       break;
  //     case '1':
  //       intervalNum = 4;
  //       break;
  //     case '2':
  //       intervalNum = 12;
  //       break;
  //     default:
  //       break;
  //   };
  //   // 基于准备好的dom，初始化echarts实例
  //   let myChart = echarts.init(this.refs.chartLine);
  //   // 绘制图表
  //   myChart.setOption({
  //     title: {
  //       show: true,
  //       text: '手指移至下方曲线上，可查看万份收益（元）',
  //       textStyle: {
  //         fontSize: 14,
  //         color: '#666',
  //         textAlign: 'center',
  //         fontWeight: '400'
  //       },
  //       x: 'center'
  //     },
  //     tooltip: {
  //       show: true,
  //       trigger: 'axis',
  //       // formatter: '{c}',
  //       backgroundColor: 'transparent',
  //       padding: [0, 0],
  //       textStyle: {
  //         fontSize: 18
  //       },
  //       axisPointer: {
  //         type: 'none'
  //       },
  //       confine: true,
  //       formatter: function(params) {
  //         console.log(params)
  //         var res = '';
  //         for (var i = 0, l = params.length; i < l; i++) {
  //           res = '<div class="tooltip" style="line-height:27px;">' + params[i].value + '<div>';
  //         };
  //         return res;
  //       },
  //       position: function(p) {
  //         console.log(p)
  //         return [p[0] + 10, p[1] - 10];
  //       }
  //     },
  //     grid: {
  //       left: '3%',
  //       right: '4%',
  //       bottom: '3%',
  //       containLabel: true
  //     },
  //     xAxis: [{
  //       type: 'category',
  //       boundaryGap: false,
  //       data: xList,
  //       axisLine: {
  //         show: false
  //       },
  //       axisTick: {
  //         show: false
  //       },
  //       axisLabel: {
  //         textStyle: {
  //           color: '#999'
  //         },
  //         interval: intervalNum
  //       }
  //     }],
  //     yAxis: [{
  //       type: 'value',
  //       axisLine: {
  //         show: false
  //       },
  //       axisTick: {
  //         show: false
  //       },
  //       axisLabel: {
  //         textStyle: {
  //           color: '#999'
  //         },
  //         formatter: '{value}'
  //       },
  //       splitNumber: 4
  //     }],
  //     series: [{
  //       type: 'line',
  //       stack: '收益',
  //       label: {
  //         normal: {
  //           show: false,
  //           position: 'top'
  //         }
  //       },
  //       areaStyle: {
  //         normal: {}
  //       },
  //       data: yList,
  //       itemStyle: {
  //         normal: {
  //           color: '#4990e2',
  //           lineStyle: {
  //             width: 2,
  //             type: 'solid'
  //           },
  //           areaStyle: {
  //             color: '#c6d4f1'
  //           }

  //         },
  //         emphasis: {
  //           color: 'blue'
  //         }
  //       },
  //       symbol: 'none'
  //     }]
  //   });
  // };
  chartLineTwo(data, type) {
    let xList = data.xList;
    let yList = data.yList;
    let categories = xList;
    for (let i = 0; i < yList.length; i++) {
      yList[i] = parseFloat(yList[i])
    }
    let stepNum = 1;
    switch (type) {
      case '0':
        stepNum = 1;
        break;
      case '1':
        stepNum = 4;
        break;
      case '2':
        stepNum = 12;
        break;
      default:
        break;
    };
    let chart = new Highcharts.Chart('container', {// 图表初始化函数，其中 container 为图表的容器 div               
      chart: {
          type: 'area'
        },
        title: {
          text: '手指移至下方曲线上，可查看万份收益（元）',
          style: {
            fontSize: 14,
            color: '#666',
            textAlign: 'center',
            fontWeight: '400'
          }
        },
        xAxis: {
          tickWidth: 0,
          gridLineWidth: 0,
          tickPosition: 'inside',
          labels: {
            formatter: function() {
              return categories[this.value];
            },
            style: {
              color: '#999'
            },
            step: stepNum
          },
          tickInterval: 1
        },
        yAxis: {
          title: {
            text: ''
          },
          min: 0,
          labels: {
            align: 'right',
            x: 0,
            y: -2,
            formatter: function() {
              return this.value
            },
            style: {
              color: '#999'
            }
          }
        },
        credits: {
          enabled: false
        },
        exporting: {
          enabled: false
        },
        legend: {
          enabled: false
        },
        tooltip: {
          backgroundColor: '#1673d0',
          borderRadius: 8,
          borderColor: '#1673d0',
          style: {
            fontSize: '14px',
            color: '#fff'
          },
          formatter: function(p) {
            console.log(this)
            return '<div class="tooltip" style="line-height:27px;">' + this.y +'<div>';
          }
        },
        plotOptions: {
          series: {
            fillOpacity: 0.3
          },
          area: {
            marker: {
              enabled: false,
              symbol: 'circle',
              radius: 2,
              states: {
                hover: {
                  enabled: true
                }
              }
            }
          }
        },
        series: [{
          data: yList,
          color: '#4990e2',
          lineWidth: 1
        }]
    });
  }
  // tab 切换
  clickTabOne() {
    this.setState({
      tab: 0
    });
  };
  clickTabTwo() {
    this.setState({
      tab: 1
    });
  };
  // 七日choose
  clickSeven() {
    this.setState({
      seven: 0,
      month: 1,
      year: 1
    });
  };
  clickMonth() {
    this.setState({
      month: 0,
      seven: 1,
      year: 1
    });
  };
  clickYear() {
    this.setState({
      year: 0,
      seven: 1,
      month: 1
    });
  };
  judgeState() {
    if (this.state.seven == 0) {
      return 'seven';
    };
    if (this.state.month == 0) {
      return 'month';
    };
    if (this.state.year == 0) {
      return 'year';
    };
  };
  // tooltip关闭
  closeTooltip() {
    let childs = this.refs.chartLine.childNodes;
    if (childs && childs.length == 2) {
      childs[1].style.display = 'none';
    }
  };
  render() {
    const {
      myYield,
      markArrOne,
      markArrTwo,
      state,
      investmentAmount,
      incomeUnit,
      renewPeriod,
      productRiskLevel,
      isOff,
      buyMore,
      buy,
      productIntroduce,
      investDirect,
      distributionWay,
      incomeType,
      incomeInstruction,
      redeemRule,
      tabOne,
      tabTwo,
      agreement,
      issue,
      sevthTabOne,
      sevthTabTwo,
      sevthTabThree,
      millionTabOne,
      millionTabTwo,
      millionTabThree,
      onOfThreeTitle,
      onOfThreeCont,
      position,
      goPosition
    } = this.props;
    return (
      <div className="c-demandfinancing">
        <div className="info">
          <div className="title">近七日年化收益率</div>
          <div className="yield">{myYield}<span className="percent">%</span></div>
          <div className="mark">
            <p className="mark-one">{markArrOne}</p>
            <p className="mark-two">{markArrTwo}</p>
          </div>
          <div className="state">
            <div className="state-inner">{state}</div>
          </div>
        </div>
        <div className="limit">
          <div className="money">
            <p className="title">首次起购金额（元）</p>
            <p className="title">{investmentAmount}</p>
          </div>
          <div className="limitRisk">
            <p className="title">风险等级</p>
            <p className="title">{productRiskLevel}</p>
          </div>
        </div>
        {
          buyMore == true ?
          (<div className="order-list" onClick={goPosition}>您该产品持有资产{position}元</div>)
          :
          (<div></div>)
        }
        <Tab>
          <NavBar className="navbar" >
            <NavBarItem active={this.state.tab == 0} onClick={tabOne}>
              <div>近七日年化</div>
              <div className="yield">{myYield}%</div>
            </NavBarItem>
            <NavBarItem active={this.state.tab == 1} onClick={tabTwo}>
              <div>万份收益</div>
              <div className="yield">{incomeUnit}</div>
            </NavBarItem>
          </NavBar>
          <TabBody>
            <Article>
              <div id="container" className="chart-body" ref="chartLine"></div>
            </Article>
            <div className="tab-change">
            {
              this.state.tab == 0 ?
              (
                <div className="wrap">
                {
                  this.state.seven == 1 ?
                  (<div onClick={sevthTabOne}>7日</div>)
                  :
                  (<div className="choosed">7日</div>)
                }
                {
                  this.state.month == 1 ?
                  (<div onClick={sevthTabTwo}>1个月</div>)
                  :
                  (<div className="choosed-month">1个月</div>)
                }
                {
                  this.state.year == 1 ?
                  (<div onClick={sevthTabThree}>3个月</div>)
                  :
                  (<div className="choosed-year">3个月</div>)
                }
                </div>
              )
              :
              (
                <div className="wrap">
                  {
                    this.state.seven == 1 ?
                    (<div onClick={millionTabOne}>7日</div>)
                    :
                    (<div className="choosed">7日</div>)
                  }
                  {
                    this.state.month == 1 ?
                    (<div onClick={millionTabTwo}>1个月</div>)
                    :
                    (<div className="choosed-month">1个月</div>)
                  }
                  {
                    this.state.year == 1 ?
                    (<div onClick={millionTabThree}>3个月</div>)
                    :
                    (<div className="choosed-year">3个月</div>)
                  }
                </div>
              )
            }
            </div>
          </TabBody>
        </Tab>
        <div className="main-box">
          <section className="desc">
            <Cells className="top">
              <Cell className="product">
                <CellBody>
                  产品简介
                </CellBody>
                <CellFooter/>
              </Cell>
            </Cells>
            <ul className="wrap">
              <li className="list">
                <span className="name">产品介绍</span>
                <span className="memo">{productIntroduce}</span>
              </li>
              <li className="list">
                <span className="name">投资方向</span>
                <span className="memo">{investDirect}</span>
              </li>
              <li className="list">
                <span className="name">分配方式</span>
                <span className="memo">{distributionWay}</span>
              </li>
              <li className="list">
                <span className="name">收益类型</span>
                <span className="memo">{incomeType}</span>
              </li>
              <li className="list">
                <span className="name">收益情况</span>
                <span className="memo">{incomeInstruction}</span>
              </li>
              <li className="list">
                <span className="name">买入卖出规则</span>
                <span className="memo">{redeemRule}</span>
              </li>
            </ul>
            <Cells className="notice-list">
              <Cell onClick={agreement} access>
                <CellBody>
                  产品相关协议
                </CellBody>
                <CellFooter/>
              </Cell>
              <Cell href={issue} access>
                <CellBody>
                  常见问题
                </CellBody>
                <CellFooter/>
              </Cell>
            </Cells>
            <Cells className="bottom-list">
              <Cell>
                <CellBody>
                  {onOfThreeTitle}
                </CellBody>
                <CellFooter/>
              </Cell>
            </Cells>
            <div className="bottom">
              <div>{onOfThreeCont}</div>
            </div>
          </section>
        </div>
        {
          /[256]/.test(isOff) ?
          (<div className='buy disable-buy'>{state}</div>)
          :
          (
            buyMore == false ? 
            (<div className='buy' onClick={buy}>买入</div>) 
            : 
            (<div className='buy' onClick={buy}>追加买入</div>)
          )
        }
      </div>
    );
  };
};
