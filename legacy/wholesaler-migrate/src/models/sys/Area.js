export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '290px',
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'names',
    dataIndex: 'names',
    title: '区域名称',
    render(h, v, r) {
      return v?.length ? v.join('/') : '';
    },
  },
  {
    uid: 'num',
    dataIndex: 'num',
    title: '数量',
    width: '200px',
    render(h, v, r) {
      return r?.children?.length || 0;
    },
  },
  {
    uid: 'remark',
    dataIndex: 'remark',
    title: '区域说明',
  },
  {
    uid: 'levelName',
    dataIndex: 'levelName',
    title: '区域级别',
    width: '200px',
  },
  {
    uid: 'typeName',
    dataIndex: 'typeName',
    title: '区域类型',
    width: '200px',
  },
  {
    uid: 'acreage',
    dataIndex: 'acreage',
    title: '面积',
    width: '200px',
  },
  {
    uid: 'sort',
    dataIndex: 'sort',
    title: '排序',
    width: '200px',
  },
  // add
  {
    uid: 'coverArea',
    dataIndex: 'coverArea',
    title: '占地面积(m²)',
    width: '120px',
    align: 'center',
    render(h, v) {
      return v == null ? '--' : v;
    },
  },
  {
    uid: 'fireArea',
    dataIndex: 'fireArea',
    title: '消防面积(m²)',
    width: '120px',
    align: 'center',
    render(h, v) {
      return v == null ? '--' : v;
    },
  },
  {
    uid: 'cleanArea',
    dataIndex: 'cleanArea',
    title: '清洁面积(m²)',
    width: '120px',
    align: 'center',
    render(h, v) {
      return v == null ? '--' : v;
    },
  },
];
