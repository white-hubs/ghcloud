import * as echarts from "echarts";

function guidGenerator(): string {
  const S4 = function (): string {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

export interface BaseDashboardOptions {
  dom: HTMLElement;
}
export class BaseDashboard {
  public static chartInstanceMap = new Map<string, echarts.ECharts>();
  public static destroyAll(): void {
    BaseDashboard.chartInstanceMap.forEach((map, key) => {
      map.dispose();
      BaseDashboard.chartInstanceMap.delete(key);
    });
  }

  protected chartOption: echarts.EChartsOption | undefined = undefined;
  private readonly dom: HTMLElement;
  private readonly chartInstance: echarts.ECharts;
  private readonly chartInstanceId: string;

  public constructor(options: BaseDashboardOptions) {
    this.dom = options.dom;
    this.chartInstanceId = guidGenerator();
    this.chartInstance = echarts.init(this.dom);
    BaseDashboard.chartInstanceMap.set(this.chartInstanceId, this.chartInstance);
    window.addEventListener("resize", this.resize);
  }

  public render(): void {
    this.chartOption && this.chartInstance.setOption(this.chartOption);
  }

  public destroy(chartInstanceId?: string): void {
    BaseDashboard.chartInstanceMap.get(chartInstanceId ?? this.chartInstanceId)?.dispose();
    BaseDashboard.chartInstanceMap.delete(this.chartInstanceId);
  }

  private readonly resize = (): void => {
    if (this.chartInstance) {
      this.chartInstance.resize();
    } else {
      window.removeEventListener("resize", this.resize);
    }
  };
}
