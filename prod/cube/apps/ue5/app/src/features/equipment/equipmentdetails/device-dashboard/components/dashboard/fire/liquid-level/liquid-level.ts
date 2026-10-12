import { BaseDashboard, type BaseDashboardOptions } from "../../../base/base-dashboard";

import "./liquid-level.css";

interface LiquidLevelOptions extends BaseDashboardOptions {
  title: string;
  code: string;
  productPropVoList: { propCode: string; dataConstraint: number[] }[];
  textColor?: string;
  titleColor?: string;
}

/** 消防水压仪表盘 */
export class LiquidLevelDashboard extends BaseDashboard {
  private max = 100;
  private liquidLevelValue = 0;
  private readonly textColor;
  private readonly title: string;
  private readonly titleDom: HTMLElement;
  public constructor(options: LiquidLevelOptions) {
    const parentDom = options.dom;
    parentDom.classList.add("cube-liquid-level-dashboard");
    const charDom = document.createElement("div");
    charDom.classList.add("cube-liquid-level-chart");
    const titleDom = document.createElement("div");
    titleDom.classList.add("cube-liquid-level-title");
    parentDom.appendChild(charDom);
    parentDom.appendChild(titleDom);
    options.dom = charDom;
    super(options);
    this.titleDom = titleDom;
    this.textColor = options.textColor ?? "#000";
    this.titleDom.style.color = options.titleColor ?? "#000";
    this.title = options.title;
    this.setMax(options);
    this.setOptions();
  }

  public setValue(value: number): void {
    this.liquidLevelValue = value;
    this.titleDom.innerText = `${this.title} ${value} ㎡`;
    this.setOptions();
    this.render();
  }

  /** 设置最大值 */
  private setMax(options: LiquidLevelOptions): void {
    const iotCode = options.productPropVoList.filter((item) => item.propCode === options.code)[0];
    this.max = iotCode?.dataConstraint.length === 2 ? Math.max(iotCode?.dataConstraint[0], iotCode?.dataConstraint[1]) : 0;
  }

  /** 生成Echart配置 */
  private setOptions(): void {
    this.chartOption = {
      // @ts-expect-error
      series: [
        {
          type: "liquidFill",
          name: "Liquid Fill1",
          radius: "80%",
          center: ["50%", "50%"],
          itemStyle: {
            opacity: 0.7,
            shadowBlur: 0,
          },
          data: [
            {
              name: "score",
              direction: "right",
              value: (this.liquidLevelValue / this.max).toFixed(2),
              itemStyle: {
                opacity: 1,
                normal: {
                  color: "#10B9FF",
                },
              },
            },
            {
              name: "score",
              direction: "right",
              value: (this.liquidLevelValue / this.max).toFixed(2),
              itemStyle: {
                opacity: 1,
                normal: {
                  color: "#10B9FF",
                },
              },
            },
          ],
          backgroundStyle: {
            color: "#f3fbff",
          },
          label: {
            color: "#fff",
            normal: {
              textStyle: {
                fontSize: 18,
                color: this.textColor,
              },
              formatter: function formatter() {
                return this.liquidLevelValue + "㎡";
              },
            },
          },
          // 外部细圆
          outline: {
            show: true,
            borderDistance: 6, // 外部圆线距离水球的距离
            itemStyle: {
              borderWidth: 3,
              borderColor: "#10B9FF",
            },
          },
        },
      ],
    };
  }
}
