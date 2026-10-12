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
    title: '计划名称',
    width: '200px',
  },
  {
    uid: 'coursewareName',
    dataIndex: 'coursewareName',
    title: '培训课件',
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
    uid: 'planNum',
    dataIndex: 'planNum',
    title: '计划人数',
    width: '100px',
  },
  {
    uid: 'trainedInPlanNum',
    dataIndex: 'trainedInPlanNum',
    title: '已培训(计划内)',
    width: '150px',
  },
  {
    uid: 'trainedOutPlanNum',
    dataIndex: 'trainedOutPlanNum',
    title: '已培训(计划外)',
    width: '150px',
  },
  {
    uid: 'noTrainingNum',
    dataIndex: 'noTrainingNum',
    title: '未培训人数',
    width: '150px',
  },
  {
    uid: 'status',
    dataIndex: 'status',
    title: '状态',
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
