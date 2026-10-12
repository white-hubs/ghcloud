import moment from "moment";
export default () => [
  {
    uid: 'nickname',
    dataIndex: 'nickname',
    title: '评价对象',
    width: '120px',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '评价时间',
    width: '160px',
    render: (h, v) => {
      return v ? moment(v).format('YYYY-MM-DD hh:mm:ss') : ""
    }
  },
  {
    uid: 'honestyScore',
    dataIndex: 'honestyScore',
    title: '诚信经营值（星）',
    width: '100px',
  },
  {
    uid: 'zScore',
    dataIndex: 'zScore',
    title: '商品质量（星）',
    width: '100px',
  },
  {
    uid: 'sScore',
    dataIndex: 'sScore',
    title: '诚实守信（星）',
    width: '100px',
  },
  {
    uid: 'tScore',
    dataIndex: 'tScore',
    title: '服务态度（星）',
    width: '100px',
  },
  {
    uid: 'wScore',
    dataIndex: 'wScore',
    title: '环境卫生（星）',
    width: '100px',
  },
];
