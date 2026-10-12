export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
  },
  {
    uid: 'planName',
    dataIndex: 'planName',
    title: '任务名称',
  },
  {
    uid: 'recordSize',
    dataIndex: 'recordSize',
    title: '消杀点数',
  },
  {
    uid: 'startTime',
    dataIndex: 'startTime',
    title: '开始时间',
  },
  {
    uid: 'endTime',
    dataIndex: 'endTime',
    title: '完成时间',
  },
  {
    uid: 'timeConsuming',
    dataIndex: 'timeConsuming',
    title: '任务耗时',
  },
  {
    uid: 'completionRate',
    dataIndex: 'completionRate',
    title: '完成率',
  },
  {
    uid: 'status',
    dataIndex: 'status',
    title: '状态',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
];
