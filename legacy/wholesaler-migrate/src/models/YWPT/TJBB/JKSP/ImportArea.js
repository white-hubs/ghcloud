// 产地名称、商品总数、检查数、未检查数、商品抽查率、合格率；
export default () => [
  {
    uid: 'producingArea',
    dataIndex: 'producingArea',
    title: '产地名称',
    width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'goodsSize',
    dataIndex: 'goodsSize',
    title: '商品总数',
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
