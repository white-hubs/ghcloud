export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '200px',
    sorter: true,
  },
  {
    uid: 'appealType',
    dataIndex: 'appealTypeCode',
    title: '诉求类型',
    width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'ticket',
    dataIndex: 'ticketName',
    title: '工单模板',
    width: '200px',
  },
];
