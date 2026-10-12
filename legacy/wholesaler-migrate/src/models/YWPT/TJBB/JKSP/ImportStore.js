// 商户名称、进口商品数、检查数、未检查数、抽查率、合格率：
export default () => [
  {
    uid: 'companyName',
    dataIndex: 'companyName',
    title: '商户名称',
    width: '200px',
  },
  {
    uid: 'goodsSize',
    dataIndex: 'goodsSize',
    title: '进口商品数',
    width: '100px',
  },
  {
    uid: 'checkedSize',
    dataIndex: 'checkedSize',
    title: '检查数',
    width: '100px',
  },
  {
    uid: 'noCheckedSize',
    dataIndex: 'noCheckedSize',
    title: '未检查数',
    width: '100px',
  },
  {
    uid: 'checkedRate',
    dataIndex: 'checkedRate',
    title: '商品抽查率',
    width: '100px',
    render(h, v) {
      return v + '%';
    },
  },
  {
    uid: 'passRate',
    dataIndex: 'passRate',
    title: '合格率',
    width: '100px',
    render(h, v) {
      return v + '%';
    },
  },
];
