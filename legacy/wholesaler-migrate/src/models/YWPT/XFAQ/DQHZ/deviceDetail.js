export default () => [
  {
    uid: 'areaNames',
    dataIndex: 'areaNames',
    title: '地址',
    // width: '300px',
    render(h, v, r) {
      return r.areaNames?.join('/') || '--';
    },
  },
  {
    uid: 'triggerTime',
    dataIndex: 'triggerTime',
    title: '报警时间',
    // width: '200px',
    sorter: true,
  },
  {
    uid: 'circuit',
    dataIndex: 'circuit',
    title: '线路',
    // width: '200px',
  },
  {
    uid: 'alarmType',
    dataIndex: 'alarmType',
    title: '报警类型',
    // width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },

  {
    uid: 'eventStatus',
    dataIndex: 'eventStatus',
    title: '状态',
    // width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'consumingTime',
    dataIndex: 'consumingTime',
    title: '耗时',
    // width: '200px',
  },
];
