export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '210px',
    sorter: true,
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'type',
    dataIndex: 'typeName',
    title: '分类',
    width: '200px',
  },
  {
    uid: 'factory',
    dataIndex: 'factory',
    title: '厂商',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'model',
    dataIndex: 'model',
    title: '型号',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'num',
    dataIndex: 'num',
    title: '库存',
    width: '100px',
    align: 'center',
    render(h, v, r) {
      return (
        <div>
          <span>{v}</span>
          <app-dict-display value={r.unit} />
        </div>
      );
    },
  },
  {
    uid: 'estimate',
    dataIndex: 'estimateLow',
    title: '预警',
    width: '100px',
    render(h, v, r) {
      return r.num > r.estimateHigh ? (
        <a-tag color="red">过高</a-tag>
      ) : r.num < r.estimateLow ? (
        <a-tag color="blue">过低</a-tag>
      ) : (
        <a-tag>正常</a-tag>
      );
    },
  },
  {
    uid: 'status',
    dataIndex: 'status',
    title: '预警状态',
    width: '100px',
    render(h, v) {
      return (
        <a-tag
          color={
            v === 'spareStatus_tooHigh'
              ? 'red'
              : v === 'spareStatus_tooLow'
              ? 'blue'
              : ''
          }
        >
          <app-dict-display value={v} />
        </a-tag>
      );
    },
  },
  {
    uid: 'description',
    dataIndex: 'description',
    title: '附加描述',
    width: '400px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'time',
    dataIndex: 'time',
    title: '添加时间',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
];
