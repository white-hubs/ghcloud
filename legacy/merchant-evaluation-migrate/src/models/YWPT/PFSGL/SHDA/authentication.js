export default () => [
  {
    uid: 'realName',
    dataIndex: 'realName',
    title: '认证人',
    width: '200px',
  },
  {
    uid: 'status',
    dataIndex: 'status',
    title: '状态',
    width: '100px',
    render(h, v) {
      return v == 0
        ? '待审核'
        : v === 1
        ? '已通过'
        : v === 2
        ? '未通过'
        : '---';
    },
  },
  {
    uid: 'mobile',
    dataIndex: 'mobile',
    title: '登录账号',
    width: '200px',
  },
  {
    uid: 'stallName',
    dataIndex: 'stallName',
    title: '档位',
    width: '200px',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
  },
];
