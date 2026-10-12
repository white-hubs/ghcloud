/** 用户提供的完整助手回复原文（用于回归） */
export const USER_FULL_ECHARTS_MESSAGE = `# 📈 2026年5月18日A股市场走势分析

基于获取的公开市场信息，为您分析今日（2026年5月18日）A股市场整体走势，并提供可视化图表。

## 📊 板块涨跌对比图表

以下柱状图直观展示了今日"冰火两重天"的板块分化格局：

\`\`\`echarts
{
  "title": {
    "text": "2026年5月18日A股板块涨跌对比",
    "subtext": "数据来源：市场公开信息",
    "left": "center"
  },
  "tooltip": {
    "trigger": "axis",
    "axisPointer": {
      "type": "shadow"
    }
  },
  "legend": {
    "data": ["涨幅", "跌幅"],
    "top": "10%"
  },
  "grid": {
    "left": "3%",
    "right": "4%",
    "bottom": "3%",
    "containLabel": true
  },
  "xAxis": {
    "type": "category",
    "data": ["存储芯片", "通信运营", "MLCC", "影视院线", "煤炭", "贵金属", "地产", "汽车整车", "锂矿", "化学制药"],
    "axisLabel": {
      "rotate": 45
    }
  },
  "yAxis": {
    "type": "value",
    "name": "涨跌幅(%)"
  },
  "series": [
    {
      "name": "涨幅",
      "type": "bar",
      "data": [5.8, 4.2, 2.5, 1.2, 0.8, null, null, null, null, null],
      "itemStyle": {
        "color": "#e74c3c"
      },
      "label": {
        "show": true,
        "position": "top"
      }
    },
    {
      "name": "跌幅",
      "type": "bar",
      "data": [null, null, null, null, null, -5.2, -2.8, -2.5, -3.1, -2.3],
      "itemStyle": {
        "color": "#3498db"
      },
      "label": {
        "show": true,
        "position": "bottom"
      }
    }
  ]
}
\`\`\`

\`\`\`mermaid
flowchart TD
    A[高位资金出逃] --> B[AI传媒]
\`\`\`
`;
