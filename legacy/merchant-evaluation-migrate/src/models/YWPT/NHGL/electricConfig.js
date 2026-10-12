export default () => [
  {
    uid: 'deviceCode',
    dataIndex: 'deviceCode',
    title: '设备编号',
    width: '200px',
    sorter: true,
  },
  {
    uid: 'deviceName',
    dataIndex: 'deviceName',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'areaNames',
    dataIndex: 'areaNames',
    title: '地址',
    width: '200px',
    render(h, v) {
      return v?.length ? v.join('/') : '--';
    },
  },
  {
    uid: 'dl',
    dataIndex: 'dl',
    title: '电量(°)',
    width: '200px',
  },
  {
    uid: 'updateTime',
    dataIndex: 'updateTime',
    title: '上报时间',
    width: '200px',
  },
];
