export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '220px',
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'typeName',
    dataIndex: 'typeName',
    title: '分类',
    width: '150px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'supplier',
    dataIndex: 'supplier',
    title: '供应商',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'warehouseName',
    dataIndex: 'warehouseName',
    title: '所在仓库',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'inventory',
    dataIndex: 'inventory',
    title: '库存',
    width: '100px',
  },
  {
    uid: 'status',
    dataIndex: 'status',
    title: '预警状态',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
];
