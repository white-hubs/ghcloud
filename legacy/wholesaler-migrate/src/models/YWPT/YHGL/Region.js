export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '所属区域',
    width: '100px',
    render(h, v) {
      // return v?.length ? v.join('/') : '--';
      return v;
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
