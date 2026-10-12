export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '调拨编号',
    width: '150px',
  },
  {
    uid: 'date',
    dataIndex: 'date',
    title: '调拨日期',
  },
  // {
  //   uid: 'turnDeptName',
  //   dataIndex: 'turnDeptName',
  //   title: '调出部门',
  // },
  {
    uid: 'turnDeptName',
    dataIndex: 'turnDeptName',
    title: '转入部门',
  },
  {
    uid: 'applicantName',
    dataIndex: 'applicantName',
    title: '申请人',
  },
  {
    uid: 'approverName',
    dataIndex: 'approverName',
    title: '批准人',
  },
  {
    uid: 'areaNames',
    dataIndex: 'areaNames',
    title: '转入位置',
    width: '200px',
    render(h, v) {
      return v?.length ? v.join('/') : '--';
    },
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
  },
];
