export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '200px',
  },
  {
    uid: 'signingWay',
    dataIndex: 'signingWay',
    title: '签约方式',
    width: '200px',
    render(h, v) {
      return v == 1 ? '续签' : v == 0 ? '新签' : '未知';
    },
  },
  {
    uid: 'contractTypeDto',
    dataIndex: 'contractTypeDto',
    title: '合同类型',
    width: '200px',
    render(h, v) {
      return v?.name || '---';
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
