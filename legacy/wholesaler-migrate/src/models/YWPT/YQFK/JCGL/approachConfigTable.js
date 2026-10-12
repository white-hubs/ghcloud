export default () => [
  {
    uid: 'rangeAddress',
    dataIndex: 'rangeAddress',
    title: '范围地址',
    // width: '130px',
  },
  {
    uid: 'effectiveRange',
    dataIndex: 'effectiveRange',
    title: '有效范围',
    render(h, v) {
      return v + 'm';
    },
  },
];
