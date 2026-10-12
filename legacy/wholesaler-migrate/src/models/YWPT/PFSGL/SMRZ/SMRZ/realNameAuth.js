import moment from "moment";
export default () => [
  {
    uid: 'realName',
    dataIndex: 'realName',
    title: '认证人',
    width: '200px',
  },
  {
    uid: 'loginAccount',
    dataIndex: 'loginAccount',
    title: '登录账号',
    width: '200px',
  },
  {
    uid: 'stallName',
    dataIndex: 'stallName',
    title: '关联档位',
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
