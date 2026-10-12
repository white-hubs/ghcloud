export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '200px',
    sorter: true,
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'manufacturer',
    dataIndex: 'manufacturer',
    title: '厂家',
    width: '200px',
  },
  {
    uid: 'specification',
    dataIndex: 'specification',
    title: '型号',
    width: '200px',
  },
  {
    uid: 'areaName',
    dataIndex: 'areaName',
    title: '区域',
    width: '200px',
    render(h, v, r) {
      return r.areaNames.join(',');
    },
  },
  {
    uid: 'installAddress',
    dataIndex: 'installAddress',
    title: '地址',
    width: '200px',
  },
];
