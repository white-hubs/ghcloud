export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '姓名',
  },
  {
    uid: 'mobile',
    dataIndex: 'mobile',
    title: '手机号码',
  },
  {
    uid: 'organizations',
    dataIndex: 'organizations',
    title: '所属部门',
    customRender: (text, record) => {
      const res = Array.isArray(text) && text.length > 0 ? text.map(t => t.name).join('/') : '--';
      return res
    },
  },
];
