export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '单号',
  },
  {
    uid: 'subType',
    dataIndex: 'subType',
    title: '入库类型',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'date',
    dataIndex: 'date',
    title: '入库日期',
  },
  {
    uid: 'warehouseName',
    dataIndex: 'warehouseName',
    title: '仓库',
  },
  {
    uid: 'operatorName',
    dataIndex: 'operatorName',
    title: '经办人',
  },
  {
    uid: 'count',
    dataIndex: 'count',
    title: '入库数量',
  },
];
