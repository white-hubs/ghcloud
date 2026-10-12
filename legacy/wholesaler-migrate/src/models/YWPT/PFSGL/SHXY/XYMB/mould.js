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
    uid: 'type',
    dataIndex: 'type',
    title: '协议类型',
    width: '200px',
    render(h, v) {
      return <app-new-dict-display value={v} itemCode={'project-merchant-protocolType'} />;
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
