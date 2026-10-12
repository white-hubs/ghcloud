export default () => [
  {
    uid: 'deviceName',
    dataIndex: 'deviceName',
    title: '告警点',
  },
  {
    uid: 'areaNames',
    dataIndex: 'areaNames',
    title: '所在区域',
    render(h, v, r) {
      return r ? r.areaNames.join('/') : '--';
    },
  },
  {
    uid: 'address',
    dataIndex: 'address',
    title: '地址',
  },
  {
    uid: 'alarmReason',
    dataIndex: 'alarmReason',
    title: '告警原因',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '告警时间',
  },
  {
    uid: 'handleTime',
    dataIndex: 'handleTime',
    title: '处理时间',
  },
  {
    uid: 'handleResult',
    dataIndex: 'handleResult',
    width: '100px',
    title: '结果',
    render(h, v, r) {
      return v === 'real' ? '真实报警' : v === 'error' ? '误报' : '--';
    },
  },
];
