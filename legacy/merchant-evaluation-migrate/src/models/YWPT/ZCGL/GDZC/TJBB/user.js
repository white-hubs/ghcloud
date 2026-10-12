export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '姓名',
    width: '220px',
    // render(h, v) {
    //   return v?.length ? v.join('/') : '--';
    // },
  },
  {
    uid: 'deptName',
    dataIndex: 'deptName',
    title: '所在部门',
  },
  {
    uid: 'assetTotal',
    dataIndex: 'assetTotal',
    title: '资产总数',
  },
  {
    uid: 'freeAsset',
    dataIndex: 'freeAsset',
    title: '闲置',
  },
  {
    uid: 'useAsset',
    dataIndex: 'useAsset',
    title: '在用',
  },
  {
    uid: 'loseAsset',
    dataIndex: 'loseAsset',
    title: '盘亏',
  },
  // {
  //   uid: 'createBy',
  //   dataIndex: 'createBy',
  //   title: '故障',
  // },
  {
    uid: 'handleAsset',
    dataIndex: 'handleAsset',
    title: '处置',
  },
];
