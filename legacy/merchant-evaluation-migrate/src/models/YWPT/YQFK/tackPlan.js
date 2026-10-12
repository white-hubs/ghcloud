export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '任计划名称',
  },
  {
    uid: 'cycleType',
    dataIndex: 'cycleType',
    title: '执行周期',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'beginTime',
    dataIndex: 'beginTime',
    title: '生效时间',
  },
  {
    uid: 'endTime',
    dataIndex: 'endTime',
    title: '失效时间',
  },
  {
    uid: 'enabled',
    dataIndex: 'enabled',
    title: '状态',
    render(h, v) {
      return v ? '开启' : '关闭';
    },
  },
];
