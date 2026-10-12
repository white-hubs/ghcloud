export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '记录编号',
    width: '200px',
    sorter: true,
  },
  {
    uid: 'taskName',
    dataIndex: 'taskName',
    title: '任务名称',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'pointName',
    dataIndex: 'pointName',
    title: '巡检点名称',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'objectName',
    dataIndex: 'objectName',
    title: '设备/档位',
    width: '200px',
    render(h, v, r) {
      return r.deviceName || r.storeName || '--';
    },
  },
  // 巡检对象, 对象类型, 对象子类
  {
    uid: 'targetType',
    dataIndex: 'targetType',
    title: '对象类型',
    width: '150px',
    render(h, v) {
      return v ? <app-dict-display value={v} /> : '--';
    },
  },
  {
    uid: 'targetName',
    dataIndex: 'targetName',
    title: '巡检对象',
    width: '250px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'targetCategory',
    dataIndex: 'targetCategory',
    title: '对象子类',
    width: '150px',
    render(h, v) {
      return v ? <app-dict-display value={v} /> : '--';
    },
  },

  // {
  //   uid: 'deptName',
  //   dataIndex: 'deptName',
  //   title: '所属部门',
  //   width: '200px',
  // },
  {
    uid: 'deptName',
    dataIndex: 'deptName',
    title: '巡检人员',
    width: '200px',
    render(h, v, r) {
      return r.nickname ? r.nickname + ` (${v})` : '--';
    },
  },
  {
    uid: 'areaNames',
    dataIndex: 'areaNames',
    title: '所属区域',
    width: '200px',
    render(h, v) {
      return v?.length ? v.join('/') : '--';
    },
  },
  {
    uid: 'pointAddress',
    dataIndex: 'pointAddress',
    title: '详细地址',
    width: '200px',
  },
  {
    uid: 'result',
    dataIndex: 'result',
    title: '结果',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'status',
    dataIndex: 'status',
    title: '状态',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '生成时间',
    width: '200px',
  },
  {
    uid: 'time',
    dataIndex: 'time',
    title: '记录时间',
    width: '200px',
  },
];
