export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '220px',
  },
  {
    uid: 'itemName',
    dataIndex: 'itemName',
    title: '巡检项',
    width: '200px',
  },
  {
    uid: 'itemResultName',
    dataIndex: 'itemResultName',
    title: '结果项',
    width: '200px',
  },
  {
    uid: 'itemResultLevel',
    dataIndex: 'itemResultLevel',
    title: '隐患等级',
    width: '150px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'standardName',
    dataIndex: 'standardName',
    title: '所属巡检标准',
    width: '200px',
  },
  {
    uid: 'createBy',
    dataIndex: 'createBy',
    title: '创建人',
    width: '200px',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
  },
];
