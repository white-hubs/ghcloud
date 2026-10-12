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
    title: '任务名称',
    width: '200px',
  },
  {
    uid: 'coursewareName',
    dataIndex: 'coursewareName',
    title: '演练方案',
    width: '200px',
  },
  {
    uid: 'theme',
    dataIndex: 'theme',
    title: '演练主题',
    width: '150px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'areaNames',
    dataIndex: 'areaNames',
    title: '演练所在区域',
    width: '200px',
    render(h, v) {
      return v?.length ? v.join('/') : '--';
    },
  },
  {
    uid: 'createBy',
    dataIndex: 'createBy',
    title: '创建人',
    width: '150px',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
  },
];
