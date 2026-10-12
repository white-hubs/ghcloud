import { BaseDashboard, type BaseDashboardOptions } from '../../../base/base-dashboard'
import './temperature.css'

interface TemperatureOptions extends BaseDashboardOptions {
  title: string;
  code: string;
  productPropVoList: { propCode: string;dataConstraint: number[]; }[];
  textColor?: string;
}

/** 电压仪表盘 */
export class TemperatureDashboard extends BaseDashboard {
  private max = 500
  private temperatureValue = 0
  private readonly valueDom: HTMLElement
  public constructor (options: TemperatureOptions) {
    const parentDom = options.dom
    parentDom.classList.add('cube-temperature-dashboard')

    const charDom = document.createElement('div')
    charDom.classList.add('cube-temperature-echart')

    const temperatureInfoDom = document.createElement('div')
    temperatureInfoDom.classList.add('cube-temperature-info')

    const titleDom = document.createElement('span')
    titleDom.innerText = options.title
    const valueDom = document.createElement('span')

    temperatureInfoDom.appendChild(titleDom)
    temperatureInfoDom.appendChild(valueDom)
    parentDom.appendChild(charDom)
    parentDom.appendChild(temperatureInfoDom)
    options.dom = charDom
    super(options)
    this.valueDom = valueDom
    this.setMax(options)
    this.setOptions()
  }

  public setValue (value: number | string): void {
    if (value) {
      this.temperatureValue = value as number
      typeof value === 'number' && (value = value.toFixed(2))
      typeof value === 'string' && (value = parseFloat(value).toFixed(2))
    }
    this.valueDom.innerText = `${value}°C`
    this.setOptions()
    this.render()
  }

  /** 设置最大值 */
  private setMax (options: TemperatureOptions): void {
    const iotCode = options.productPropVoList.filter(item => item.propCode === options.code)[0]
    this.max = iotCode?.dataConstraint.length === 2 ? Math.max(iotCode?.dataConstraint[0], iotCode?.dataConstraint[1]) : 0
  }

  /** 生成Echart配置 */
  private setOptions (): void {
    this.chartOption = {
      series: [
        {
          type: 'gauge',
          center: ['50%', '56%'],
          max: this.max,
          pointer: {
            itemStyle: {
              color: '#1578FF'
            },
            icon: 'triangle'
          },
          axisLabel: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          detail: {
            show: false
          },
          axisLine: {
            show: true,
            lineStyle: {
              width: 6,
              shadowBlur: 0,
            }
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 6,
            itemStyle: {
              borderWidth: 4,
              borderColor: '#1578FF'
            }
          },
          progress: {
            show: true,
            width: 6,
            itemStyle: {
              color: '#1578FF'
            }
          },
          data: [
            {
              value: this.temperatureValue,
            }
          ]
        }
      ]
    }
  }
}
