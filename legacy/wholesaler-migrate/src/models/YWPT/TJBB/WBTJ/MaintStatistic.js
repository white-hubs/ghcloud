// 类型 工单数 未完成数 已完成数 平均工单耗时 完成率
export default () => [
  {
    uid: 'type',
    dataIndex: 'type',
    title: '工单类型',
    width: '200px',
    // sorter: true,
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'source',
    dataIndex: 'type',
    title: '工单来源',
    width: '200px',
    // sorter: true,
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'ticket',
    dataIndex: 'type',
    title: '模板名称',
    width: '200px',
    // sorter: true,
    render(h, v) {
      return v || '--';
    },
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
    uid: 'user',
    dataIndex: 'userId',
    title: '用户名称',
    width: '200px',
    // sorter: true,
    render(h, v) {
      return v || '--';
    },
  },

  {
    uid: 'device',
    dataIndex: 'deviceDTOS',
    title: '设备',
    width: '300px',
    render(h, v) {
      return v?.length ? v.map((item) => item.name).join(',') : '--';
    },
  },
  {
    uid: 'total',
    dataIndex: 'total',
    title: '工单数',
    width: '100px',
  },
  {
    uid: 'uncompleted',
    dataIndex: 'uncompleted',
    title: '未完成数',
    width: '100px',
  },
  {
    uid: 'completed',
    dataIndex: 'completed',
    title: '已完成数',
    width: '100px',
  },
  {
    uid: 'averageTime',
    dataIndex: 'averageTime',
    title: '平均工单耗时',
    width: '150px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'completedPercent',
    dataIndex: 'completionRate',
    title: '完成率',
    width: '100px',
    render(h, v) {
      return v + '%';
    },
  },
];
