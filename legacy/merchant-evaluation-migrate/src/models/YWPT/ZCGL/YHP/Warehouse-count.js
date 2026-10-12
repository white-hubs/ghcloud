export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '仓库名称',
    // width: '220px',
    // render(h, v) {
    //   return v?.length ? v.join('/') : '--';
    // },
  },
  {
    uid: 'total',
    dataIndex: 'total',
    title: '易耗品数量',
  },
  {
    uid: 'tooLowNum',
    dataIndex: 'tooLowNum',
    title: '过低预警数',
  },
  {
    uid: 'tooHighNum',
    dataIndex: 'tooHighNum',
    title: '过高预警数',
  },
];
