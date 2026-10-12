declare namespace Details {
  interface deviceDetailsType {
    objectType: string;
    // 对象类型
    deviceObject: string;
    // 对象id
    areaName: string | undefined;
    // 区域
    controlTime: string;
    // 控制时间点
    openGate: number;
    // 开关值
    brightness: number;
    // 光照度
    deviceName: string | undefined;
    id?: string;
  }
  interface AddDetails {
    planName: string;
    // 计划名称
    planStartTime: string;
    // 计划开始时间
    planEndTime: string;
    // 计划结束时间
    enabled: boolean;
    // 是否启用
    timeCycle: CheckboxValueType;
    // 时间周期:

    deviceDetails: deviceDetailsType[];
  }
}
