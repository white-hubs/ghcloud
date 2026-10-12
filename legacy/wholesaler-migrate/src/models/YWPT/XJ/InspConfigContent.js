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
    dataIndex: 'type',
    title: '分类',
    width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'deviceTypeName',
    dataIndex: 'deviceTypeName',
    title: '设备类型',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
  },
  {
    uid: 'enabled',
    dataIndex: 'enabled',
    title: '状态',
    width: '100px',
    render(h, enabled) {
      return (
        <app-enabled-display
          enabled={enabled}
          trueLabel="启用"
          falseLabel="停用"
        />
      );
    },
  },
];
