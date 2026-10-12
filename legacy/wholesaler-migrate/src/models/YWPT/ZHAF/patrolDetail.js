export default () => [
  {
    uid: 'deviceId',
    dataIndex: 'deviceId',
    title: '编号',
    width: '200px',
    sorter: true,
  },
  {
    uid: 'deivceName',
    dataIndex: 'deivceName',
    title: '巡逻点',
    width: '200px',
  },
  {
    uid: 'deivceAreaName',
    dataIndex: 'deivceAreaName',
    title: '所在区域',
    width: '200px',
    render(h, v, r) {
      return r.areaNames.join(',');
    },
  },
  {
    uid: 'deivceAddress',
    dataIndex: 'deivceAddress',
    title: '安装地址',
    width: '200px',
  },
  // {
  //   uid: 'areaName',
  //   dataIndex: 'areaName',
  //   title: '区域',
  //   width: '200px',
  // },
  // {
  //   uid: 'contactAddress',
  //   dataIndex: 'contactAddress',
  //   title: '地址',
  //   width: '200px',
  // },
];
