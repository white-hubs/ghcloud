export default () => [
  {
    uid: 'beginTime',
    dataIndex: 'beginTime',
    title: '时间',
    // width: '300px',
    render(h, v, r) {
      //r 拿到整个对象信息
      return v;
    },
  },
  {
    uid: 'subType',
    dataIndex: 'subType',
    title: '警报类型',
    // width: '200px',
    sorter: true,
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'status',
    dataIndex: 'status',
    title: '报警状态',
    // width: '200px',
    render(h, v, r) {
      return v == 'alarmStatus_not_handled' ? '未处理' : '已处理';
    },
  },
  {
    uid: 'eventStatus',
    dataIndex: 'eventStatus',
    title: '操作',
    // width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
];
