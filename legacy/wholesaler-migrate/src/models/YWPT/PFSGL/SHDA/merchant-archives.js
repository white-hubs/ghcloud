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
    title: '商铺名称',
    width: '200px',
  },
  {
    uid: 'owner',
    dataIndex: 'owner',
    title: '所属人姓名',
    width: '200px',
  },
  {
    uid: 'mobile',
    dataIndex: 'mobile',
    title: '电话号码',
    width: '200px',
  },
  {
    uid: 'stallCount',
    dataIndex: 'stallCount',
    title: '档位数',
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
