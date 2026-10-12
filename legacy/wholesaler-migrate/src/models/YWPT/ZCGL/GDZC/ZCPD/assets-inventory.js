export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '盘点编号',
    width: '150px',
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '盘点名称',
    width: '150px',
  },
  {
    uid: 'planBeginDate',
    dataIndex: 'planBeginDate',
    title: '计划时间',
    width: '350px',
    render(h, m, v) {
      return (
        <span>
          {v.planBeginDate}~{v.planEndDate}
        </span>
      );
    },
  },
  {
    uid: 'username',
    dataIndex: 'username',
    title: '盘点人',
    width: '150px',
  },
  {
    uid: 'range',
    dataIndex: 'range',
    title: '盘点情况',
    width: '100px',
    render(h, v) {
      return (
        <span>{v === 'assetStockingRange_all' ? '所有' : '指定资产'}</span>
      );
    },
  },
  {
    uid: 'status',
    dataIndex: 'status',
    title: '状态',
    width: '100px',
    render(h, v, r) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'realBeginDate',
    dataIndex: 'realBeginDate',
    title: '开始时间',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'realEndDate',
    dataIndex: 'realEndDate',
    title: '完成时间',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
  },
];
