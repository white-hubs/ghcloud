export default () => [
  {
    uid: 'securityCode',
    dataIndex: 'securityCode',
    title: '隐患编号',
    // width: '200px',
    sorter: true,
  },
  {
    uid: 'securityDesc',
    dataIndex: 'securityDesc',
    title: '问题描述',
    // width: '200px',
  },
  {
    uid: 'dangerLevel',
    dataIndex: 'dangerLevel',
    title: '风险等级',
    // width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'areaNames',
    dataIndex: 'areaNames',
    title: '位置',
    // width: '300px',
    render(h, v, r) {
      return (
        (r.areaNames?.join('/') || '--') + (r.addrDesc ? '/' + r.addrDesc : '')
      );
    },
  },
  {
    uid: 'securityStatus',
    dataIndex: 'securityStatus',
    title: '状态',
    // width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  // {
  //   uid: 'createTime',
  //   dataIndex: 'createTime',
  //   title: '创建时间',
  //   width: '200px',
  // },
  {
    uid: 'contacter',
    dataIndex: 'contacter',
    title: '联系人',
    width: '200px',
  },
  {
    uid: 'phone',
    dataIndex: 'phone',
    title: '联系方式',
    width: '200px',
  },
];
