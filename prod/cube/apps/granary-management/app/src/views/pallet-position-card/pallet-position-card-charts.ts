import * as echarts from 'echarts'

const gradientBlue = (): echarts.graphic.LinearGradient =>
  new echarts.graphic.LinearGradient(0, 0, 1, 0, [
    { offset: 0, color: '#4a9dff' },
    { offset: 1, color: '#7ee8ff' },
  ])

const trackColor = 'rgba(120, 170, 255, 0.25)'

export const buildUsageGaugeOption = (value: number): echarts.EChartsOption => {
  const v = Math.min(100, Math.max(0, value))
  const ratio = v / 100
  return {
    animation: false,
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        radius: '100%',
        startAngle: 90,
        endAngle: -270,
        min: 0,
        max: 100,
        axisLine: {
          lineStyle: {
            width: 10,
            roundCap: true,
            color: [
              [
                ratio,
                new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: '#3ad991' },
                  { offset: 1, color: '#8cffd0' },
                ]),
              ],
              [1, trackColor],
            ],
          },
        },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          formatter: '{value}%',
          fontSize: 18,
          fontWeight: 700,
          color: '#6ef5c2',
          offsetCenter: [0, 0],
        },
        data: [{ value: v }],
      },
    ],
  }
}

export const buildCapacityBarOption = (used: number, total: number): echarts.EChartsOption => {
  const pct = total > 0 ? Math.min(100, Math.max(0, (used / total) * 100)) : 0
  const rest = 100 - pct
  return {
    animation: false,
    backgroundColor: 'transparent',
    grid: { bottom: 0, containLabel: false, left: 0, right: 0, top: 0 },
    xAxis: { max: 100, show: false, type: 'value' },
    yAxis: { data: [''], show: false, type: 'category' },
    series: [
      {
        barWidth: 8,
        data: [pct],
        itemStyle: { borderRadius: [99, 0, 0, 99], color: gradientBlue() },
        stack: 'cap',
        type: 'bar',
      },
      {
        barWidth: 8,
        data: [rest],
        itemStyle: { borderRadius: [0, 99, 99, 0], color: trackColor },
        stack: 'cap',
        type: 'bar',
      },
    ],
  }
}

export const buildTempGaugeOption = (value: number, axisMax: number, arcColor: string): echarts.EChartsOption => {
  const max = axisMax > 0 ? axisMax : 50
  const ratio = Math.min(1, Math.max(0, value / max))
  return {
    animation: false,
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        radius: '100%',
        startAngle: 90,
        endAngle: -270,
        min: 0,
        max,
        axisLine: {
          lineStyle: {
            width: 8,
            roundCap: true,
            color: [[ratio, arcColor], [1, trackColor]],
          },
        },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          formatter: '{value}°C',
          fontSize: 13,
          fontWeight: 700,
          color: '#fff',
          offsetCenter: [0, 2],
        },
        data: [{ value }],
      },
    ],
  }
}

export const buildHumidityGaugeOption = (value: number): echarts.EChartsOption => {
  const v = Math.min(100, Math.max(0, value))
  const ratio = v / 100
  return {
    animation: false,
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        radius: '92%',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        axisLine: {
          lineStyle: {
            width: 14,
            roundCap: true,
            color: [
              [ratio, new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#ff6464' },
                { offset: 1, color: '#ff9f9f' },
              ])],
              [1, trackColor],
            ],
          },
        },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          formatter: '{value}%',
          fontSize: 30,
          fontWeight: 700,
          color: '#ff6464',
          offsetCenter: [0, '-4%'],
        },
        data: [{ value: v }],
      },
    ],
  }
}

export const buildHumidityBarOption = (pct: number): echarts.EChartsOption => {
  const v = Math.min(100, Math.max(0, pct))
  const rest = 100 - v
  return {
    animation: false,
    backgroundColor: 'transparent',
    grid: { bottom: 0, containLabel: false, left: 0, right: 0, top: 0 },
    xAxis: { max: 100, show: false, type: 'value' },
    yAxis: { data: [''], show: false, type: 'category' },
    series: [
      {
        barWidth: 10,
        data: [v],
        itemStyle: {
          borderRadius: [99, 0, 0, 99],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#ff7875' },
            { offset: 1, color: '#ff6464' },
          ]),
        },
        stack: 'hum',
        type: 'bar',
      },
      {
        barWidth: 10,
        data: [rest],
        itemStyle: { borderRadius: [0, 99, 99, 0], color: trackColor },
        stack: 'hum',
        type: 'bar',
      },
    ],
  }
}
