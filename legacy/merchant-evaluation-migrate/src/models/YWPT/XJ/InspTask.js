export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '任务编号',
    width: '200px',
    sorter: true,
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'inspplanName',
    dataIndex: 'inspplanName',
    title: '巡检任务',
    width: '200px',
  },
  {
    uid: 'point',
    dataIndex: 'point',
    title: '巡检点',
    width: '200px',
    render(h, v, r) {
      return r.inspplanDTO?.insppointDTOS?.map((p) => p.name)?.join(',');
    },
  },
  {
    uid: 'pointNum',
    dataIndex: 'pointSize',
    title: '巡检点数',
    width: '200px',
    render(h, v) {
      return v;
    },
  },
  {
    uid: 'content',
    dataIndex: 'content',
    title: '巡检标准',
    width: '200px',
  },
  {
    uid: 'deadTime',
    dataIndex: 'deadTime',
    title: '限定完成时间',
    width: '200px',
  },
  {
    uid: 'startUser',
    dataIndex: 'startUser',
    title: '派发人',
    width: '200px',
  },
  {
    uid: 'assigneeUser',
    dataIndex: 'assigneeUser',
    title: '当前执行人',
    width: '200px',
    render(h, v, r) {
      if (r.userTasks) {
        // r.userTasks?.map(item => item)
        return r.userTasks[0]?.assigneeUser?.nickname || '--';
      }
      return r.myUserTask?.assigneeUser?.nickname || '--';
    },
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
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
    width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
];
