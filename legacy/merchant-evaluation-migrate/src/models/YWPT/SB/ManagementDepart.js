export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '部门',
    width: '180px',
  },
  {
    uid: 'total',
    dataIndex: 'total',
    title: '设备总数',
    width: '100px',
  },
  {
    uid: 'inspPointNum',
    dataIndex: 'inspPointNum',
    title: '设备巡检点数',
    width: '100px',
  },
  {
    uid: 'inspNum',
    dataIndex: 'inspNum',
    title: '设备巡检次数',
    width: '100px',
  },
  {
    uid: 'inspAverageNum',
    dataIndex: 'inspAverageNum',
    title: '设备平均巡检次数',
    width: '120px',
  },
  {
    uid: 'inspRatio',
    dataIndex: 'inspRatio',
    title: '设备巡检率',
    width: '100px',
    render(h, v) {
      return v + '%';
    },
  },
  {
    uid: 'maintNum',
    dataIndex: 'maintNum',
    title: '设备维保次数',
    width: '100px',
  },
  {
    uid: 'maintAverageNum',
    dataIndex: 'maintAverageNum',
    title: '平均维保次数',
    width: '100px',
  },
  {
    uid: 'maintRatio',
    dataIndex: 'maintRatio',
    title: '设备维保率',
    width: '100px',
    render(h, v) {
      return v + '%';
    },
  },
  {
    uid: 'appealNum',
    dataIndex: 'appealNum',
    title: '设备诉求数',
    width: '100px',
  },
  {
    uid: 'ticketNum',
    dataIndex: 'ticketNum',
    title: '设备工单数',
    width: '100px',
  },
];
