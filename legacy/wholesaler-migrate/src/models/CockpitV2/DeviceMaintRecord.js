export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '100px',
    sorter: true,
    render(h, v, r) {
      return (
        <div class="ellipsis" style="width: 100px;">
          <a-tooltip title={v}>{v}</a-tooltip>
        </div>
      );
    },
  },
  {
    uid: 'taskName',
    dataIndex: 'taskName',
    title: '维保任务',
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
    uid: 'deviceName',
    dataIndex: 'deviceName',
    title: '设备',
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
    uid: 'nickname',
    dataIndex: 'nickname',
    title: '责任人',
    width: '100px',
    render(h, v, r) {
      return r.nickname || r.username || '--';
    },
  },
  // {
  //   uid: 'taskTime',
  //   dataIndex: 'taskTime',
  //   title: '任务时间',
  //   width: '100px',
  // },
  {
    uid: 'time',
    dataIndex: 'time',
    title: '维保时间',
    width: '100px',
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
    uid: 'areaNames',
    dataIndex: 'areaNames',
    title: '所属区域',
    width: '100px',
    render(h, v) {
      // return v?.length ? v.join('/') : '--';
      return (
        <div class="ellipsis" style="width: 100px;">
          <a-tooltip title={v}>{v?.length ? v.join('/') : '--'}</a-tooltip>
        </div>
      );
    },
  },
];
