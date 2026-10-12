export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '200px',
    sorter: true,
  },
  {
    uid: 'inspplanName',
    dataIndex: 'inspplanName',
    title: '巡检任务',
    width: '200px',
  },
  {
    uid: 'point',
    dataIndex: 'insppointName',
    title: '巡检点',
    width: '200px',
  },
  {
    uid: 'dutyId',
    dataIndex: 'dutyId',
    title: '责任人',
    width: '200px',
    render(h, v, r) {
      return r.nickname || r.username || '--';
    },
  },
  {
    uid: 'deptName',
    dataIndex: 'deptName',
    title: '巡检部门',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'areaNames',
    dataIndex: 'areaNames',
    title: '巡检区域',
    width: '200px',
    render(h, v) {
      return v?.join('/') || '--';
    },
  },
  {
    uid: 'taskTime',
    dataIndex: 'taskTime',
    title: '任务时间',
    width: '200px',
  },
  {
    uid: 'inspDatetime',
    dataIndex: 'inspDatetime',
    title: '巡检时间',
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
];
