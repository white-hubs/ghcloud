export default () => [
  {
    uid: 'user',
    dataIndex: 'nickname',
    title: '巡检人名称',
    width: '200px',
  },
  {
    uid: 'dept',
    dataIndex: 'deptName',
    title: '所属部门',
    width: '200px',
  },
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
    uid: 'plan',
    dataIndex: 'planSize',
    title: '计划数',
    width: '120px',
  },
  {
    uid: 'deptTaskTotal',
    dataIndex: 'deptTaskTotal',
    title: '部门任务总数',
    width: '120px',
    align: 'center',
  },
  {
    uid: 'task',
    dataIndex: 'taskSize',
    title: '个人任务总数',
    width: '120px',
    align: 'center',
  },
  {
    uid: 'pointNum',
    dataIndex: 'recordSize',
    title: '涉及巡检点位数',
    width: '160px',
    align: 'center',
  },
  {
    uid: 'unInspPointNum',
    dataIndex: 'pointPendingSize',
    title: '未巡点位数',
    width: '120px',
    align: 'center',
  },
  {
    uid: 'record',
    dataIndex: 'pointCompleteSize',
    title: '已巡点位数',
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
    uid: 'taskRatio',
    dataIndex: 'taskRatio',
    title: '任务占比',
    width: '120px',
    align: 'center',
    render(h, v) {
      return v + '%';
    },
  },
  {
    uid: 'cost',
    dataIndex: 'taskAvgTimeconsuming',
    title: '平均任务耗时',
    width: '200px',
    align: 'center',
    render(h, v) {
      const min = v || 0;
      const hour = Math.floor(min / 60);
      const day = Math.floor(hour / 24);
      let str = '';
      if (day) {
        str += day + '天';
      }
      if (hour) {
        str += (hour % 24) + '小时';
      }
      if (min) {
        str += (min % 60) + '分';
      } else {
        str += '--';
      }
      return str;
    },
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
];
