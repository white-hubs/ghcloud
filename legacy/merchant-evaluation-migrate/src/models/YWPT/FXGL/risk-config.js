export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '风险项',
    width: '300px',
  },
  {
    uid: 'type',
    dataIndex: 'type',
    title: '风险点类型',
    width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'subTypeName',
    dataIndex: 'subTypeName',
    title: '子类型',
    width: '200px',
  },
  {
    uid: 'accidentType',
    dataIndex: 'accidentType',
    title: '事故类型',
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
];
