export default () => [
  {
    uid: 'area',
    dataIndex: 'area',
    title: '地区名称',
  },
  {
    uid: 'type',
    dataIndex: 'type',
    title: '风险等级',
    render(h, v) {
      return v == 1 ? '中风险' : v == 2 ? '高风险' : '';
    },
  },
];
