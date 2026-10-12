export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '200px',
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '描述名称',
    width: '200px',
  },
  {
    uid: 'type',
    dataIndex: 'type',
    title: '诉求类型',
    width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'createBy',
    dataIndex: 'createBy',
    title: '创建人',
    width: '200px',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
  },
  {
    uid: 'updateBy',
    dataIndex: 'updateBy',
    title: '更新人',
    width: '200px',
  },
  {
    uid: 'updateTime',
    dataIndex: 'updateTime',
    title: '更新时间',
    width: '200px',
  },
];
