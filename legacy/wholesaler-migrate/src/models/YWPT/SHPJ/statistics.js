export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '档位名称',
    width: '120px',
    scopedSlots: { customRender: 'name' },
  },
  {
    uid: 'companyName',
    dataIndex: 'companyName',
    title: '所属商户',
    width: '120px',
  },
  {
    uid: 'owner',
    dataIndex: 'owner',
    title: '所属人姓名',
    width: '120px',
  },
  {
    uid: 'honestyScore',
    dataIndex: 'honestyScore',
    title: '诚信经营值（星）',
    width: '100px',
  },
  {
    uid: 'zScoreAvg',
    dataIndex: 'zScoreAvg',
    title: '商品质量（星）',
    width: '100px',
  },
  {
    uid: 'sScoreAvg',
    dataIndex: 'sScoreAvg',
    title: '诚实守信（星）',
    width: '100px',
  },
  {
    uid: 'tScoreAvg',
    dataIndex: 'tScoreAvg',
    title: '服务态度（星）',
    width: '100px',
  },
  {
    uid: 'wScoreAvg',
    dataIndex: 'wScoreAvg',
    title: '环境卫生（星）',
    width: '100px',
  },
];
