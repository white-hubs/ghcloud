export default () => [
  {
    uid: 'objectType',
    dataIndex: 'objectType',
    title: '对象类型(区域、空间)',
    width: '200px',
  },
  {
    uid: 'objectId',
    dataIndex: 'objectId',
    title: '对象ID',
    width: '200px',
  },
  {
    uid: 'areaName',
    dataIndex: 'areaName',
    title: '区域名称',
    width: '200px',
    render(h, v, r) {
      return r.object.name;
    },
  },
  {
    uid: 'areaType',
    dataIndex: 'areaType',
    title: '区域类型',
    width: '100px',
    render(h, v, r) {
      return <app-dict-display value={r.object.type} />;
    },
  },
  {
    uid: 'areaLevel',
    dataIndex: 'areaLevel',
    title: '区域级别',
    width: '100px',
    render(h, v, r) {
      return <app-dict-display value={r.object.level} />;
    },
  },
  {
    uid: 'spaceName',
    dataIndex: 'spaceName',
    title: '空间名称',
    width: '200px',
    render(h, v, r) {
      return r.object.name;
    },
  },
  {
    uid: 'spaceAttr',
    dataIndex: 'spaceAttr',
    title: '空间属性',
    width: '100px',
    render(h, v, r) {
      return <app-dict-display value={r.object.attribute} />;
    },
  },
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
  {
    uid: 'updateBy',
    dataIndex: 'updateBy',
    title: '更新人',
    width: '200px',
  },
  {
    uid: 'updateTime',
    dataIndex: 'updateTime',
    title: '更新时间',
    width: '200px',
  },
];
