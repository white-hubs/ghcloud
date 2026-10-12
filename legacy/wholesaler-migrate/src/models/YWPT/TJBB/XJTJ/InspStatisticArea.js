export default () => [
  {
    uid: 'type',
    dataIndex: 'pointType',
    title: '巡检点类型',
    width: '120px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
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
    uid: 'project-merchant-areaType',
    dataIndex: 'project-merchant-areaType',
    title: '区域类型',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'plan',
    dataIndex: 'planSize',
    title: '计划数',
    width: '100px',
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
    width: '100px',
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
    width: '160px',
    align: 'center',
  },
  {
    uid: 'abnormalNum',
    dataIndex: 'abnormalSize',
    title: '记录异常数',
    width: '160px',
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
    uid: 'inspCoverageByDev',
    dataIndex: 'inspCoverageByDev',
    title: '设备巡检覆盖率',
    width: '160px',
    align: 'center',
    render(h, v) {
      return v + '%';
    },
  },
  {
    uid: 'inspCoverageByStore',
    dataIndex: 'inspCoverageByStore',
    title: '档位巡检覆盖率',
    width: '160px',
    align: 'center',
    render(h, v) {
      return v + '%';
    },
  },
  {
    uid: 'inspCoverageByPoint',
    dataIndex: 'inspCoverageByPoint',
    title: '巡检点巡检覆盖率',
    width: '160px',
    align: 'center',
    render(h, v) {
      return v + '%';
    },
  },
];
