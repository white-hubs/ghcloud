export default () => [
  {
    uid: 'nickname',
    dataIndex: 'name',
    title: '姓名',
  },
  {
    uid: 'mobile',
    dataIndex: 'mobile',
    title: '手机号码',
  },
  {
    uid: 'deptName',
    dataIndex: 'managedOrganizations',
    title: '所属部门',
    customRender: (text, record) => {
      return text ? text[0].name : '';
    },
  },
];
