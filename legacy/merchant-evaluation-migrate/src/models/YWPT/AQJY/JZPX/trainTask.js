export default () => [
  {
    uid: 'id',
    dataIndex: 'id',
    title: '编码',
    width: '200px',
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '任务名称',
    width: '200px',
  },
  {
    uid: 'planName',
    dataIndex: 'planName',
    title: '所属计划',
    width: '200px',
  },
  {
    uid: 'theme',
    dataIndex: 'theme',
    title: '培训主题',
    width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'updateBy',
    dataIndex: 'updateBy',
    title: '创建人',
    width: '200px',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
  },
];
