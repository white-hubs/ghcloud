declare namespace Fee {

  // TreeSerch 组件相关
  interface TabPaneState {
    key: string | number;
    name: string;
  }
  interface TabState {
    list: TabPaneState[];
    activeKey: string;
  }
  interface TreeState {
    areaName: string;
    id: number | string;
    parentId: number | string;
    level?: number;
    children?: TreeState[];
  }

  // 费率价格
  interface PeriodPricesState {
    periodType: string | number | undefined; // 时段
    price: number | undefined; // 价格
  }
  // 费率时段
  interface PeriodDefinesState {
    periodType: string | number | undefined; // 选择费率
    startTime?: string | number | null | undefined;
    endTime?: string | number | null | undefined;
    time?: [string, string] | null | undefined; // 起止时间
  }
  // 阶梯价
  interface UsagePricesState {
    startUsage?: number | undefined; // 阶梯最小
    endUsage?: number | undefined; // 阶梯最大
    price?: number | undefined;
  }

  enum periodTimeType {
    GV = '谷时',
    FV = '峰时',
    JV = '尖时',
    PV = '平时',
  }
  // 分区费用 费用趋势
  interface TrendState {
    amount?: number;
    timeFlag?: number | undefined;
  }
  interface ChargeTrendState {
    fValue?: TrendState[];
    pValue?: TrendState[];
    gValue?: TrendState[];
  }

}
