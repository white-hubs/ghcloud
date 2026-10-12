import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  TooltipComponentOption,
  LegendComponent,
  LegendComponentOption
} from 'echarts/components';
import { PieChart, PieSeriesOption, CustomChart, GaugeChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
  LabelLayout,
  CustomChart,
  GaugeChart
]);

type EChartsOption = echarts.ComposeOption<
  TooltipComponentOption | LegendComponentOption | PieSeriesOption
>;


let angle = 0; //角度，用来做简单的动画效果的

function startOpacity(i, rate) {
  let endRate = (i + 1) / 14 - 1 / 56;
  let startRate = (i + 1) / 14 - 4 / 56;
  if (startRate >= rate / 100) {
    return 0;
  }
  return (1 / (rate / 100)) * startRate;
}
function endOpacity(i, rate) {
  let endRate = (i + 1) / 14 - 1 / 56;
  let startRate = (i + 1) / 14 - 4 / 56;
  if (startRate >= rate / 100) {
    return 0;
  }
  return (1 / (rate / 100)) * endRate;
}
/**
 * 
 * @param hex 16进制颜色值
 * @param opacity 颜色透明度，根据rate计算
 * @returns 
 */
function hex2Rgba(hex:string, opacity:number) {
  if (!hex) hex = '#2989FF';
  return (
    'rgba(' +
    parseInt('0x' + hex.slice(1, 3)) +
    ',' +
    parseInt('0x' + hex.slice(3, 5)) +
    ',' +
    parseInt('0x' + hex.slice(5, 7)) +
    ',' +
    opacity +
    ')'
  );
}
function getLinearGradientData(i, rate, color) {
  let endRate = (i + 1) / 14 - 1 / 56;
  let startRate = (i + 1) / 14 - 4 / 56;
  let rateValue = parseInt(rate) / 100;
  if (startRate > rateValue || (startRate < rateValue && endRate > rateValue)) {
    return [];
  } else {
    return [
      { offset: 0, color: hex2Rgba(color, endOpacity(i, rate)) },
      { offset: 1, color: hex2Rgba(color, startOpacity(i, rate)) }
    ];
  }
}

//获取圆上面某点的坐标(x0,y0表示坐标，r半径，angle角度)
function getCirlPoint(x0, y0, r, angle) {
  let x1 = x0 + r * Math.cos((angle * Math.PI) / 180);
  let y1 = y0 + r * Math.sin((angle * Math.PI) / 180);
  return {
    x: x1,
    y: y1
  };
}


const getChartOption = (value: number, color: string) => {
  let rate = value;
  let labelData = [];//刻度数据
  let cueData = [];//方块数据
  for (let i = 0; i < 180; ++i) {
    labelData.push({
      value: 1,
      name: i,
      itemStyle: {
        normal: {
          color: color
        }
      }
    });
  }
  for (let i = 0; i < 14; ++i) {
    cueData.push(
      {
        value: 3,
        itemStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(
              1,
              0,
              0,
              0,
              getLinearGradientData(i, rate, color)
            )
          }
        }
      },
      {
        value: 1,
        name: '',
        itemStyle: { color: 'rgba(0,0,0,0)' },
        label: { show: false }
      }
    );
  }

  let option = {
    title: {
      text: rate + '%',
      x: 'center',
      y: 'center',
      textStyle: {
        fontSize: 20,
        fontWeight: 500,
        color: '#fff'
      }
    },
    series: [
      {
        name: "ring5",
        type: 'custom',
        coordinateSystem: "none",
        renderItem: function(params, api) {
            return {
                type: 'arc',
                shape: {
                    cx: api.getWidth() / 2,
                    cy: api.getHeight() / 2,
                    r: Math.min(api.getWidth(), api.getHeight()) / 2 * 1,
                    startAngle: (270+-angle) * Math.PI / 180,
                    endAngle: (40+-angle) * Math.PI / 180
                },
                style: {
                    stroke: color,
                    fill: "transparent",
                    lineWidth: 1.5
                },
                silent: true
            };
        },
        data: [0]
    }, {
        name: "ring5",
        type: 'custom',
        coordinateSystem: "none",
        renderItem: function(params, api) {
            return {
                type: 'arc',
                shape: {
                    cx: api.getWidth() / 2,
                    cy: api.getHeight() / 2,
                    r: Math.min(api.getWidth(), api.getHeight()) / 2 * 1,
                    startAngle: (90+-angle) * Math.PI / 180,
                    endAngle: (220+-angle) * Math.PI / 180
                },
                style: {
                    stroke: color,
                    fill: "transparent",
                    lineWidth: 1.5
                },
                silent: true
            };
        },
        data: [0]
    }, {
        name: "ring5",
        type: 'custom',
        coordinateSystem: "none",
        renderItem: function(params, api) {
            let x0 = api.getWidth() / 2;
            let y0 = api.getHeight() / 2;
            let r = Math.min(api.getWidth(), api.getHeight()) / 2 * 1;
            let point = getCirlPoint(x0, y0, r, (90+-angle))
            return {
                type: 'circle',
                shape: {
                    cx: point.x,
                    cy: point.y,
                    r: 2
                },
                style: {
                    stroke: color,//粉
                    fill: color
                },
                silent: true
            };
        },
        data: [0]
    }, {
        name: "ring5",  //绿点
        type: 'custom',
        coordinateSystem: "none",
        renderItem: function(params, api) {
            let x0 = api.getWidth() / 2;
            let y0 = api.getHeight() / 2;
            let r = Math.min(api.getWidth(), api.getHeight()) / 2 * 1;
            let point = getCirlPoint(x0, y0, r, (270+-angle))
            return {
                type: 'circle',
                shape: {
                    cx: point.x,
                    cy: point.y,
                    r: 2
                },
                style: {
                    stroke: color,      //绿
                    fill: color
                },
                silent: true
            };
        },
        data: [0]
    }, 
      {
        type: 'gauge',
        splitNumber: 30, //刻度数量
        min: 0,
        max: 100,
        radius: '105%', //图表尺寸
        center: ['50%', '50%'],
        startAngle: 90,
        endAngle: -269.9999,
        axisLine: {
          show: true,
          lineStyle: {
            width: 0
          }
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: color,
            width: 1
          },
          length: 3,
          splitNumber: 2
        },
        splitLine: {
          show: true,
          length: 3,
          lineStyle: {
            width: 1,
            color: color
          }
        },
        axisLabel: {
          show: false
        }
      },
      {
        name: 'Access From',
        type: 'pie',
        radius: ['65%', '80%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 28,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: cueData
      }
    ]
  };
  return option;
}
export function render(dom: HTMLElement, value: number, color: string) {
  let chartOption = getChartOption(value, color);
  const chart = echarts.init(dom);
  chart.setOption(chartOption,true)
  const timer = window.setInterval(function () {
    // let chartOption = getChartOption(value, color);
    angle = angle + 2;
    chart.setOption(chartOption, true);
  }, 100);
  return timer
}