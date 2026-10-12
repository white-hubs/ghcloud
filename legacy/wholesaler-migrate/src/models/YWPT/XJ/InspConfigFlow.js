export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '200px',
    sorter: true,
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'type',
    dataIndex: 'type',
    title: '分类',
    width: '200px',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
  },
  // {
  //   uid: 'status',
  //   dataIndex: 'status',
  //   title: '状态',
  //   width: '200px',
  //   render(h, enabled) {
  //     return <app-enabled-display enabled={enabled} />;
  //   },
  // },
];
