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
    width: '120px',
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
    title: '所属部门',
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
      return v?.join('/') || '--';
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
    title: '所属商户',
    width: '200px',
    render(h, v) {
      return v || '--';
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
      return v || '--';
    },
  },
  {
    uid: 'owner',
    dataIndex: 'owner',
    title: '职位',
    width: '100px',
    render(h, v) {
      return v ? '档主' : '从业人员';
    },
  },
  {
    uid: 'managerDeptId',
    dataIndex: 'managerDeptId',
    title: '管理部门',
    width: '200px',
  },
  {
    uid: 'managerDeptName',
    dataIndex: 'managerDeptName',
    title: '管理部门',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'location',
    dataIndex: 'location',
    title: '是否居住园区',
    width: '200px',
    render(h, v) {
      return v ? '是' : '否';
    },
  },
  {
    uid: 'address',
    dataIndex: 'address',
    title: '其他居住地址',
    width: '200px',
    render(h, v, r) {
      return r.location ? v || '--' : '--';
    },
  },
  {
    uid: 'riskDistrict',
    dataIndex: 'riskDistrict',
    title: '14天是否来自或途径中高风险地区',
    width: '200px',
    render(h, v) {
      return v ? '是' : '否';
    },
  },
  {
    uid: 'vaccination',
    dataIndex: 'vaccination',
    title: '是否接种疫苗',
    width: '200px',
    render(h, v, r) {
      if (r.firstVaccine && r.secondVaccine) {
        return '接种完成';
      }
      if (r.firstVaccine) {
        return '已接种第一针';
      }
      if (r.secondVaccine) {
        return '已接种第二针';
      }
      return '未接种';
    },
  },
  {
    uid: 'firstVaccine',
    dataIndex: 'firstVaccine',
    title: '是否接种第一针疫苗',
    width: '200px',
    render(h, v) {
      return v ? '是' : '否';
    },
  },
  {
    uid: 'secondVaccine',
    dataIndex: 'secondVaccine',
    title: '是否接种第二针疫苗',
    width: '200px',
    render(h, v) {
      return v ? '是' : '否';
    },
  },
  {
    uid: 'firstVaccineTime',
    dataIndex: 'firstVaccineTime',
    title: '第一针接种时间',
    width: '200px',
  },
  {
    uid: 'secondVaccineTime',
    dataIndex: 'secondVaccineTime',
    title: '第二针接种时间',
    width: '200px',
  },
  {
    uid: 'notVaccinationRemark',
    dataIndex: 'notVaccinationRemark',
    title: '未接种原因',
    width: '200px',
    render(h, v, r) {
      return r.vaccination ? '--' : v;
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
