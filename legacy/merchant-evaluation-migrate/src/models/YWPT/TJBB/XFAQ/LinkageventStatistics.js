// 区域
// 监测设备数
// 报警数
// 未处理报警数
// 已处理报警数
// 温度
// 漏电流
// 漏电报警
// 温度报警
// 短路报警
// 过欠压
// 过流过载
// 电弧报警
// 三相报警
// 设备报警率
// 平均报警处理耗时
// 处理完成率
export default () => [
  {
    uid: 'date',
    dataIndex: 'time',
    title: '日期',
    width: '200px',
    // sorter: true,
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'deviceName',
    dataIndex: 'deviceName',
    title: '设备名称',
    width: '200px',
    // sorter: true,
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'runningDays',
    dataIndex: 'runningDays',
    title: '运行天数',
    width: '100px',
    // sorter: true,
    // render(h, v) {
    //   return v || '--';
    // },
  },
  {
    uid: 'offlineDays',
    dataIndex: 'offlineDays',
    title: '离线天数',
    width: '100px',
    // sorter: true,
    // render(h, v) {
    //   return v || '--';
    // },
  },
  {
    uid: 'area',
    dataIndex: 'areaNames',
    title: '区域',
    width: '300px',
    render(h, v) {
      return v?.length ? v.join('/') : '--';
    },
  },
  {
    uid: 'device',
    dataIndex: 'device',
    title: '监测设备数',
    width: '200px',
    // sorter: true,
    render(h, v) {
      return v || '0';
    },
  },
  {
    uid: 'alarm',
    dataIndex: 'alarm',
    title: '报警数',
    width: '100px',
  },
  {
    uid: 'notHandleAlarm',
    dataIndex: 'notHandleAlarm',
    title: '未处理报警数',
    width: '150px',
  },
  {
    uid: 'handleAlarm',
    dataIndex: 'handleAlarm',
    title: '已处理报警数',
    width: '150px',
  },
  {
    uid: 'electricLeakage',
    dataIndex: 'electricLeakage',
    title: '漏电报警',
    width: '150px',
  },
  {
    uid: 'temperature',
    dataIndex: 'temperature',
    title: '温度报警',
    width: '100px',
  },
  {
    uid: 'shortCircuit',
    dataIndex: 'shortCircuit',
    title: '短路报警',
    width: '100px',
  },
  {
    uid: 'underVoltage',
    dataIndex: 'underVoltage',
    title: '过欠压',
    width: '100px',
  },
  {
    uid: 'overCurrentOverload',
    dataIndex: 'overCurrentOverload',
    title: '过流过载',
    width: '100px',
  },
  {
    uid: 'arc',
    dataIndex: 'arc',
    title: '电弧报警',
    width: '100px',
  },
  {
    uid: 'threePhase',
    dataIndex: 'threePhase',
    title: '三相报警',
    width: '100px',
  },
  {
    uid: 'alarmRate',
    dataIndex: 'alarmRate',
    title: '设备报警率',
    width: '120px',
    render(h, v) {
      return (v ? v : 0) + '%';
    },
  },
  {
    uid: 'averageTime',
    dataIndex: 'averageTime',
    title: '平均报警处理耗时',
    width: '150px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'handleRate',
    dataIndex: 'handleRate',
    title: '处理完成率',
    width: '150px',
    render(h, v) {
      return (v ? v : 0) + '%';
    },
  },
];
