export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '200px',
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'owner',
    dataIndex: 'owner',
    title: '所属人姓名',
    width: '200px',
  },
  {
    uid: 'mobile',
    dataIndex: 'mobile',
    title: '电话号码',
    width: '200px',
  },
  {
    uid: 'stallName',
    dataIndex: 'stallName',
    title: '档位名称',
    width: '100px',
  },
  {
    uid: 'tradeModel',
    dataIndex: 'tradeModel',
    title: '经营类型',
    width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'acreage',
    dataIndex: 'acreage',
    title: '面积',
    width: '100px',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
  },
  {
    uid: 'bim',
    dataIndex: 'bimId',
    title: 'BIM绑定',
    width: '100px',
    render(h, v) {
      return v?.bimInfo?.ecode ? '已绑定' : '未绑定';
    },
  },
  {
    uid: 'companyUserDTOS',
    dataIndex: 'companyUserDTOS',
    title: '员工',
    width: '150px',
    render(h, v) {
      return v?.length ? v.map((item) => item.nickname).join(', ') : '无';
    },
  },
  {
    uid: 'securityFileDTOS',
    dataIndex: 'securityFileDTOS',
    title: '安全协议',
    width: '150px',

    render(h, v) {
      return v?.length ? '已签订' : '未签订';
    },
  },
];
