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
    title: '考试名称',
    width: '200px',
  },
  {
    uid: 'theme',
    dataIndex: 'theme',
    title: '主题',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'totalQuestion',
    dataIndex: 'totalQuestion',
    title: '试题数量',
    width: '120px',
    render(h, m, v) {
      return v.paperDTO?.totalQuestion;
    },
  },
  {
    uid: 'totalScore',
    dataIndex: 'totalScore',
    title: '试题总分',
    width: '120px',
    render(h, m, v) {
      return v.paperDTO?.totalScore;
    },
  },
  {
    uid: 'passScore',
    dataIndex: 'passScore',
    title: '及格分数',
    width: '120px',
    render(h, m, v) {
      return v.paperDTO?.passScore;
    },
  },
  {
    uid: 'passNum',
    dataIndex: 'passNum',
    title: '已通过人数',
    width: '120px',
  },
  {
    uid: 'noPassNum',
    dataIndex: 'noPassNum',
    title: '未通过人数',
    width: '120px',
  },
  {
    uid: 'completeStatus',
    dataIndex: 'completeStatus',
    title: '完成情况',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'validStatus',
    dataIndex: 'validStatus',
    title: '状态',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'deptName',
    dataIndex: 'deptName',
    title: '状态',
    width: '120px',
  },
  {
    uid: 'updateBy',
    dataIndex: 'updateBy',
    title: '创建人',
    width: '120px',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
  },
];
