export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '200px',
  },
  {
    uid: 'pointName',
    dataIndex: 'pointName',
    title: '风险点',
    width: '150px',
  },
  {
    uid: 'riskItemName',
    dataIndex: 'riskItemName',
    title: '风险项',
    width: '150px',
  },
  {
    uid: 'areaNames',
    dataIndex: 'areaNames',
    title: '所属区域',
    width: '150px',
    render(h, v) {
      return v?.length ? v.join('/') : '--';
    },
  },
  {
    uid: 'evaluateGrade',
    dataIndex: 'evaluateGrade',
    title: '评级级别',
    width: '150px',
    render(h, v) {
      return v ? <app-dict-display value={v} /> : '--';
    },
  },
  {
    uid: 'riskGrade',
    dataIndex: 'riskGrade',
    title: '风险等级',
    width: '150px',
    render(h, v, r) {
      const levelMap = {
        riskLevel_low: {
          label: '蓝',
          color: 'blue',
        },
        riskLevel_commonly: {
          label: '黄',
          color: 'yellow',
        },
        riskLevel_more: {
          label: '橙',
          color: 'orange',
        },
        riskLevel_major: {
          label: '红',
          color: 'red',
        },
      };
      return (
        <span style={{ color: levelMap[v].color }}>{levelMap[v].label}</span>
      );
    },
  },
  {
    uid: 'accidentType',
    dataIndex: 'accidentType',
    title: '事故类型',
    width: '100px',
    render(h, v) {
      return v ? <app-dict-display value={v} /> : '--';
    },
  },
  {
    uid: 'handleStatus',
    dataIndex: 'handleStatus',
    title: '处理状态',
    width: '100px',
    render(h, v) {
      return v === 'riskStatus_notHandle' ? (
        '未处理'
      ) : v === 'riskStatus_eliminate' ? (
        '已消除'
      ) : (
        <app-dict-display value={v} />
      );
    },
  },
  {
    uid: 'createBy',
    dataIndex: 'createBy',
    title: '创建人',
    width: '150px',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
  },
];
