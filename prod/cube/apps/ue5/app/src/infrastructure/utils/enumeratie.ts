import { ref } from "vue";
export default () => {
  const alarmLeaveOptions = ref([
    {
      label: "一级报警",
      value: "one_level",
      color: "#FF4070",
    },
    {
      label: "二级报警",
      value: "two_level",
      color: "#FBA33F",
    },
    {
      label: "三级报警",
      value: "three_level",
      color: "#5654F5",
    },
    {
      label: "四级报警",
      value: "four_level",
      color: "#1890FF",
    },
  ]);
  const alarmStatusOptions = ref([
    {
      label: "待确认",
      value: "ALARM_UN_CONFIRMED",
      color: "#29C2FF",
    },
    {
      label: "处理中",
      value: "ALARM_PROGRESS_CONFIRMED",
      color: "#FFC700",
    },
    {
      label: "已挂起",
      value: "ALARM_SUSPEND",
      color: "#74AEE7",
    },
    {
      label: "已处理",
      value: "ALARM_HANDLER",
      color: "#00F27B",
    },
  ]);
  return {
    alarmLeaveOptions,
    alarmStatusOptions,
  };
};
/**
 * 目前暂时是用设备类型名称对应ue模型中设备类型图标，后续需要将设备类型做为数据字典，设备类型带code，通过code来对应
 */
export enum DeviceTypeIcon {
  "视频监控" = 1, //监控枪机设备,
  "NVR/DVR" = 1,
  "高清枪式摄像机" = 1,
  "摄像机" = 1,
  "高清球式摄像机" = 1,
  "高清半球摄像机" = 2,
  "球机B" = 3,
  "消火栓" = 4,
  "消防栓" = 4,
  "电气" = 5, //电气设备
  "电力与变配电" = 5,
  "电力监测点" = 5,
  "变压器及温控" = 5,
  "功率补偿柜" = 5,
  "照明" = 6, //智能照明
  "照明系统" = 6,
  "控制设备" = 6,
  "空调" = 7, //空调设备
  "通风与空调" = 7,
  "大型空调/环境冷热源" = 7,
  "排风" = 8,
  "通风设备" = 8, //排风设备
  "排水" = 9,
  "机房" = 10, //机房设备
  "备用动力设备" = 10,
  "发电机组" = 10,
  "广播" = 11, //广播设备
  "环境广播" = 11,
  "扬声器/扬声器回路" = 11,
  "功放" = 11,
  "门禁" = 12, //门禁设备
  "防火卷帘门" = 12,
  "人员通行" = 12,
  "密码门禁" = 12,
  "电梯" = 13, //电梯设备
  "电梯与控制系统" = 13,
  "梯控设备" = 13,
  "自动扶梯、人行道" = 13,
  "曳引式电梯" = 13,
  "液压电梯" = 13,
  "UPS" = 14,
  "温湿度" = 15, //温湿度传感器
  "氧气瓶" = 15, //温湿度传感器
  "通用传感器" = 15,
  "水浸/漏水" = 15,
  "空气质量" = 15,
  "烟感" = 16, //烟感
  "感烟探测器" = 16,
  "可燃物探测器" = 16,
  "电表箱" = 17, //电表箱
  "能源监测" = 17,
  "冷/热能表" = 17,
  "气表" = 17,
  "电表" = 17,
  "水表" = 17,
  "床头分机" = 18,
  "灯带" = 19, //灯带
  "照明回路" = 19,
  "电子显示屏" = 20, //电子显示屏
  "信息显示" = 20,
  "电子信息显示机柜" = 20,
  "显示屏" = 20,
  "分诊排号系统" = 20,
  "呼吸机" = 20,
  "医疗设备" = 20,
  "流量计" = 21,
  "气体报警箱" = 22,
  "签到机" = 23,
  "浅污泵" = 24, //浅污泵
  "消防水泵" = 24,
  "人脸机" = 25, //人脸机
  "人脸识别机" = 25,
  "示教前端机" = 26,
  "示教终端机" = 27,
  "手报" = 28, //手报
  "智能分析类" = 28,
  "电能分析仪" = 28,
  "视频辅助" = 28,
  "手持对讲机" = 29,
  "刷卡机" = 30,
  "水表箱" = 31,
  "停车位" = 32, //停车位
  "车辆管理" = 32,
  "压力计" = 33,
  "闸机" = 34,
  "主机" = 35, //主机
  "电池组" = 35,
  "车位探测器" = 36, //车位
  "车位引导类设备" = 36,
  "车位传感器" = 36,
  "道闸" = 37, //道闸
  "道闸一体机" = 37,
  "低压空气断路器" = 38,
  "发电机" = 39,
  "风机盘管" = 40,
  "扶梯" = 41,
  "功率放大器" = 42,
  "红外探测器" = 43,
  "呼叫站" = 44,
  "紧急按钮" = 45,
  "精密空调" = 46,
  "控制主机" = 47,
  "冷冻机组" = 48,
  "冷却泵" = 49,
  "冷却塔" = 50,
  "配电柜/箱" = 51,
  "生活水箱" = 52,
  "声光报警器" = 53,
  "手动报警器" = 53,
  "消防安全" = 16,
  "消防喷淋设备" = 16,
  "消防主机" = 16,
  "温感" = 16,
  "温感探测器" = 16,
  "感温探测器" = 16,
  "水泵" = 54,
  "温控仪变压器" = 55,
  "智能气表" = 56,
  "充电桩" = 57,
  "灭火器" = 58,
  "水压监测" = 59,
  "理货机" = 60,
  "温控" = 61,
  "污水处理" = 62,
  "新风设备" = 63,
  "档位" = 64,
  "考勤机" = 65,
  "气体监测" = 66,
  "入侵报警" = 67, //入侵报警
  "入侵报警系统" = 67,
  "消防水压监测" = 68,
  "消防水压传感器" = 68,
  "温湿度监测设备" = 69,
  "巡更点" = 70,
  "风险源" = 71,
  "资产" = 72,
  "计算机网络" = 73,
  "无线通讯" = 74,
  "可视对讲" = 101,
}

export function getDeviceTypeIcon(...names: unknown[]): number {
  const candidates = names
    .flatMap((name) => String(name ?? "").split("/"))
    .map((name) => name.trim())
    .filter(Boolean);

  for (const name of candidates) {
    const icon = DeviceTypeIcon[name as keyof typeof DeviceTypeIcon];
    if (typeof icon === "number") {
      return icon;
    }
  }

  return DeviceTypeIcon["视频监控"];
}
/**
 * 设计枚举对应设备ICon图标
 */
export enum DeviceIcon {
  "车辆管理" = "parking-space", //停车位图片icon
  "车位引导类设备" = "parking-space",
  "车位传感器" = "parking-space",
  "道闸一体机" = "parking-space",
  "人员通行" = "access-control", //门禁设备
  "考勤机" = "check-in-machine", //签到机
  "闸机" = "gate", //闸机
  "门禁" = "access-control",
  "密码门禁" = "access-control",
  "人脸识别机" = "facial-recognition-machine", //人脸机
  "人脸门禁" = "facial-recognition-machine",
  "电力与变配电" = "electrical-device", //电气设备
  "电力监测点" = "electrical-device",
  "配电柜/箱" = "distribution-box", //配电箱
  "变压器及温控" = "electrical-device",
  "功率补偿柜" = "electrical-device",
  "照明系统" = "intell-lighting", //智能照明
  "控制设备" = "intell-lighting",
  "照明回路" = "light-strip", //灯带
  "环境广播" = "broadcast-device", //广播设备
  "控制主机" = "broadcast-device",
  "扬声器/扬声器回路" = "broadcast-device",
  "功放" = "broadcast-device",
  "视频监控" = "monitor-gun-device", //监控枪机设备,
  "NVR/DVR" = "monitor-gun-device",
  "高清球式摄像机" = "monitor-ball-machine-device-2", //监控球机设备-2,
  "高清半球摄像机" = "monitor-ball-machine-device", //监控球机设备,
  "高清枪式摄像机" = "monitor-gun-device",
  "摄像机" = "monitor-gun-device",
  "能源监测" = "electric-meter-box", //电表箱
  "冷/热能表" = "electric-meter-box", //电表箱
  "气表" = "electric-meter-box", //电表箱
  "电表" = "electric-meter-box", //电表箱
  "水表" = "electric-meter-box", //电表箱
  "备用动力设备" = "smart-ups-rt", //机房设备
  "发电机组" = "host", //机房设备
  "电池组" = "smart-ups-rt", //主机
  "UPS" = "ups", //主机
  "入侵报警系统" = "intrusion-alarm", //入侵报警
  "区域感知" = "intrusion-alarm",
  "报警点" = "intrusion-alarm",
  "通风与空调" = "air-conditioning-device", //空调设备
  "大型空调/环境冷热源" = "air-conditioning-device", //空调设备
  "空调" = "air-conditioning-device", //空调设备
  "通风设备" = "air-exhaust-device", //排风设备
  "信息显示" = "electron-display-screen", //电子显示屏
  "电子信息显示机柜" = "electron-display-screen", //电子显示屏
  "显示屏" = "electron-display-screen", //电子显示屏
  "消防安全" = "fire-fighting-device", //消防设备
  "消防水压传感器" = "fire-fighting-water-pressure-device", //消防水压设备
  "声光报警器" = "fire-fighting-device",
  "消防水泵" = "shallow-sewage-pump", //浅污泵
  "消火栓" = "fire-hydrant", //消火栓
  "消防喷淋设备" = "fire-fighting-device",
  "防火卷帘门" = "fire-fighting-device",
  "手动报警器" = "fire-fighting-device",
  "温感探测器" = "fire-fighting-device",
  "感烟探测器" = "smoke-detector", //烟感
  "可燃物探测器" = "fire-fighting-device",
  "消防主机" = "fire-fighting-device",
  "智能分析类" = "hand-report", //手报
  "视频辅助" = "hand-report", //手报
  "通用传感器" = "temp-humid-sensor", //温湿度传感器
  "水浸/漏水" = "temp-humid-sensor", //温湿度传感器
  "空气质量" = "temp-humid-sensor", //温湿度传感器
  "温湿度" = "temp-humid-sensor", //温湿度传感器
  "网络通信类设备" = "host", //主机
  "物联协议网关" = "host", //主机
  "无线AP/AC" = "host", //主机
  "网络交换类设备" = "host", //主机
  "网络路由类设备" = "host", //主机
  "电梯与控制系统" = "lift-device", //电梯设备
  "梯控设备" = "lift-device", //电梯设备
  "自动扶梯、人行道" = "lift-device", //电梯设备
  "曳引式电梯" = "lift-device", //电梯设备
  "液压电梯" = "lift-device", //电梯设备
}
export enum DeviceStatusCode {
  "ALARM" = 1,
  "TROUBLE" = 3,
  "OFFLINE" = 2,
  "NORMAL" = 0,
}
export const marketlist = [
  "宁夏海吉星",
  "广西新柳邕",
  "惠州海吉星",
  "沈阳海吉星",
  "长春海吉星",
  "深圳光明海吉星",
  "深圳平湖海吉星",
  "天津静海海吉星",
  "上海农批",
  "湖南长沙海吉星",
  "广西新柳邕海吉星",
  "安徽蚌埠海吉星",
  "广西南宁海吉星",
  "成都农批",
  "广东惠州海吉星",
  "湖南岳阳海吉星",
  "安徽安庆海吉星",
  "南昌",
  "深圳福田农批",
  "西安海吉星",
  "九江农批",
];

export function getRandomFive(length = 5) {
  var five = marketlist.length < length ? marketlist.length : length;
  var result = Array.from({ length: five });
  for (var i = 0; i < five; i++) {
    var randomIndex = Math.floor(Math.random() * marketlist.length);
    result[i] = marketlist[randomIndex];
  }
  return result;
}
export function getrandom(value = 1000) {
  return Math.floor(Math.random() * value) + 1;
}
export const DeviceAlarmType = {
  火: "FireBig",
  烟: "SmokeA",
  蒸汽: "SteamA",
  水: "WaterLeakA",
};
