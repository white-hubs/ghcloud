export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '200px',
    sorter: true,
  },
  {
    uid: 'taskName',
    dataIndex: 'taskName',
    title: '维保任务',
    width: '200px',
  },
  {
    uid: 'deviceName',
    dataIndex: 'deviceName',
    title: '设备',
    width: '200px',
  },
  {
    uid: 'nickname',
    dataIndex: 'nickname',
    title: '责任人',
    width: '200px',
    render(h, v, r) {
      return r.nickname || r.username || '--';
    },
  },
  {
    uid: 'taskTime',
    dataIndex: 'taskTime',
    title: '任务时间',
    width: '200px',
  },
  {
    uid: 'time',
    dataIndex: 'time',
    title: '维保时间',
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
    uid: 'deptName',
    dataIndex: 'deptName',
    title: '所属部门',
    width: '200px',
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
];
