export default () => [
  {
    uid: 'id',
    dataIndex: 'id',
    title: '单号',
    // width: '220px',
    // render(h, v) {
    //   return v?.length ? v.join('/') : '--';
    // },
  },
  {
    uid: 'month',
    dataIndex: 'month',
    title: '分类名称',
  },
  {
    uid: 'nickname',
    dataIndex: 'nickname',
    title: '计量单位',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
  },
];
