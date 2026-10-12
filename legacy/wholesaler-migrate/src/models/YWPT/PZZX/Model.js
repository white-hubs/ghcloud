export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '模型编号',
    width: '210px',
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'filename',
    dataIndex: 'modelFileName',
    title: '文件名称',
    width: '200px',
  },
  {
    uid: 'modelType',
    dataIndex: 'modelType',
    title: '模型分类',
    width: '150px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'createBy',
    dataIndex: 'createBy',
    title: '上传人',
    width: '200px',
  },
  {
    uid: 'status',
    dataIndex: 'stateName',
    title: '状态',
    width: '100px',
    // render(h, v) {
    //   return <app-dict-display value={v} />;
    // },
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
  },
  {
    uid: 'remark',
    dataIndex: 'remark',
    title: '备注',
    width: '200px',
  },
  {
    uid: 'sort',
    dataIndex: 'sort',
    title: '排序',
    width: '200px',
  },
];
