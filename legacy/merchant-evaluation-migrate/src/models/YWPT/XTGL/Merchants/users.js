export default () => [
  {
    uid: 'username',
    dataIndex: 'username',
    title: '登录账号',
  },
  {
    uid: 'nickname',
    dataIndex: 'nickname',
    title: '姓名',
  },
  {
    uid: 'mobile',
    dataIndex: 'mobile',
    title: '手机号码',
  },
  {
    uid: 'gender',
    dataIndex: 'gender',
    title: '性别',
    render(h, v, r) {
      return v == 1 ? '男' : v == 2 ? '女' : '未知';
    },
  },
  {
    uid: 'isOwner',
    dataIndex: 'companyOwner',
    title: '职位',
    render(h, v) {
      return v ? '档主' : '从业人员';
    },
  },
  {
    uid: 'companyName',
    dataIndex: 'companyName',
    title: '所在商户',
    render(h, v, r) {
      return r.companyName || '--';
      // name
    },
  },
  {
    uid: 'storeName',
    dataIndex: 'storeName',
    title: '所在档位',
    render(h, v, r) {
      return r.storeName || '--';
      // name
    },
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
  },
];
