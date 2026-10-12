import { BaseDashboard, type BaseDashboardOptions } from '../../../base/base-dashboard'
import './voltage.css'

interface VoltageOptions extends BaseDashboardOptions {
  title: string;
  code: string;
  productPropVoList: { propCode: string;dataConstraint: number[]; }[];
  textColor?: string;
}

/** 电压仪表盘 */
export class VoltageDashboard extends BaseDashboard {
  private max = 500
  private voltageValue = 0
  private readonly textColor
  private readonly title: string
  public constructor (options: VoltageOptions) {
    options.dom.classList.add('cube-voltage-dashboard')
    super(options)
    this.textColor = options.textColor ?? '#000'
    this.title = options.title
    this.setMax(options)
    this.setOptions()
  }

  public setValue (value: number): void {
    this.voltageValue = value
    this.setOptions()
    this.render()
  }

  /** 设置最大值 */
  private setMax (options: VoltageOptions): void {
    const iotCode = options.productPropVoList.filter(item => item.propCode === options.code)[0]
    this.max = iotCode?.dataConstraint.length === 2 ? Math.max(iotCode?.dataConstraint[0], iotCode?.dataConstraint[1]) : 0
  }

  /** 仪表盘颜色 */
  private getDashboardColor (): [number, string][] {
    const colorList = [
      {
        range: [0, 204],
        ratio: 0,
        color: '#FDAD30'
      },
      {
        range: [204, 235],
        ratio: 0,
        color: '#64D040'
      },
      {
        range: [235, this.max],
        ratio: 0,
        color: '#FDAD30'
      }
    ]
    const result = colorList.map((item, index) => {
      if (item.range[0] <= this.max && item.range[1] <= this.max) {
        item.ratio = Number((item.range[1] / this.max).toFixed(2))
      } else if (index === colorList.length - 1 && item.ratio === 0) {
        item.ratio = 1
      }
      return [item.ratio, item.color]
    })
    return result as [number, string][]
  }

  /** 生成Echart配置 */
  private setOptions (): void {
    this.chartOption = {
      series: [
        {
          type: 'gauge',
          startAngle: 220,
          endAngle: -40,
          radius: '90%',
          center: ['50%', '45%'],
          max: this.max,
          itemStyle: {
            color: '#1578FF',
            shadowColor: 'rgba(0,138,255,0.45)',
          },
          progress: {
            show: true,
            width: 8
          },
          pointer: {
            icon: 'triangle',
            length: '70%',
            width: 10,
            offsetCenter: [0, 0]
          },
          axisLine: {
            lineStyle: {
              width: 8
            }
          },
          axisLabel: {
            show: true,
            color: '#B7C1CE',
            fontSize: 8,
          },
          axisTick: {
            distance: 0,
            length: 5,
            lineStyle: {
              color: '#86909C',
              width: 1 // 刻度线线宽
            }
          },
          splitLine: {
            show: true,
            distance: 2,
            lineStyle: {
              color: '#B7C1CE'
            }
          },
          detail: {
            valueAnimation: true,
            formatter: '{value}V\n' + this.title,
            color: this.textColor,
            fontSize: 14,
            lineHeight: 22,
            offsetCenter: [0, '80%'],
            show: true
          },
          anchor: {
            show: true,
            icon: 'circle',
            size: 8,
            showAbove: true,
            offsetCenter: [0, 0],
            itemStyle: {
              color: '#fff',
              borderWidth: 14,
              borderColor: '#1578FF',
            }
          },
          data: [
            {
              value: this.voltageValue,
            }
          ]
        }
      ]
    }
  }
}
