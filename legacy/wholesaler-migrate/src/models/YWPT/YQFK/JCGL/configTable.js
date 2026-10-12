export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '产品分类',
    // width: '90px',
  },
  // {
  //   uid: 'reportTel',
  //   dataIndex: 'reportTel',
  //   title: '电话号码',
  //   width: '200px',
  // },
  {
    uid: 'status',
    dataIndex: 'status',
    title: '状态',
    // width: '400px',
    scopedSlots: { customRender: 'status' },
  },
  // {
  //   uid: 'plateNumber',
  //   dataIndex: 'plateNumber',
  //   title: '车牌号',
  //   width: '200px',
  // },
  // {
  //   uid: 'temperature',
  //   dataIndex: 'temperature',
  //   title: '体温',
  //   //     width: '200px',
  // },
  /**编辑+新增table**/
  {
    uid: 'category',
    dataIndex: 'category',
    title: '分类名称',
    width: '200px',
  },
  {
    uid: 'startPeriod',
    dataIndex: 'startPeriod',
    title: '开始时间（H）',
    width: '200px',
  },
  {
    uid: 'endPeriod',
    dataIndex: 'endPeriod',
    title: '结束时间',
    width: '200px',
  },
  {
    uid: 'updateTime',
    dataIndex: 'updateTime',
    title: '修改时间',
    width: '200px',
  },
  {
    uid: 'createBy',
    dataIndex: 'createBy',
    title: '操作人',
    width: '200px',
  },
];
