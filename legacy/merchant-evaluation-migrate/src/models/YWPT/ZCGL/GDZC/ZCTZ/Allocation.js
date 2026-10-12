export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '调拨编号',
    width: '160px',
    render(h, m, v) {
      return v.assetAllocationDTO?.code || '--';
    },
  },
  {
    uid: 'date',
    dataIndex: 'date',
    title: '调拨日期',
    width: '160px',
    render(h, m, v) {
      return v.assetAllocationDTO?.date || '--';
    },
  },
  {
    uid: 'useDeptName',
    dataIndex: 'useDeptName',
    title: '调出部门',
    width: '160px',
  },
  {
    uid: 'turnDeptName',
    dataIndex: 'turnDeptName',
    title: '转入部门',
    width: '150px',
    render(h, m, v) {
      return v.assetAllocationDTO?.turnDeptName || '--';
    },
  },
  {
    uid: 'applicantName',
    dataIndex: 'applicantName',
    title: '申请人',
    width: '200px',
    render(h, m, v) {
      return v.assetAllocationDTO?.applicantName || '--';
    },
  },
  {
    uid: 'approverName',
    dataIndex: 'approverName',
    title: '批准人',
    width: '200px',
    render(h, m, v) {
      return v.assetAllocationDTO?.approverName || '--';
    },
  },
  // {
  //   uid: 'areas',
  //   dataIndex: 'areas',
  //   title: '存放位置',
  //   width: '200px',
  //   render(h, m, v) {
  //     return v.assetAllocationDTO?.areaNames?.length
  //       ? v.assetAllocationDTO.areaNames.join('/')
  //       : '--';
  //   },
  // },
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
    width: '200px',
    render(h, m, v) {
      return v.assetAllocationDTO?.createTime || '--';
    },
  },
];
