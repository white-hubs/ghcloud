export default () => [
  {
    uid: 'stockingCode',
    dataIndex: 'stockingCode',
    title: '任务编号',
  },
  {
    uid: 'stockingName',
    dataIndex: 'stockingName',
    title: '任务名称',
  },
  {
    uid: 'username',
    dataIndex: 'username',
    title: '盘点人',
  },
  {
    uid: 'result',
    dataIndex: 'result',
    title: '盘点状态',
    render(h, v) {
      return v ? <app-dict-display value={v} /> : '未盘';
    },
  },
  {
    uid: 'time',
    dataIndex: 'time',
    title: '盘点时间',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'remark',
    dataIndex: 'remark',
    title: '原因',
    render(h, v) {
      return v || '--';
    },
  },
];
