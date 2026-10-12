export const blue = '#2989FF'; // 蓝
export const red = '#F25858'; // 红
export const yellow = '#F4CD49'; // 黄
export const green = '#5EBE67'; // 绿
export const green2 = '#38DCB3'; // 淡绿
export const ching = '#40E3E5'; // 青
export const ching2 = '#87F0EC'; // 淡青
export const gray = '#ABBACC'; // 灰
// 默认系列颜色
export const colors = [blue, red, yellow, green, ching, gray];
// 标题
export const titleStyle = {
  left: 20,
  right: 'auto',
  top: 1,
  bottom: 'auto',
  textStyle: {
    color: gray,
    fontSize: 16,
  },
};
// 标题伪装的副标题
export const subTitleStyle = {
  left: 'center',
  right: 'auto',
  top: 48,
  bottom: 'auto',
  textStyle: {
    color: gray,
    fontSize: 14,
    rich: {
      blue: {
        fontWeight: 'blod',
        color: blue,
      },
      red: {
        fontWeight: 'blod',
        color: red,
      },
      yellow: {
        fontWeight: 'blod',
        color: yellow,
      },
      green: {
        fontWeight: 'blod',
        color: green,
      },
      ching: {
        fontWeight: 'blod',
        color: ching,
      },
      gray: {
        fontWeight: 'blod',
        color: gray,
      },
    },
  },
};
// line, bar value类图的Y轴样式
export const yAxisStyle = {
  type: 'value',
  axisLine: {
    show: false,
  },
  axisTick: {
    show: false,
  },
  axisLabel: {
    show: false,
    color: '#FFFFFF80',
  },
  splitLine: {
    lineStyle: {
      color: '#FFFFFF10',
      type: 'dashed',
    },
  },
  max: function (value) {
    return Math.floor(value.max / 10) * 10 + 15;
  },
};
// line, bar category-时间类图的X轴样式
export const xAxisStyle = {
  type: 'category',
  splitLine: {
    lineStyle: {
      color: '#FFFFFF10',
    },
  },
  // boundaryGap: false,
  axisTick: {
    show: false,
  },
  axisLabel: {
    formatter: (value, index) => {
      const date = new Date(value).getDate();
      if (!date) {
        return value;
      }
      return date < 10 ? '0' + date : date;
    },
    color: '#FFFFFF80',
  },
};
// lineArea 渐变区域折现图 style 的构造函数
export const lineAreaStyle = function (color = blue) {
  return {
    symbol: 'none',
    // silent: true,
    areaStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          { offset: 0, color: `${color}D0` },
          { offset: 0.4, color: `${color}80` },
          { offset: 1, color: `${color}00` },
        ],
        global: false, // 缺省为 false
      },
    },
  };
};

function formatter(item) {
  // const gradient = `linear-gradient(180deg, rgba(41, 137, 255) 0%,  rgba(41, 137, 255, 0) 100%);`
  // 渐变暂时不加
  return `
  <div class="tooltips-item" style="display: flex; align-items: center; line-height: 24px;">
    <div class="tooltip-icon" style="width: 14px; height: 2px; background: ${
      item.color
    }; margin-right: 4px;"></div>
    <div class="tooltip-label" style="color: ${gray};">${item.seriesName}-</div>
    <div class="tooltip-value" style="color: ${item.color}; font-weight: 600;">
      ${
        item.value != null ? item.value + (item.data.unit || '') : '暂无数据'
      }</div>
  </div>
  `;
}
// tooltip line 类的样式
export const tooltipStyle = {
  trigger: 'axis',
  formatter: (params, ticket, cb) => {
    let str = '';
    params.forEach((item) => {
      // str += `${item.seriesName}: ${item.value}<br/>`;
      str += formatter(item);
    });
    return `
    <div class="tooltips-echart">
      ${str}
    </div>
    `;
  },
  backgroundColor: '#000000B0',
  borderColor: '#2989FF',
  borderWidth: 1,
  padding: [5, 15, 5, 15],
  axisPointer: {
    // type: 'shadow',
    lineStyle: {
      width: 2,
      color: '#FFFFFF30',
    },
    label: {
      show: true,
      shadowBlur: 0,
    },
  },
};
// meter 仪表 隐藏各种
export const meterStyle = {
  pointer: {
    show: false,
  },
  title: {
    show: false,
  },
  detail: {
    show: false,
  },
  axisLine: {
    show: false,
  },
  splitLine: {
    show: false,
  },
  axisTick: {
    show: false,
  },
  axisLabel: {
    show: false,
  },
};
