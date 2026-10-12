export default () => [
  // {
  //   uid: 'postId',
  //   dataIndex: 'postId',
  //   title: '编号',
  // },
  {
    uid: 'nickname',
    dataIndex: 'nickname',
    title: '姓名',
  },
  {
    uid: 'username',
    dataIndex: 'username',
    title: '姓名',
  },
  {
    uid: 'gender',
    dataIndex: 'gender',
    title: '性别',
    render(h, v) {
      return v == 1 ? '男' : v == 2 ? '女' : '未知';
    },
  },
  {
    uid: 'mobile',
    dataIndex: 'mobile',
    title: '电话号码',
  },
  {
    uid: 'deptName',
    dataIndex: 'deptName',
    title: '部门',
  },
  {
    uid: 'postDTOS',
    dataIndex: 'postDTOS',
    title: '岗位',
    render(h, v) {
      return v?.length ? v.map((item) => item.name).join(',') : '--';
    },
  },
  {
    uid: 'punchDay',
    dataIndex: 'punchDay',
    title: '打卡日期',
  },
  {
    uid: 'isOwner',
    dataIndex: 'isOwner',
    title: '职位',
    render(h, v) {
      return v ? '档主' : '从业人员';
    },
  },
  {
    uid: 'storeDTOS',
    dataIndex: 'storeDTOS',
    title: '所在商铺',
    render(h, v) {
      return v?.length ? v.map((item) => item.name).join(',') : '--';
    },
  },
  {
    uid: 'temperature',
    dataIndex: 'temperature',
    title: '体温（℃）',
    render(h, v) {
      return v ? v : '--';
    },
  },
  {
    uid: 'result',
    dataIndex: 'result',
    title: '打卡结果',
    render(h, v) {
      return v ? '正常' : '异常';
    },
  },
  {
    uid: 'punchTime',
    dataIndex: 'punchTime',
    title: '打卡时间',
    width: '500px',
    render(h, v) {
      return v ? v : '--';
    },
  },
  {
    uid: 'stallName',
    dataIndex: 'stallName',
    title: '档位名称',
    width: '500px',
  },
  {
    uid: 'companyName',
    dataIndex: 'companyName',
    title: '所属商铺',
    width: '500px',
  },
  {
    uid: 'owner',
    dataIndex: 'owner',
    title: '职位',
    render(h, v) {
      return v ? '档主' : '从业人员';
    },
  },
  {
    uid: 'status',
    dataIndex: 'status',
    title: '状态',
  },
];
