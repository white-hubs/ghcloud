export default () => [
  {
    uid: 'userId',
    dataIndex: 'userId',
    title: '用户ID',
    width: '200px',
  },
  {
    uid: 'userType',
    dataIndex: 'userType',
    title: '用户类型',
    width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'username',
    dataIndex: 'username',
    title: '用户账号',
    width: '200px',
  },
  {
    uid: 'nickname',
    dataIndex: 'nickname',
    title: '姓名',
    width: '200px',
  },
  {
    uid: 'mobile',
    dataIndex: 'mobile',
    title: '手机号码',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'identityCard',
    dataIndex: 'identityCard',
    title: '身份证号码',
    width: '200px',
  },
  {
    uid: 'deptId',
    dataIndex: 'deptId',
    title: '部门ID',
    width: '200px',
  },
  {
    uid: 'deptName',
    dataIndex: 'deptName',
    title: '部门名称',
    width: '200px',
  },
  {
    uid: 'areaId1',
    dataIndex: 'areaId1',
    title: '一级区域',
    width: '200px',
  },
  {
    uid: 'areaId2',
    dataIndex: 'areaId2',
    title: '二级区域',
    width: '200px',
  },
  {
    uid: 'areaId3',
    dataIndex: 'areaId3',
    title: '三级区域',
    width: '200px',
  },
  {
    uid: 'areaNames',
    dataIndex: 'areaNames',
    title: '所属区域',
    width: '200px',
    render(h, v) {
      return '所属区域: ' + (v?.join('/') || '--');
    },
  },
  {
    uid: 'companyId',
    dataIndex: 'companyId',
    title: '所在商户',
    width: '200px',
  },
  {
    uid: 'companyName',
    dataIndex: 'companyName',
    title: '商户名称',
    width: '200px',
    render(h, v) {
      return '商户名称: ' + (v || '--');
    },
  },
  {
    uid: 'storeId',
    dataIndex: 'storeId',
    title: '所在档位',
    width: '200px',
  },
  {
    uid: 'storeName',
    dataIndex: 'storeName',
    title: '档位名称',
    width: '200px',
    render(h, v) {
      return '档位名称: ' + (v || '--');
    },
  },
  {
    uid: 'managerDeptName',
    dataIndex: 'managerDeptName',
    title: '管理部门',
    width: '200px',
    render(h, v) {
      return '管理部门: ' + (v || '--');
    },
  },
];
