export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '题目内容',
  },
  {
    uid: 'theme',
    dataIndex: 'theme',
    title: '主题',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'type',
    dataIndex: 'type',
    title: '类型',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'updateBy',
    dataIndex: 'updateBy',
    title: '创建人',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
  },
];
