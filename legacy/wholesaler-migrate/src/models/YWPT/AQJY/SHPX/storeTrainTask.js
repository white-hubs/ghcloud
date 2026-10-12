export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'coursewareName',
    dataIndex: 'coursewareName',
    title: '培训视频',
    width: '200px',
  },
  {
    uid: 'theme',
    dataIndex: 'theme',
    title: '培训主题',
    width: '150px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'noTrainedNum',
    dataIndex: 'noTrainedNum',
    title: '未学习人数',
    width: '120px',
  },
  {
    uid: 'trainedNum',
    dataIndex: 'trainedNum',
    title: '已学习人数',
    width: '120px',
  },
  {
    uid: 'completeStatus',
    dataIndex: 'completeStatus',
    title: '完成情况',
    width: '120px',
    render(h, v) {
      return <app-dict-display value={v} />;
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
  {
    uid: 'validStatus',
    dataIndex: 'validStatus',
    title: '状态',
    width: '120px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
];
