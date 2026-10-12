export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '姓名',
    //     width: '200px',
  },
  {
    uid: 'tel',
    dataIndex: 'tel',
    title: '电话号码',
    //     width: '200px',
  },
  {
    uid: 'idCard',
    dataIndex: 'idCard',
    title: '身份证号码',
    //     width: '200px',
  },
  {
    uid: 'address',
    dataIndex: 'address',
    title: '住址',
    //     width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'temperature',
    dataIndex: 'temperature',
    title: '温度',
    //     width: '200px',
    render(h, v) {
      return v || '--';
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
  {
    uid: 'entryTime',
    dataIndex: 'entryTime',
    title: '进场时间',
    render(h, v) {
      return v || '--';
    },
    //     width: '200px',
  },
];
