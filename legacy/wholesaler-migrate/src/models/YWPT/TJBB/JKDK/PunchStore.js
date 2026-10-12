/**
 * 姓名、性别、部门、打卡天数、缺卡天数、
 * 正常体温、异常体温、到访境外地区天数、到访中高风险地区天数、
 * 接触感染者天数、与隔离人员同住天数、状态异常天数、打卡异常率
 * */
export default () => [
  {
    uid: 'nickname',
    dataIndex: 'nickname',
    title: '姓名',
    width: '100px',
  },
  {
    uid: 'gender',
    dataIndex: 'gender',
    title: '性别',
    width: '100px',
    render(h, v) {
      return ['未知', '男', '女'][v] || '未知';
    },
  },
  {
    uid: 'deptName',
    dataIndex: 'deptName',
    title: '部门',
    width: '100px',
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
    uid: 'companyName',
    dataIndex: 'companyName',
    title: '所属商户',
    width: '200px',
  },
  {
    uid: 'punchDays',
    dataIndex: 'punchDays',
    title: '打卡天数',
    width: '100px',
  },
  {
    uid: 'noPunchDays',
    dataIndex: 'noPunchDays',
    title: '缺卡天数',
    width: '100px',
  },
  {
    uid: 'normalTempDays',
    dataIndex: 'normalTempDays',
    title: '正常体温(天)',
    width: '100px',
  },
  {
    uid: 'abnormalTempDays',
    dataIndex: 'abnormalTempDays',
    title: '异常体温(天)',
    width: '100px',
  },
  {
    uid: 'abroadDays',
    dataIndex: 'abroadDays',
    title: '到访境外地区天数',
    width: '100px',
  },
  {
    uid: 'riskDistrictDays',
    dataIndex: 'riskDistrictDays',
    title: '到访中高风险地区天数',
    width: '100px',
  },
  {
    uid: 'touchPatientDays',
    dataIndex: 'touchPatientDays',
    title: '接触感染者天数',
    width: '100px',
  },
  {
    uid: 'liveTogetherDays',
    dataIndex: 'liveTogetherDays',
    title: '与隔离人员同住天数',
    width: '100px',
  },
  {
    uid: 'abnormalStatusDays',
    dataIndex: 'abnormalStatusDays',
    title: '状态异常天数',
    width: '100px',
  },
  {
    uid: 'abnormalRate',
    dataIndex: 'abnormalRate',
    title: '打卡异常率',
    width: '100px',
    render(h, v) {
      return v + '%';
    },
  },
];
