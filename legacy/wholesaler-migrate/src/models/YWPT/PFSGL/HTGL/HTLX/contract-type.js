import moment from "moment";
export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '200px',
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'enabled',
    dataIndex: 'enabled',
    title: '启用状态',
    width: '100px',
    render(h, v) {
      return v === 0 ? '禁用' : v === 1 ? '启用' : '---';
    },
  },
  {
    uid: 'createBy',
    dataIndex: 'createBy',
    title: '创建人',
    width: '200px',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
    render(h, v) {
      return v ? moment(v).format('YYYY-MM-DD HH:mm:ss') : ""
    }
  },
];
