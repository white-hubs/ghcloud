export default () => [
  {
    uid: 'appealType',
    dataIndex: 'appealType',
    title: '诉求类型',
    width: '200px',
  },
  {
    uid: 'createBy',
    dataIndex: 'createBy',
    title: '创建人',
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
    render(h, v) {
      return v || '--';
    },
  },
];
