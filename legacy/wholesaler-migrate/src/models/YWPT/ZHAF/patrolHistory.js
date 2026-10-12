export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '220px',
    sorter: true,
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '路线名称',
    // width: '200px',
  },
  {
    uid: 'pointNum',
    dataIndex: 'pointNum',
    title: '巡逻点数',
    width: '100px',
    align: 'center',
  },
  {
    uid: 'nickname',
    dataIndex: 'nickname',
    title: '提交用户',
    // width: '200px',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '开始时间',
    width: '200px',
  },
  {
    uid: 'endTime',
    dataIndex: 'endTime',
    title: '结束时间',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'status',
    dataIndex: 'status',
    title: '状态',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
];
