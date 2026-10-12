import { BaseDashboard, type BaseDashboardOptions } from '../../../base/base-dashboard'
import './current.css'

interface CurrentOptions extends BaseDashboardOptions {
  title: string;
  code: string;
  productPropVoList: { propCode: string;dataConstraint: number[]; }[];
  textColor?: string;
}

/** 电流仪表盘 */
export class CurrentDashboard extends BaseDashboard {
  private max = 320
  private currentValue = 0
  private readonly textColor
  private readonly title: string
  public constructor (options: CurrentOptions) {
    options.dom.classList.add('cube-current-dashboard')
    super(options)
    this.textColor = options.textColor ?? '#000'
    this.title = options.title
    this.setMax(options)
    this.setOptions()
  }

  public setValue (value: number): void {
    this.currentValue = value ? value: 0
    this.setOptions()
    this.render()
  }

  /** 设置最大值 */
  private setMax (options: CurrentOptions): void {
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
          detail: {
            valueAnimation: true,
            formatter: '{value}A\n' + this.title,
            color: this.textColor,
            fontSize: 14,
            lineHeight: 22,
            offsetCenter: [0, '80%'],
            show: true
          },
          data: [
            {
              value: this.currentValue,
            }
          ]
        }
      ]
    }
  }
}
