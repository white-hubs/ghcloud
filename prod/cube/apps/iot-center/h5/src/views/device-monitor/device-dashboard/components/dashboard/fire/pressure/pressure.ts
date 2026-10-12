import { BaseDashboard, type BaseDashboardOptions } from '../../../base/base-dashboard'
import './pressure.css'

interface PressureOptions extends BaseDashboardOptions {
  title: string;
  code: string;
  productPropVoList: { propCode: string;dataConstraint: number[]; }[];
  textColor?: string;
}

/** 消防水压仪表盘 */
export class PressureDashboard extends BaseDashboard {
  private max = 100
  private pressureValue = 0
  private readonly textColor
  private readonly title: string
  public constructor (options: PressureOptions) {
    options.dom.classList.add('cube-pressure-dashboard')
    super(options)
    this.textColor = options.textColor ?? '#000'
    this.title = options.title
    this.setMax(options)
    this.setOptions()
  }

  public setValue (value: number): void {
    this.pressureValue = value
    this.setOptions()
    this.render()
  }

  /** 设置最大值 */
  private setMax (options: PressureOptions): void {
    const iotCode = options.productPropVoList.filter(item => item.propCode === options.code)[0]
    this.max = iotCode?.dataConstraint.length === 2 ? Math.max(iotCode?.dataConstraint[0], iotCode?.dataConstraint[1]) : 0
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
          axisLabel: {
            show: true,
            color: '#B7C1CE',
            fontSize: 8,
          },
          axisTick: {
            show: true,
            distance: 2,
            lineStyle: {
              color: '#B7C1CE',
              width: 1
            },
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
            formatter: '{value}\n' + this.title,
            color: this.textColor,
            fontSize: 14,
            lineHeight: 22,
            offsetCenter: [0, '80%'],
            show: true
          },
          axisLine: {
            lineStyle: {
              width: 8
            }
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
              value: this.pressureValue,
            }
          ]
        }
      ]
    }
  }
}
