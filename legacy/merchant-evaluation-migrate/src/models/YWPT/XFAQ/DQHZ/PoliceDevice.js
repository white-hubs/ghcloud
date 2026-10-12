export default () => [
  {
    uid: 'date',
    dataIndex: 'date',
    title: '上报时间',
    // width: '200px',
  },
  {
    uid: 'alarmNum',
    dataIndex: 'alarmNum',
    title: '报警',
    // width: '200px',
  },
  {
    uid: 'warnNum',
    dataIndex: 'warnNum',
    title: '预警',
  },
  {
    uid: 'eventCode',
    dataIndex: 'eventCode',
    title: '编码',
    width: '190px',
  },
  {
    uid: 'areaNames',
    dataIndex: 'areaNames',
    title: '地址',
    // width: '180px',
    render(h, v) {
      return v?.length ? v.join('/') : '--';
    },
  },
  {
    uid: 'deviceCode',
    dataIndex: 'deviceCode',
    title: '设备编码',
    // width: '200px',
    sorter: true,
  },
  {
    uid: 'deviceName',
    dataIndex: 'deviceName',
    title: '设备名称',
    // width: '200px',
  },
  {
    uid: 'iotSecondCategory',
    dataIndex: 'iotSecondCategory',
    title: '报警类型',
    // width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'propertyName',
    dataIndex: 'propertyName',
    title: '线路',
    // width: '120px',
  },
  {
    uid: 'triggeTime',
    dataIndex: 'triggeTime',
    title: '报警时间',
    // width: '170px',
  },
  {
    uid: 'timeConsuming',
    dataIndex: 'timeConsuming',
    title: '耗时',
    // width: '100px',
    render(h, v) {
      return v ? v : '--';
    },
  },
  {
    uid: 'triggerCondition',
    dataIndex: 'triggerCondition',
    title: '耗时',
    // width: '100px',
    render(h, v) {
      return v ? v : '--';
    },
  },
  {
    uid: 'eventStatus',
    dataIndex: 'eventStatus',
    title: '状态',
    render(h, status) {
      return <app-dict-display value={status} />;
    },
    // width: '80px',
  },
  {
    uid: 'specification',
    dataIndex: 'iotDeviceType',
    title: '物联设备型号',
    // width: '200px',
    render(h, v) {
      return v;
    },
  },
  {
    uid: 'type',
    dataIndex: 'typeName',
    title: '类型',
    width: '200px',
    // render(h, v) {
    //   return <app-dict-display value={v} />;
    // },
  },
  // {
  //   uid: 'eventStatus',
  //   dataIndex: 'eventStatus',
  //   title: '状态',
  //   // width: '100px',
  //   // render(h, status) {
  //   //   return <app-dict-display value={status} />;
  //   // },
  // },
  {
    uid: 'dbwdA',
    dataIndex: 'dbwdA',
    title: '温度A（℃）',
    sorter: true,
    // width: '150px',
    render(h, v) {
      return v ? v + ' ℃' : '--';
    },
  },
  {
    uid: 'dbwdB',
    dataIndex: 'dbwdB',
    title: '温度B（℃）',
    sorter: true,
    render(h, v) {
      return v ? v + ' ℃' : '--';
    },
    // width: '150px',
  },
  {
    uid: 'dbwdC',
    dataIndex: 'dbwdC',
    title: '温度C（℃）',
    sorter: true,
    render(h, v) {
      return v ? v + ' ℃' : '--';
    },
    // width: '150px',
  },
  {
    uid: 'ldlZl',
    dataIndex: 'ldlZl',
    title: '漏电流（mA）',
    sorter: true,
    render(h, v) {
      return v ? v + ' mA' : '--';
    },
  },
  {
    uid: 'updateTime',
    dataIndex: 'updateTime',
    title: '上报时间',
    // width: '200px',
    sorter: true,
  },

  {
    uid: 'updateHour',
    dataIndex: 'updateHour',
    title: '上报时间',
  },
  {
    uid: 'underVoltageAlarmNum',
    dataIndex: 'underVoltageAlarmNum',
    title: '欠压报警',
  },
  {
    uid: 'underVoltageWarningNum',
    dataIndex: 'underVoltageWarningNum',
    title: '欠压预警',
  },
  {
    uid: 'overVoltageAlarmNum',
    dataIndex: 'overVoltageAlarmNum',
    title: '过压报警',
  },
  {
    uid: 'overVoltageWarningNum',
    dataIndex: 'overVoltageWarningNum',
    title: '过压预警',
  },
  {
    uid: 'overCurrentNum',
    dataIndex: 'overCurrentNum',
    title: '过流报警',
  },
  {
    uid: 'currentNum',
    dataIndex: 'currentNum',
    title: '电流预警',
  },
  {
    uid: 'overloadNum',
    dataIndex: 'overloadNum',
    title: '过载报警',
  },
  {
    uid: 'unbalanceAlarmNum',
    dataIndex: 'unbalanceAlarmNum',
    title: '不平衡报警',
  },
  {
    uid: 'inputlossphaseNum',
    dataIndex: 'inputlossphaseNum',
    title: '输入缺相',
  },
  {
    uid: 'phasesequenceNum',
    dataIndex: 'phasesequenceNums',
    title: '相序ACB',
  },
];
