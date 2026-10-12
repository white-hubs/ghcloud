export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编码',
    width: '200px',
  },
  {
    uid: 'type',
    dataIndex: 'type',
    title: '上报类型',
    width: '150px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'level',
    dataIndex: 'level',
    title: '上报等级',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'content',
    dataIndex: 'content',
    title: '上报内容',
    width: '300px',
  },
  {
    uid: 'description',
    dataIndex: 'description',
    title: '事件描述',
    width: '300px',
  },
  {
    uid: 'reportUserName',
    dataIndex: 'reportUserName',
    title: '上报人',
    width: '150px',
  },
  {
    uid: 'reportDeptName',
    dataIndex: 'reportDeptName',
    title: '上报部门',
    width: '150px',
  },
  {
    uid: 'upToHq',
    dataIndex: 'upToHq',
    title: '是否上报总部',
    width: '150px',
    render: (h, v) => {
      return v ? '是' : '否';
    },
  },
  {
    uid: 'mobile',
    dataIndex: 'mobile',
    title: '联系电话',
    width: '200px',
  },
  {
    uid: 'files',
    dataIndex: 'files',
    title: '附件',
    width: '200px',
  },
  {
    uid: 'gis',
    dataIndex: 'gis',
    title: 'GIS定位',
    width: '200px',
  },
  {
    uid: 'reportTime',
    dataIndex: 'reportTime',
    title: '上报时间',
    width: '200px',
  },
];
