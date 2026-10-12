/**
 * 异常体温、到访境外地区、到访中高风险地区、接触感染者、与隔离人员同住、状态异常；
 */
const names = {
  abroad: '到访境外地区',
  riskDistrict: '到访中高风险地区',
  touchPatient: '接触感染者',
  liveTogether: '与隔离人员同住',
  abnormalStatus: '状态异常',
  abnormalTemp: '异常体温',
};
export default () => [
  {
    uid: 'name',
    dataIndex: 'type',
    title: '名称',
    width: '200px',
    render(h, v) {
      return names[v];
    },
  },
  {
    uid: 'companyNum',
    dataIndex: 'companyNum',
    title: '商户人数',
    width: '100px',
  },
  {
    uid: 'staffNum',
    dataIndex: 'staffNum',
    title: '员工人数',
    width: '100px',
  },
];
