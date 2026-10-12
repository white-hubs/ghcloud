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
    uid: 'category',
    dataIndex: 'category',
    title: '类型',
    width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'createUser',
    dataIndex: 'createBy',
    title: '创建人',
    width: '200px',
  },
  {
    uid: 'types',
    dataIndex: 'types',
    title: '绑定类型数',
    width: '200px',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
  },
  {
    uid: 'flows',
    dataIndex: 'flows',
    title: '表单',
    width: '200px',
  },
];
