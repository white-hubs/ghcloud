export default () => [
  {
    uid: 'code',
    dataIndex: 'linkageCode',
    title: '策略编号',
    width: '220px',
    sorter: true,
  },
  {
    uid: 'name',
    dataIndex: 'linkageName',
    title: '策略名称',
    width: '250px',
  },
  {
    uid: 'type',
    dataIndex: 'linkageCategory',
    title: '策略类型',
    width: '100px',
    render(h, v) {
      return <app-enum-display code="LinkageCategory" value={v + ''} />;
    },
  },
  {
    uid: 'triggerNum',
    dataIndex: 'triggerNum',
    title: '触发次数',
    width: '100px',
    render(h, v) {
      return v || 0;
    },
  },
  {
    uid: 'createBy',
    dataIndex: 'createBy',
    title: '创建人',
    width: '200px',
    render(h, v) {
      return <app-user-display id={v} />;
    },
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
  },
  {
    uid: 'status',
    dataIndex: 'status',
    title: '状态',
    width: '100px',
    render(h, v) {
      return (
        <app-enabled-display
          enabled={v}
          trueLabel="已启用"
          falseLabel="已停用"
        />
      );
    },
  },
];
