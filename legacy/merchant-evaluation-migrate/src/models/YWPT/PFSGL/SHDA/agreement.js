export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'count',
    dataIndex: 'count',
    title: '应签',
    width: '100px',
  },
  {
    uid: 'signedCount',
    dataIndex: 'signedCount',
    title: '已签',
    width: '100px',
  },
  {
    uid: 'notSignedCount',
    dataIndex: 'notSignedCount',
    title: '未签',
    width: '100px',
  },
  {
    uid: 'processingStatus',
    dataIndex: 'processingStatus',
    title: '完成状态',
    width: '200px',
    render(h, v) {
      return v == 1 ? '已完成' : v == 0 ? '未完成' : '--';
    },
  },
  {
    uid: 'templateType',
    dataIndex: 'templateType',
    title: '协议类型',
    width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'status',
    dataIndex: 'status',
    title: '状态',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
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
