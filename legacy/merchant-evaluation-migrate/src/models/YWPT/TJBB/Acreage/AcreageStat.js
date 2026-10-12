export default () => [
  {
    uid: 'name',
    dataIndex: 'objectName',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'areaType',
    dataIndex: 'areaType',
    title: '区域类型',
    width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'parent',
    dataIndex: 'areaNames',
    title: '所属一级区域',
    width: '200px',
    render(h, v, r) {
      return r.areaNames[0] || '--';
    },
  },
  {
    uid: 'area',
    dataIndex: 'areaNames',
    title: '所属区域',
    width: '200px',
    render(h, v, r) {
      return r.areaNames?.join('/') || '--';
    },
  },
  {
    uid: 'deptName',
    dataIndex: 'deptName',
    title: '管理部门',
    width: '150px',
  },
  {
    uid: 'type',
    dataIndex: 'type',
    title: '档位类型',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'attribute',
    dataIndex: 'attribute',
    title: '空间属性',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'tradeModel',
    dataIndex: 'tradeModel',
    title: '经营类型',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  // add
  {
    uid: 'buildingArea',
    dataIndex: 'buildingArea',
    title: '建筑面积(m²)',
    width: '120px',
    align: 'center',
    render(h, v) {
      return v == null ? '--' : v;
    },
  },
  {
    uid: 'coverArea',
    dataIndex: 'coverArea',
    title: '占地面积(m²)',
    width: '120px',
    align: 'center',
    render(h, v) {
      return v == null ? '--' : v;
    },
  },
  {
    uid: 'leaseArea',
    dataIndex: 'leaseArea',
    title: '租赁面积(m²)',
    width: '120px',
    align: 'center',
    render(h, v) {
      return v == null ? '--' : v;
    },
  },
  {
    uid: 'leaseRealArea',
    dataIndex: 'leaseRealArea',
    title: '租赁实际面积(m²)',
    width: '200px',
    align: 'center',
    render(h, v) {
      return v == null ? '--' : v;
    },
  },
  {
    uid: 'leasePublicArea',
    dataIndex: 'leasePublicArea',
    title: '租赁公摊面积(m²)',
    width: '200px',
    align: 'center',
    render(h, v) {
      return v == null ? '--' : v;
    },
  },
  {
    uid: 'fireArea',
    dataIndex: 'fireArea',
    title: '消防面积(m²)',
    width: '120px',
    align: 'center',
    render(h, v) {
      return v == null ? '--' : v;
    },
  },
  {
    uid: 'cleanArea',
    dataIndex: 'cleanArea',
    title: '清洁面积(m²)',
    width: '120px',
    align: 'center',
    render(h, v) {
      return v == null ? '--' : v;
    },
  },
  {
    uid: 'parkingArea',
    dataIndex: 'parkingArea',
    title: '车位面积(m²)',
    width: '120px',
    align: 'center',
    render(h, v) {
      return v == null ? '--' : v;
    },
  },
];
