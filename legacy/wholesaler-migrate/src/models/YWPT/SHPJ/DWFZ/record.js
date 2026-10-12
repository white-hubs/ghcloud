export default () => [
  {
    uid: 'type',
    dataIndex: 'type',
    title: '类型',
    render(h, v, r) {
      return r.point > 0 ? '相加' : '相减';
    },
  },
  {
    uid: 'point',
    dataIndex: 'point',
    title: '分值',
  },
  {
    uid: 'createBy',
    dataIndex: 'createBy',
    title: '创建人',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
  },
  {
    uid: 'remark',
    dataIndex: 'remark',
    title: '备注',
  },
];
