export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '210px',
    sorter: true,
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
    width: '240px',
  },
  {
    uid: 'description',
    dataIndex: 'description',
    title: '描述',
    // width: '200px',
  },
  {
    uid: 'type',
    dataIndex: 'type',
    title: '类型',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'source',
    dataIndex: 'sourceType',
    title: '来源',
    width: '120px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'startTime',
    dataIndex: 'startTime',
    title: '发起时间',
    // width: '200px',
  },
  {
    uid: 'startDeptName',
    dataIndex: 'startDeptName',
    title: '部门',
    width: '120px',
  },
  {
    uid: 'startNickname',
    dataIndex: 'startNickname',
    title: '发起人',
    width: '120px',
  },
  {
    uid: 'handler',
    dataIndex: 'handler',
    title: '处理人',
    width: '100px',
  },
  {
    uid: 'endTime',
    dataIndex: 'endTime',
    title: '处理时间',
    // width: '200px',
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
  {
    uid: 'isEvaluate',
    dataIndex: 'isEvaluate',
    title: '评价',
    width: '100px',
    render(h, v) {
      return v ? '已评价' : '未评价';
    },
    // width: '200px',
  },
];
