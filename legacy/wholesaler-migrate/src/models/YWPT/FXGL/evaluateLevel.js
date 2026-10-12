export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '评价级别',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'riskGrade',
    dataIndex: 'riskGrade',
    title: '风险等级',
    width: '200px',
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
        <span style={{ color: levelMap[v]?.color }}>{levelMap[v]?.label}</span>
      );
    },
  },
  {
    uid: 'pointTotal',
    dataIndex: 'pointTotal',
    title: '风险点数',
    width: '200px',
  },
  {
    uid: 'total',
    dataIndex: 'total',
    title: '风险记录数',
    width: '200px',
  },
];
