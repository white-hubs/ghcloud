export default () => [
  {
    uid: 'username',
    dataIndex: 'username',
    title: '操作用户',
    width: '150px',
  },
  {
    uid: 'method',
    dataIndex: 'method',
    title: '请求方式',
    width: '100px',
    return(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'url',
    dataIndex: 'url',
    title: '请求URL',
    width: '200px',
    render(h, v) {
      return v ? decodeURIComponent(v) : '--';
    },
  },
  {
    uid: 'requestBody',
    dataIndex: 'requestBody',
    title: '请求体',
    width: '200px',
    render(h, v) {
      return (
        <div class="ellipsis" style={{ maxWidth: '160px' }} title={v}>
          {v || '--'}
        </div>
      );
    },
  },
  {
    uid: 'responseBody',
    dataIndex: 'responseBody',
    title: '响应实体',
    width: '200px',
    render(h, v) {
      return (
        <div class="ellipsis" style={{ maxWidth: '160px' }} title={v}>
          {v || '--'}
        </div>
      );
    },
  },
  {
    uid: 'action',
    dataIndex: 'action',
    title: '事件',
    width: '150px',
  },
  {
    uid: 'status',
    dataIndex: 'status',
    title: '状态',
    width: '100px',
  },
  {
    uid: 'succeed',
    dataIndex: 'succeed',
    title: '操作结果',
    width: '100px',
    render(h, v) {
      return (
        <app-enabled-display enabled={v} trueLabel="成功" falseLabel="失败" />
      );
    },
  },
  {
    uid: 'beginTime',
    dataIndex: 'beginTime',
    title: '开始时间',
    width: '200px',
  },
  {
    uid: 'endTime',
    dataIndex: 'endTime',
    title: '结束时间',
    width: '200px',
  },
  {
    uid: 'duration',
    dataIndex: 'duration',
    title: '耗时（毫秒）',
    width: '150px',
  },
  {
    uid: 'handler',
    dataIndex: 'handler',
    title: '处理方法',
    width: '200px',
  },
];
