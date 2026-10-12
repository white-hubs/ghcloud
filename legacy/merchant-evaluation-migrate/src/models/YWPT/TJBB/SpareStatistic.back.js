export default () => [
  {
    uid: 'type',
    dataIndex: 'type',
    title: '类型',
    width: '200px',
    // sorter: true,
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'status',
    dataIndex: 'status',
    title: '状态',
    width: '200px',
    // sorter: true,
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'count',
    dataIndex: 'count',
    title: '数量',
    width: '200px',
    // sorter: true,
  },
];
