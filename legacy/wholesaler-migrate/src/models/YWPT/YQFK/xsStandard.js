export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '标准名称',
  },
  {
    uid: 'config',
    dataIndex: 'config',
    title: '标准名称',
  },
  {
    uid: 'type',
    dataIndex: 'type',
    title: '标准属性',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'remark',
    dataIndex: 'remark',
    title: '备注',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
  },
];
