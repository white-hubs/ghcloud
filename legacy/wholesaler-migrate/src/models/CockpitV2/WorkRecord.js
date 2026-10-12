export default () => [
  // {
  //   uid: 'code',
  //   dataIndex: 'code',
  //   title: '编号',
  //   width: '100px',
  //   sorter: true,
  //   render(h, v, r){
  //     return <div class="ellipsis" style="width: 100px;">
  //       <a-tooltip title={v}>{v}</a-tooltip>
  //       </div>
  //         }
  // },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
    width: '100px',
    render(h, v, r) {
      return (
        <div class="ellipsis" style="width: 100px;">
          <a-tooltip title={r.name}>{r.name}</a-tooltip>
          {/* {r.name}{' '} */}
          {!!r.timeOut && (
            <a-tag color="red" style="border: none;">
              已超时
            </a-tag>
          )}
        </div>
      );
    },
  },
  {
    uid: 'task',
    dataIndex: 'task',
    title: '当前任务',
    width: '100px',
    render(h, v, r) {
      if (r.userTasks) {
        return r.userTasks[0]?.name;
      }
      return r.myUserTask?.name;
    },
  },
  {
    uid: 'assignee',
    dataIndex: 'assignee',
    title: '当前执行人',
    width: '100px',
    render(h, v, r) {
      if (r.userTasks) {
        return r.userTasks[0]?.assigneeUser?.nickname || '--';
      }
      return r.myUserTask?.assigneeUser?.nickname || '--';
    },
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '100px',
  },
  {
    uid: 'startTime',
    dataIndex: 'startTime',
    title: '开始时间',
    width: '100px',
    render(h, v, r) {
      return (
        <div class="ellipsis" style="width: 100px;">
          <a-tooltip title={v}>{v}</a-tooltip>
        </div>
      );
    },
  },
  {
    uid: 'costTime',
    dataIndex: 'timeConsuming',
    title: '工单耗时',
    width: '100px',
    render(h, v, r) {
      return (
        <div class="ellipsis" style="width: 100px;">
          <a-tooltip title={v}>{v}</a-tooltip>
        </div>
      );
    },
  },
  {
    uid: 'type',
    dataIndex: 'type',
    title: '类型',
    width: '100px',
  },
  {
    uid: 'status',
    dataIndex: 'status',
    title: '状态',
    width: '80px',
    render(h, v, r) {
      return <app-dict-display code="ticketinstStatus" value={v} />;
    },
  },
  {
    uid: 'source',
    dataIndex: 'sourceType',
    title: '来源',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
];
