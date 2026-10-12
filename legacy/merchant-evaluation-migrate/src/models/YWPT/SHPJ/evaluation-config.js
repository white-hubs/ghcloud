import moment from "moment";
export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '240px',
  },
  {
    uid: 'itemName',
    dataIndex: 'itemName',
    title: '巡检项',
    width: '200px',
  },
  {
    uid: 'itemResultName',
    dataIndex: 'itemResultName',
    title: '结果项',
    width: '200px',
  },
  {
    uid: 'itemResultMark',
    dataIndex: 'itemResultMark',
    title: '扣减分值',
    width: '120px',
  },
  {
    uid: 'standardName',
    dataIndex: 'standardName',
    title: '所属巡检标准',
    width: '180px',
  },
  {
    uid: 'createBy',
    dataIndex: 'createBy',
    title: '创建人',
    width: '150px',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
    render: (h, v) => {
      return v ? moment(v).format('YYYY-MM-DD hh:mm:ss') : ""
    }
  },
];
