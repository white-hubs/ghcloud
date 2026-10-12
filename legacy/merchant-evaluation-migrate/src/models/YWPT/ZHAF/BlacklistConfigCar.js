export default () => [
  {
    uid: 'code',
    dataIndex: 'id',
    title: '编号',
    width: '200px',
    // sorter: true,
  },
  {
    uid: 'brand',
    dataIndex: 'brand',
    title: '品牌',
    width: '100px',
  },
  {
    uid: 'color',
    dataIndex: 'color',
    title: '颜色',
    width: '100px',
  },
  {
    uid: 'type',
    dataIndex: 'type',
    title: '车牌类型',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'plate',
    dataIndex: 'plate',
    title: '车牌号',
    width: '200px',
  },
  {
    uid: 'alarmNum',
    dataIndex: 'alarmNum',
    title: '告警次数',
    width: '100px',
  },
  {
    uid: 'source',
    dataIndex: 'source',
    title: '黑名单来源',
    width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'createBy',
    dataIndex: 'createBy',
    title: '创建用户',
    width: '100px',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
  },
];
