export default () => [
  {
    uid: 'eventCode',
    dataIndex: 'eventCode',
    title: '日志ID',
    width: '220px',
    sorter: true,
  },

  {
    uid: 'iotEventName',
    dataIndex: 'iotEventName',
    title: '事件名称',
    width: '250px',
  },
  {
    uid: 'linkageName',
    dataIndex: 'linkageName',
    title: '策略名称',
    width: '250px',
  },
  {
    uid: 'triggeTime',
    dataIndex: 'triggeTime',
    title: '发生时间',
    width: '200px',
  },
  {
    uid: 'eventStatus',
    dataIndex: 'eventStatus',
    title: '状态',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
];
