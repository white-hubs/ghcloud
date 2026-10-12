export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '单号',
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '分类名称',
  },
  {
    uid: 'unit',
    dataIndex: 'unit',
    title: '计量单位',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
  },
];
