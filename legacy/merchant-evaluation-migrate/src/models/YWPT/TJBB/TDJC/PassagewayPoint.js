/**
 * 列表显示：名称、报警数、未处理报警数、已处理报警数、
 * 体温异常数、未佩戴口罩数、真实报警数、真实报警率、
 * 误报数、体温异常真实报警数、未佩戴口罩真实报警数、报警平均处理耗时；
 */
export default () => [
  {
    uid: 'deviceName',
    dataIndex: 'deviceName',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'alarmNum',
    dataIndex: 'alarmNum',
    title: '报警数',
    width: '100px',
  },
  {
    uid: 'notHandledNum',
    dataIndex: 'notHandledNum',
    title: '未处理报警数',
    width: '100px',
  },
  {
    uid: 'handledNum',
    dataIndex: 'handledNum',
    title: '已处理报警数',
    width: '100px',
  },
  {
    uid: 'abnormalTempNum',
    dataIndex: 'abnormalTempNum',
    title: '体温异常数',
    width: '100px',
  },
  {
    uid: 'noMaskNum',
    dataIndex: 'noMaskNum',
    title: '未佩戴口罩数',
    width: '100px',
  },
  {
    uid: 'realAlarmNum',
    dataIndex: 'realAlarmNum',
    title: '真实报警数',
    width: '100px',
  },
  {
    uid: 'realAlarmRate',
    dataIndex: 'realAlarmRate',
    title: '真实报警率',
    width: '100px',
    render(h, v) {
      return v + '%';
    },
  },
  {
    uid: 'errorAlarmNum',
    dataIndex: 'errorAlarmNum',
    title: '误报数',
    width: '100px',
  },
  {
    uid: 'abnormalTempRealAlarmNum',
    dataIndex: 'abnormalTempRealAlarmNum',
    title: '体温异常真实报警数',
    width: '100px',
  },
  {
    uid: 'noMaskRealAlarmNum',
    dataIndex: 'noMaskRealAlarmNum',
    title: '未佩戴口罩真实报警数',
    width: '100px',
  },
  {
    uid: 'averageTimeMinute',
    dataIndex: 'averageTimeMinute',
    title: '报警平均处理耗时',
    width: '100px',
  },
];
