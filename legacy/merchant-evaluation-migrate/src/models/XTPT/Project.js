export default () => [
  {
    uid: 'id',
    dataIndex: 'id',
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
    uid: 'address',
    dataIndex: 'address',
    title: '地址',
    width: '200px',
    render(h, v, r) {
      return [r.latitude, r.longitude].join(',');
    },
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
  },
  {
    uid: 'managers',
    dataIndex: 'managers',
    title: '管理员',
    width: '100px',
    render(h, v) {
      return v?.length || 0;
    },
  },
  {
    uid: 'enabled',
    dataIndex: 'enabled',
    title: '状态',
    width: '100px',
    render(h, enabled) {
      return <app-enabled-display enabled={enabled} />;
    },
  },
];
