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
    title: '类型',
    width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'flowId',
    dataIndex: 'flowName',
    title: '流程',
    width: '200px',
  },
  {
    uid: 'formId',
    dataIndex: 'formName',
    title: '表单',
    width: '200px',
  },
  {
    uid: 'enabled',
    dataIndex: 'enabled',
    title: '状态',
    width: '200px',
    render(h, enabled) {
      return <app-enabled-display enabled={enabled} />;
    },
  },
  {
    uid: 'createUser',
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
];
