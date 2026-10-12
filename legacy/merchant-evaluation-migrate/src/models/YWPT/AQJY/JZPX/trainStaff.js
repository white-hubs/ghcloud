export default () => [
  { uid: 'nickname', title: '姓名', dataIndex: 'nickname' },
  {
    uid: 'inPlan',
    title: '类别',
    dataIndex: 'inPlan',
    customRender: (text, record) => {
      return text ? '计划内' : '计划外';
    },
  },
  { uid: 'mobile', title: '手机号码', dataIndex: 'mobile' },
  { uid: 'deptName', title: '所属部门', dataIndex: 'deptName' },
  {
    uid: 'trained',
    title: '状态',
    dataIndex: 'trained',
    customRender: (text, record) => {
      return text ? '已学习' : '未学习';
    },
  },
];
