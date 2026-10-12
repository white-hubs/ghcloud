export default () => [
  {
    uid: 'nickname',
    dataIndex: 'nickname',
    title: '姓名',
    width: '200px',
  },
  {
    uid: 'gender',
    dataIndex: 'gender',
    title: '性别',
    width: '100px',
    render(h, v) {
      return v == 1 ? '男' : v == 2 ? '女' : '未知';
    },
  },
  {
    uid: 'mobile',
    dataIndex: 'mobile',
    title: '电话号码',
    width: '200px',
  },
  // {
  //   uid: 'identityCard',
  //   dataIndex: 'identityCard',
  //   title: '身份证号',
  //   width: '200px',
  // },
  {
    uid: 'stallName',
    dataIndex: 'stallName',
    title: '所在档位',
    width: '200px',
  },
  {
    uid: 'owner',
    dataIndex: 'owner',
    title: '职位',
    width: '100px',
    render(h, v) {
      return v ? '档主' : '从业人员';
    },
  },

  {
    uid: 'companyName',
    dataIndex: 'companyName',
    title: '所在商户',
    width: '200px',
  },
  {
    uid: 'createBy',
    dataIndex: 'createBy',
    title: '创建人',
    width: '200px',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
  },
];
