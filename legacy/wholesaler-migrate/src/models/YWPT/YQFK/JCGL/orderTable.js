export default () => [
  {
    uid: 'userName',
    dataIndex: 'userName',
    title: '姓名',
    width: '110px',
  },
  {
    uid: 'reportTel',
    dataIndex: 'reportTel',
    title: '电话号码',
    width: '200px',
  },
  {
    uid: 'idCard',
    dataIndex: 'idCard',
    title: '身份证号码',
    width: '200px',
  },
  {
    uid: 'plateNumber',
    dataIndex: 'plateNumber',
    title: '车牌号',
    width: '200px',
  },
  {
    uid: 'temperature',
    dataIndex: 'temperature',
    title: '体温',
    //     width: '200px',
  },
  {
    uid: 'typeName',
    dataIndex: 'typeName',
    title: '采购商类型',
    width: '200px',
  },
  {
    uid: 'goodsCategory',
    dataIndex: 'goodsCategory',
    title: '商品品类',
    width: '110px',
  },
  {
    uid: 'scanCodeTime',
    dataIndex: 'scanCodeTime',
    title: '进场时间',
    width: '200px',
  },
  {
    uid: 'approachState',
    dataIndex: 'approachState',
    title: '进场状态',
    width: '110px',
    render(h, v) {
      return v == 0
        ? '待进场'
        : v == 1
        ? '已进场'
        : v == 2
        ? '已失效'
        : '已拒绝';
    },
  },
  {
    uid: 'promise',
    dataIndex: 'promise',
    title: '是否确认承诺书',
    //     width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'signingTime',
    dataIndex: 'signingTime',
    title: '承诺书确认时间',
    //     width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
];
