export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '路线编号',
    width: '200px',
    sorter: true,
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '路线名称',
    width: '200px',
  },
  {
    uid: 'pointNum',
    dataIndex: 'pointNum',
    title: '巡逻点数',
    width: '200px',
    align: 'center',
  },
  {
    uid: 'dutyName',
    dataIndex: 'dutyName',
    title: '责任人/部门',
    width: '200px',
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
          trueLabel="开启"
          falseLabel="停止"
        />
      );
    },
  },
];
