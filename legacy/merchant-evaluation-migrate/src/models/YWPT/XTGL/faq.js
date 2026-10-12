export default () => [
  {
    uid: 'question',
    dataIndex: 'question',
    title: '常见问题',
  },
  {
    uid: 'type',
    dataIndex: 'type',
    title: '所属类型',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'createBy',
    dataIndex: 'createBy',
    title: '创建人',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
  },
];
