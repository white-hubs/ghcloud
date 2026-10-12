export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '单号',
  },
  {
    uid: 'subType',
    dataIndex: 'subType',
    title: '出库类型',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'useDeptName',
    dataIndex: 'useDeptName',
    title: '领用部门',
  },
  {
    uid: 'userName',
    dataIndex: 'userName',
    title: '领用人',
  },
  {
    uid: 'date',
    dataIndex: 'date',
    title: '出库日期',
  },
  {
    uid: 'operatorName',
    dataIndex: 'operatorName',
    title: '经办人',
  },
  {
    uid: 'count',
    dataIndex: 'count',
    title: '出库数量',
  },
];
