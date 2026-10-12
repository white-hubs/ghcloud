export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '试卷名称',
  },
  {
    uid: 'totalScore',
    dataIndex: 'totalScore',
    title: '总分',
    width: '150px',
  },
  {
    uid: 'passScore',
    dataIndex: 'passScore',
    title: '及格分数',
    width: '150px',
  },
  {
    uid: 'totalQuestion',
    dataIndex: 'totalQuestion',
    title: '试题总数',
    width: '150px',
  },
  {
    uid: 'theme',
    dataIndex: 'theme',
    title: '主题',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'updateBy',
    dataIndex: 'updateBy',
    title: '创建人',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
  },
];
