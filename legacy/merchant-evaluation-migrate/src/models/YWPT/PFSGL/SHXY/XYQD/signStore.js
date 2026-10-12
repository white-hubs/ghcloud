export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'acreage',
    dataIndex: 'acreage',
    title: '面积',
    width: '100px',
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
    uid: 'tradeModel',
    dataIndex: 'tradeModel',
    title: '经营类型',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'companyName',
    dataIndex: 'companyName',
    title: '所属商户',
    width: '200px',
  },
];
