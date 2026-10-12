export default () => [
  {
    uid: 'nickname',
    dataIndex: 'nickname',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'mobile',
    dataIndex: 'mobile',
    title: '手机号',
    width: '200px',
  },
  {
    uid: 'companyOwner',
    dataIndex: 'companyOwner',
    title: '职位',
    width: '150px',
    render(h, v) {
      return v ? '档主' : '从业人员';
    },
  },
  {
    uid: 'storeName',
    dataIndex: 'storeName',
    title: '所在档位',
    width: '120px',
  },
  {
    uid: 'trained',
    dataIndex: 'trained',
    title: '状态',
    width: '120px',
    render(h, v) {
      return v ? '已学习' : '未学习';
    },
  },
];
