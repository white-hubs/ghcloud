export default () => [
  {
    uid: 'deptName',
    dataIndex: 'deptName',
    title: '部门名称',
    width: '200px',
    scopedSlots: {
      customRender: 'deptName',
    },

    // render(h, value, record, index) {
    //   return (
    //     <app-link-btn to={`/ywpt/insps-statistic/dept/detail/${record.deptId}`}>
    //       {value}
    //     </app-link-btn>
    //   );
    // },
  },
  {
    uid: 'taskSize',
    dataIndex: 'taskSize',
    title: '部门任务总数',
    width: '200px',
    align: 'center',
  },
  {
    uid: 'finished',
    dataIndex: 'finished',
    title: '已完成任务数',
    width: '120px',
    align: 'center',
  },
  {
    uid: 'unFinished',
    dataIndex: 'unFinished',
    title: '未完成任务数',
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
    uid: 'finishedRate',
    dataIndex: 'finishedRate',
    title: '任务完成率',
    width: '120px',
    align: 'center',
    render(h, v) {
      return v + '%';
    },
  },
  {
    uid: 'taskAvgTimeconsuming',
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
    uid: 'normalSize',
    dataIndex: 'normalSize',
    title: '记录正常数',
    width: '120px',
    align: 'center',
  },
  {
    uid: 'abnormalSize',
    dataIndex: 'abnormalSize',
    title: '记录异常数',
    width: '120px',
    align: 'center',
  },
  {
    uid: 'normalRate',
    dataIndex: 'normalRate',
    title: '记录正常率',
    width: '120px',
    align: 'center',
    render(h, v) {
      return v + '%';
    },
  },
  {
    uid: 'recordSize',
    dataIndex: 'recordSize',
    title: '涉及巡检点位数',
    width: '160px',
    align: 'center',
  },
  {
    uid: 'pointCompleteSize',
    dataIndex: 'pointCompleteSize',
    title: '已巡点位数',
    width: '120px',
    align: 'center',
  },
  {
    uid: 'pointPendingSize',
    dataIndex: 'pointPendingSize',
    title: '未巡点位数',
    width: '120px',
    align: 'center',
  },
];
