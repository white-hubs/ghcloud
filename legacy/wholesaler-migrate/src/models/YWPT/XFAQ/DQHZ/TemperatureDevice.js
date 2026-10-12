export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '地点',
    width: '200px',
    sorter: true,
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '设备编号',
    width: '200px',
  },
  {
    uid: 'specification',
    dataIndex: 'iotDeviceType',
    title: '设备名称',
    width: '200px',
    render(h, v) {
      return v;
    },
  },
  {
    uid: 'type',
    dataIndex: 'typeName',
    title: '温度A（℃）',
    width: '200px',
    // render(h, v) {
    //   return <app-dict-display value={v} />;
    // },
  },
  {
    uid: 'area',
    dataIndex: 'areaNames',
    title: '温度B（℃）',
    width: '200px',
    render(h, v) {
      return v?.length ? v.join('/') : '--';
    },
  },
  {
    uid: 'type',
    dataIndex: 'typeName',
    title: '温度C（℃）',
    width: '200px',
    // render(h, v) {
    //   return <app-dict-display value={v} />;
    // },
  },
  {
    uid: 'type',
    dataIndex: 'typeName',
    title: '报警/预警时间',
    width: '200px',
    // render(h, v) {
    //   return <app-dict-display value={v} />;
    // },
  },
  {
    uid: 'status',
    dataIndex: 'status',
    title: '状态',
    width: '100px',
    render(h, status) {
      return <app-dict-display value={status} />;
    },
  },
  // {
  //   uid: 'createTime',
  //   dataIndex: 'createTime',
  //   title: '创建时间',
  //   width: '200px',
  // },
];
