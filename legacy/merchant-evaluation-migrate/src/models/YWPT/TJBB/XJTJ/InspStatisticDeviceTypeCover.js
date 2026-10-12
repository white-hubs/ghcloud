export default () => [
  {
    uid: 'device',
    dataIndex: 'deviceName',
    title: '设备名称',
    width: '200px',
  },
  {
    uid: 'type',
    dataIndex: 'deviceTypeName',
    title: '设备类型',
    width: '120px',
  },
  {
    uid: 'area',
    dataIndex: 'areaNames',
    title: '所属区域',
    width: '300px',
    render(h, v) {
      return v?.length ? v.filter((item) => !!item).join('/') : '--';
    },
  },
  {
    uid: 'plan',
    dataIndex: 'planSize',
    title: '计划数',
    width: '120px',
    align: 'center',
  },
  {
    uid: 'task',
    dataIndex: 'taskSize',
    title: '任务数',
    width: '120px',
    align: 'center',
  },
  {
    uid: 'record',
    dataIndex: 'recordSize',
    title: '记录数',
    width: '120px',
    align: 'center',
  },
  {
    uid: 'uncompleted',
    dataIndex: 'unFinished',
    title: '未完成任务数',
    width: '120px',
    align: 'center',
  },
  {
    uid: 'completed',
    dataIndex: 'finished',
    title: '已完成任务数',
    width: '120px',
    align: 'center',
  },
  {
    uid: 'completedPercent',
    dataIndex: 'finishedRate',
    title: '任务完成率',
    width: '120px',
    align: 'center',
    render(h, v) {
      return v + '%';
    },
  },
  {
    uid: 'normalNum',
    dataIndex: 'normalSize',
    title: '记录正常数',
    width: '120px',
    align: 'center',
  },
  {
    uid: 'abnormalNum',
    dataIndex: 'abnormalSize',
    title: '记录异常数',
    width: '120px',
    align: 'center',
  },
  {
    uid: 'normalPercent',
    dataIndex: 'normalRate',
    title: '记录正常率',
    width: '120px',
    align: 'center',
    render(h, v) {
      return v + '%';
    },
  },
  {
    uid: 'inspCoverage',
    dataIndex: 'inspCoverage',
    title: '巡检覆盖率',
    width: '120px',
    align: 'center',
    render(h, v) {
      return v + '%';
    },
  },
];
