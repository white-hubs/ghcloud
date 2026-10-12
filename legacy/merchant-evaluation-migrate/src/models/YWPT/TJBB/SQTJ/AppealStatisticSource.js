export default () => [
  {
    uid: 'type',
    dataIndex: 'type',
    title: '诉求类型',
    width: '200px',
    // sorter: true,
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'source',
    dataIndex: 'type',
    title: '诉求来源',
    width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
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
    uid: 'device',
    dataIndex: 'deviceDTOS',
    title: '设备',
    width: '300px',
    render(h, v) {
      return v?.length ? v.map((item) => item.name).join(',') : '--';
    },
  },
  {
    uid: 'total',
    dataIndex: 'total',
    title: '诉求数',
    width: '100px',
  },
  {
    uid: 'uncompleted',
    dataIndex: 'uncompleted',
    title: '未完成',
    width: '100px',
  },
  {
    uid: 'completed',
    dataIndex: 'completed',
    title: '已完成',
    width: '100px',
  },
  {
    uid: 'completedPercent',
    dataIndex: 'completionRate',
    title: '完成率',
    width: '100px',
    render(h, v) {
      return v + '%';
    },
  },
  {
    uid: 'ticketNum',
    dataIndex: 'turnTicketinst',
    title: '转工单数',
    width: '100px',
  },
  {
    uid: 'ticketPercent',
    dataIndex: 'turnTicketinstRate',
    title: '转工单率',
    width: '100px',
    render(h, v) {
      return v + '%';
    },
  },
];
