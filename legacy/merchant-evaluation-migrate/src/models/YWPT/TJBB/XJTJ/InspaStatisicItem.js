// 所有巡检项的所属分类、目标类型、巡检记录总数、正常数、异常数、异常率
export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '巡检项名称',
    width: '200px',
  },
  {
    uid: 'dept',
    dataIndex: 'deptName',
    title: '所属分类',
    width: '200px',
  },
  {
    uid: 'dept',
    dataIndex: 'deptName',
    title: '目标类型',
    width: '200px',
  },
  {
    uid: 'type',
    dataIndex: 'pointType',
    title: '巡检点类型',
    width: '120px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'area',
    dataIndex: 'areaNames',
    title: '所属区域',
    width: '300px',
    render(h, v) {
      return v?.length ? v.filter((item) => !!item).join('/') : '--';
    },
  },
  {
    uid: 'count',
    dataIndex: 'count',
    title: '巡检记录总数',
    width: '100px',
    align: 'center',
  },
  {
    uid: 'normalCount',
    dataIndex: 'normalCount',
    title: '正常数',
    width: '100px',
    align: 'center',
  },
  {
    uid: 'abnormalCount',
    dataIndex: 'abnormalCount',
    title: '异常数',
    width: '100px',
    align: 'center',
  },
  {
    uid: 'unknownCount',
    dataIndex: 'unknownCount',
    title: '非正常异常数',
    width: '100px',
    align: 'center',
  },
  {
    uid: 'abnormalRate',
    dataIndex: 'abnormalRate',
    title: '异常率',
    width: '100px',
    align: 'center',
    render(h, v) {
      return v + '%';
    },
  },
];
