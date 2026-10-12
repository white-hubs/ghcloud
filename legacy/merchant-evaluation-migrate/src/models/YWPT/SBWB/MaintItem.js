export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'resultType',
    dataIndex: 'resultType',
    title: '结果类型',
    width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
];
