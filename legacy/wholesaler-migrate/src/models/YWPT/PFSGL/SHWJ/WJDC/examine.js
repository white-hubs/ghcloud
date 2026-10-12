import moment from "moment";
export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '220px',
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '调查名称',
    width: '200px',
  },
  {
    uid: 'count',
    dataIndex: 'count',
    title: '应填',
    width: '100px',
  },
  {
    uid: 'signedCount',
    dataIndex: 'signedCount',
    title: '已填',
    width: '100px',
  },
  {
    uid: 'notSignedCount',
    dataIndex: 'notSignedCount',
    title: '未填',
    width: '100px',
  },
  {
    uid: 'processingStatus',
    dataIndex: 'processingStatus',
    title: '完成状态',
    width: '100px',
    render(h, v) {
      return v == 1 ? '已完成' : v == 0 ? '未完成' : '--';
    },
  },

  {
    uid: 'tempType',
    dataIndex: 'tempType',
    title: '调查类型',
    width: '200px',
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
    render(h, v) {
      return v ? moment(v).format('YYYY-MM-DD HH:mm:ss') : ""
    }
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
];
