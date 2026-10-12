export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '180px',
    ellipsis: true,
  },
  {
    uid: 'companyName',
    dataIndex: 'companyName',
    title: '店铺名称',
    width: '150px',
    ellipsis: true,
    render(h, v, r) {
      return r.companyName ? '商户：' + r.companyName : '--';
    },
  },
  {
    uid: 'owner',
    dataIndex: 'ssr',
    title: '所属人',
    width: '150px',
    ellipsis: true,
    render(h, v, r) {
      return r.companyDTO ? '档主：' + r.companyDTO.owner : '--';
    },
  },
  {
    uid: 'goodsSize',
    dataIndex: 'goodsSize',
    title: '数量',
    width: '100px',
    render(h, v, r) {
      return '商品数：' + v;
    },
  },
  {
    uid: 'importedDate',
    dataIndex: 'importedDate',
    title: '进货日期',
    width: '200px',
    render(h, v, r) {
      return '进货日期：' + v;
    },
  },
  {
    uid: 'createNickName',
    dataIndex: 'createNickName',
    title: '上报人',
    ellipsis: true,
    width: '130px',
    render(h, v) {
      return '上报人：' + v;
    },
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    width: '200px',
    title: '上报时间',
    ellipsis: true,
    render(h, v) {
      return '上报时间：' + v;
    },
  },
];
