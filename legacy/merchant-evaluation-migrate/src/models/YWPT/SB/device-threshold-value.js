export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '220px',
    sorter: true,
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
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

  {
    uid: 'ratedCurrent',
    dataIndex: 'ratedCurrent',
    title: '额定电流',
    width: '100px',
    align: 'center',
    render(h, v) {
      return v != null ? v + ' A' : '--';
    },
  },
];
