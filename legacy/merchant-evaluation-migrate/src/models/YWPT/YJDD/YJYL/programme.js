export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
  },
  {
    uid: 'theme',
    dataIndex: 'theme',
    title: '演练主题',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'createBy',
    dataIndex: 'createBy',
    title: '创建人',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
  },
];
