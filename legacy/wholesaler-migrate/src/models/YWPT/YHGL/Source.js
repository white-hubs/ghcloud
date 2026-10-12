export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '隐患来源',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
      // return v;
    },
  },
  {
    uid: 'handledTotal',
    dataIndex: 'handledTotal',
    title: '隐患总数',
  },
  {
    uid: 'notHandleTotal',
    dataIndex: 'notHandleTotal',
    title: '未处理',
  },
  {
    uid: 'progressTotal',
    dataIndex: 'progressTotal',
    title: '处理中',
  },
  {
    uid: 'total',
    dataIndex: 'total',
    title: '已完成',
  },
];
