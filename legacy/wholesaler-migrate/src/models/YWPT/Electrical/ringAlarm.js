export default () => [
  {
    uid: 'noticeTime',
    dataIndex: 'noticeTime',
    title: '报警时间',
    width: '160px',
  },
  {
    uid: 'deviceName',
    dataIndex: 'deviceName',
    title: '报警设备',
    width: '150px',
  },
  {
    uid: 'address',
    dataIndex: 'address',
    title: '报警地址',
    width: '150px',
  },
  {
    uid: 'level',
    dataIndex: 'level',
    title: '报警级别',
    width: '150px',
    render(h, v) {
      const levelMap = {
        '3': {
          label: 'Ⅲ级 （一般）',
          color: '#1890ff',
          number: 3,
          value: '3',
        },
        '2': {
          label: 'Ⅱ级 （较重）',
          color: '#faad14',
          number: 2,
          value: '2',
        },
        '1': {
          label: 'Ⅰ级 （严重）',
          color: '#f5222d',
          number: 1,
          value: '1',
        },
        '': {
          label: '--',
          color: '#666',
          number: null,
          value: '',
        },
      };
      return (
        <span style={{ color: levelMap[v].color }}>{levelMap[v].label}</span>
      );
    },
  },
  {
    uid: 'type',
    dataIndex: 'type',
    title: '报警类型',
    width: '100px',
    render(h, v) {
      return v ? <app-dict-display value={v} /> : '--';
    },
  },
  {
    uid: 'status',
    dataIndex: 'status',
    title: '状态',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
];
