// 区域
// 隐患数
// 高级
// 中级
// 低级
// 未处理数
// 已处理数
// 处理完成率
export default () => [
  {
    uid: 'date',
    dataIndex: 'time',
    title: '日期',
    width: '200px',
    // sorter: true,
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'area',
    dataIndex: 'areaNames',
    title: '区域',
    width: '300px',
    render(h, v) {
      return v?.length ? v.join('/') : '--';
    },
  },
  {
    uid: 'security',
    dataIndex: 'security',
    title: '隐患数',
    width: '100px',
  },
  {
    uid: 'high',
    dataIndex: 'high',
    title: '高级',
    width: '100px',
  },
  {
    uid: 'middle',
    dataIndex: 'middle',
    title: '中级',
    width: '100px',
  },
  {
    uid: 'low',
    dataIndex: 'low',
    title: '低级',
    width: '100px',
  },
  {
    uid: 'notHandle',
    dataIndex: 'notHandle',
    title: '未处理数',
    width: '100px',
  },
  {
    uid: 'handle',
    dataIndex: 'handle',
    title: '已处理数',
    width: '100px',
  },
  {
    uid: 'handleRate',
    dataIndex: 'handleRate',
    title: '处理完成率',
    width: '100px',
    render(h, v) {
      return (v ? v : 0) + '%';
    },
  },
];
