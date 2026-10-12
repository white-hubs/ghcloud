export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '处置编号',
    width: '220px',
  },
  {
    uid: 'date',
    dataIndex: 'date',
    title: '处置日期',
    width: '200px',
  },
  {
    uid: 'applicantName',
    dataIndex: 'applicantName',
    title: '申请人',
    width: '200px',
  },
  {
    uid: 'approverName',
    dataIndex: 'approverName',
    title: '批准人',
    width: '200px',
  },
  {
    uid: 'way',
    dataIndex: 'way',
    title: '处置方式',
    width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'createBy',
    dataIndex: 'createBy',
    title: '创建时间',
    width: '200px',
  },
];
