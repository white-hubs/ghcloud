export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '计划编号',
    width: '200px',
    sorter: true,
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '计划名称',
    width: '200px',
  },
  {
    uid: 'cycleType',
    dataIndex: 'cycleType',
    title: '执行周期',
    width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'taskCount',
    dataIndex: 'taskCount',
    title: '生成任务数',
    width: '110px',
  },
  {
    uid: 'beginTime',
    dataIndex: 'beginTime',
    title: '生效时间',
    width: '200px',
  },
  {
    uid: 'endTime',
    dataIndex: 'endTime',
    title: '失效时间',
    width: '200px',
  },
  {
    uid: 'hour',
    dataIndex: 'hour',
    title: '执行时间',
    width: '200px',
  },
  {
    uid: 'enabled',
    dataIndex: 'enabled',
    title: '状态',
    width: '100px',
    render(h, enabled) {
      return (
        <app-enabled-display
          enabled={enabled}
          trueLabel="启用"
          falseLabel="停用"
        />
      );
    },
  },
  {
    uid: 'inspplanInsppointDTOS',
    dataIndex: 'inspplanInsppointDTOS',
    title: '巡检点',
    width: '200px',
  },
];
