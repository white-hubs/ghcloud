export default () => [
  {
    uid: 'point',
    dataIndex: 'point',
    title: '编号',
    width: '220px',
  },
  {
    uid: 'pointName',
    dataIndex: 'pointName',
    title: '维保任务',
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
    uid: 'beginTime',
    dataIndex: 'beginTime',
    title: '维保人',
  },
  {
    uid: 'beginTime',
    dataIndex: 'beginTime',
    title: '维保结果',
  },
  {
    uid: 'createBy',
    dataIndex: 'createBy',
    title: '维保时间',
  },
];
