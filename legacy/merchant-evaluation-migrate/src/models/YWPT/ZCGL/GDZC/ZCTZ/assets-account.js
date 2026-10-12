export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '资产编号',
    width: '200px',
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
    width: '150px',
  },
  {
    uid: 'typeName',
    dataIndex: 'typeName',
    title: '分类',
    width: '150px',
    render(h, v) {
      return v ? v : '--';
    },
  },
  {
    uid: 'useDeptName',
    dataIndex: 'useDeptName',
    title: '使用部门',
    width: '100px',
  },
  {
    uid: 'model',
    dataIndex: 'model',
    title: '型号',
    width: '150px',
  },
  {
    uid: 'username',
    dataIndex: 'username',
    title: '使用人',
    width: '150px',
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
    uid: 'areaNames',
    dataIndex: 'areaNames',
    title: '存放位置',
    width: '200px',
    render(h, v) {
      return v?.length ? v.join('/') : '--';
    },
  },
];
