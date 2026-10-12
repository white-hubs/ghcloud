export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '设备编码',
    width: '200px',
    sorter: true,
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'specification',
    dataIndex: 'iotDeviceType',
    title: '物联设备型号',
    width: '200px',
    render(h, v) {
      return v;
    },
  },
  {
    uid: 'type',
    dataIndex: 'typeName',
    title: '类型',
    width: '200px',
    // render(h, v) {
    //   return <app-dict-display value={v} />;
    // },
  },
  {
    uid: 'area',
    dataIndex: 'areaNames',
    title: '所属区域',
    width: '200px',
    render(h, v) {
      return v?.length ? v.join('/') : '--';
    },
  },
  {
    uid: 'status',
    dataIndex: 'online',
    title: '状态',
    width: '100px',
    render(h, status) {
      return <app-iot-device-status value={status} />;
    },
  },
];
