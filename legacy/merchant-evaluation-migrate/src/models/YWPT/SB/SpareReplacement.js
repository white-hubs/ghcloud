export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '210px',
    sorter: true,
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'type',
    dataIndex: 'typeName',
    title: '分类',
    width: '200px',
  },
  {
    uid: 'factory',
    dataIndex: 'factory',
    title: '厂商',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'model',
    dataIndex: 'model',
    title: '型号',
    width: '100px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'price',
    dataIndex: 'price',
    title: '单价(元)',
    width: '100px',
    align: 'center',
    render(h, v) {
      return v;
    },
  },
  {
    uid: 'useNum',
    dataIndex: 'useNum',
    title: '数量',
    width: '100px',
    align: 'center',
    render(h, v) {
      return v;
    },
  },
  {
    uid: 'unit',
    dataIndex: 'unit',
    title: '单位',
    width: '100px',
    align: 'center',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'total',
    dataIndex: 'total',
    title: '小计(元)',
    width: '160px',
    align: 'center',
    render: (h, v, r) => {
      return r.price * r.useNum || 0;
    },
  },
  {
    uid: 'deviceName',
    dataIndex: 'deviceName',
    title: '设备名称',
    width: '200px',
  },
  {
    uid: 'deviceTypeName',
    dataIndex: 'deviceTypeName',
    title: '设备类型',
    width: '200px',
  },
  {
    uid: 'businessType',
    dataIndex: 'businessType',
    title: '业务类型',
    width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'areaNames',
    dataIndex: 'areaNames',
    title: '设备所在区域',
    width: '200px',
    render(h, v) {
      return v ? v.join('/') : '--';
    },
  },
  {
    uid: 'createBy',
    dataIndex: 'createByName',
    title: '创建用户',
    width: '200px',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
  },
];
