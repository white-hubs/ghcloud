export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编码',
    width: '200px',
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '维保任务',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'planName',
    dataIndex: 'planName',
    title: '维保计划',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'deviceSize',
    dataIndex: 'deviceSize',
    title: '设备数',
    width: '200px',
  },
  {
    uid: 'device',
    dataIndex: 'deviceName',
    title: '设备名称',
    width: '200px',
    render(h, v, r) {
      return v;
    },
  },
  {
    uid: 'deptName',
    dataIndex: 'deptName',
    title: '所属部门',
    width: '150px',
  },
  {
    uid: 'nickname',
    dataIndex: 'nickname',
    title: '当前执行人',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'planTime',
    dataIndex: 'planTime',
    title: '计划执行时间',
    width: '200px',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
  },
  {
    uid: 'startTime',
    dataIndex: 'startTime',
    title: '开始时间',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'endTime',
    dataIndex: 'endTime',
    title: '完成时间',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'timeConsuming',
    dataIndex: 'timeConsuming',
    title: '任务耗时',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'completionRate',
    dataIndex: 'completionRate',
    title: '完成率',
    width: '100px',
    render(h, v) {
      return v + '%';
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
];
