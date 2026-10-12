export default () => [
  {
    uid: 'sourceId',
    dataIndex: 'sourceId',
    title: '来源ID（联动事件ID）',
    width: '200px',
  },
  {
    uid: 'deviceId',
    dataIndex: 'deviceId',
    title: '设备ID',
    width: '200px',
  },
  {
    uid: 'beginTime',
    dataIndex: 'beginTime',
    title: '第一次报警',
    width: '200px',
  },
  {
    uid: 'endTime',
    dataIndex: 'endTime',
    title: '最后一次报警',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'triggerCount',
    dataIndex: 'triggerCount',
    title: '报警次数',
    width: '100px',
    align: 'center',
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '报警',
    width: '300px',
  },
  {
    uid: 'type',
    dataIndex: 'type',
    title: '业务类型',
    width: '120px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'subType',
    dataIndex: 'subType',
    title: '报警类型',
    width: '150px',
    render(h, v) {
      return v ? <app-dict-display value={v} /> : '--';
    },
  },
  {
    uid: 'level',
    dataIndex: 'level',
    title: '报警等级',
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
    uid: 'status',
    dataIndex: 'status',
    title: '状态',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'address',
    dataIndex: 'address',
    title: '地址',
    width: '300px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'ticketinstId',
    dataIndex: 'ticketinstId',
    title: '工单ID',
    width: '200px',
  },
  {
    uid: 'handleTime',
    dataIndex: 'handleTime',
    title: '处理时间',
    width: '200px',
  },
  {
    uid: 'handleUserId',
    dataIndex: 'handleUserId',
    title: '处理人ID',
    width: '200px',
  },
  {
    uid: 'handleUserName',
    dataIndex: 'handleUserName',
    title: '处理人账号',
    width: '200px',
  },
  {
    uid: 'handleUserNickname',
    dataIndex: 'handleUserNickname',
    title: '处理人名称',
    width: '200px',
  },
  {
    uid: 'handleUserDeptId',
    dataIndex: 'handleUserDeptId',
    title: '处理人部门',
    width: '200px',
  },
  {
    uid: 'handleUserDeptName',
    dataIndex: 'handleUserDeptName',
    title: '处理人部门名称',
    width: '200px',
  },
  {
    uid: 'handleResult',
    dataIndex: 'handleResult',
    title: '处理结果',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'noticeLevel',
    dataIndex: 'noticeLevel',
    title: '已通知等级',
    width: '200px',
  },
  {
    uid: 'noticeTime',
    dataIndex: 'noticeTime',
    title: '已通知时间',
    width: '200px',
  },
  {
    uid: 'abbr',
    dataIndex: 'abbr',
    title: '项目简称',
    width: '200px',
  },
  // {
  //   uid: 'name',
  //   dataIndex: 'name',
  //   title: '报警名称',
  //   width: '200px',
  // },
  // {
  //   uid: 'time',
  //   dataIndex: 'time',
  //   title: '报警时间',
  //   width: '200px',
  // },
  // {
  //   uid: 'type',
  //   dataIndex: 'type',
  //   title: '报警类型编码',
  //   width: '200px',
  // },
  // {
  //   uid: 'typeText',
  //   dataIndex: 'typeText',
  //   title: '报警类型名称',
  //   width: '200px',
  // },
  // {
  //   uid: 'result',
  //   dataIndex: 'result',
  //   title: '处理结果编码',
  //   width: '200px',
  // },
  // {
  //   uid: 'resultText',
  //   dataIndex: 'resultText',
  //   title: '处理结果名称',
  //   width: '200px',
  // },
  // {
  //   uid: 'status',
  //   dataIndex: 'status',
  //   title: '状态编码',
  //   width: '200px',
  // },
  // {
  //   uid: 'statusText',
  //   dataIndex: 'statusText',
  //   title: '状态名称',
  //   width: '200px',
  // },
  // {
  //   uid: 'responseMinute',
  //   dataIndex: 'responseMinute',
  //   title: '响应时长（分钟数）',
  //   width: '200px',
  // },
  // {
  //   uid: 'linkageCategory',
  //   dataIndex: 'linkageCategory',
  //   title: '策略类型（1 条件策略 2 设备报警 3 定时策略）',
  //   width: '200px',
  // },
  // {
  //   uid: 'iotCategory',
  //   dataIndex: 'iotCategory',
  //   title: 'IOT事件类别',
  //   width: '200px',
  // },
  // {
  //   uid: 'iotSecondCategory',
  //   dataIndex: 'iotSecondCategory',
  //   title: 'IOT事件子类别',
  //   width: '200px',
  // },
  // {
  //   uid: 'blName',
  //   dataIndex: 'blName',
  //   title: '黑名单名称',
  //   width: '200px',
  // },
];
