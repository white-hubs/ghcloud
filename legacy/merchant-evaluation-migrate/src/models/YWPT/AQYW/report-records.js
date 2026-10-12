import moment from 'moment';
export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '200px',
  },
  {
    uid: 'title',
    dataIndex: 'title',
    title: '标题',
    width: '500px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'month',
    dataIndex: 'month',
    title: '年月',
    width: '200px',
    render(h, v, r) {
      return moment(r.createTime).format('YYYY年MM月');
    },
  },
  {
    uid: 'nickname',
    dataIndex: 'nickname',
    title: '上报人',
    width: '200px',
    render(h, v) {
      return !v || v === 'null' ? '--' : v;
    },
  },
  {
    uid: 'summaryFirmSize',
    dataIndex: 'summaryFirmSize',
    title: '汇总公司数',
    width: '100',
    align: 'center',
    render() {
      return 0;
    },
  },
  {
    uid: 'createBy',
    dataIndex: 'createBy',
    title: '创建人',
    width: '150px',
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
  {
    uid: 'filledTime',
    dataIndex: 'filledTime',
    title: '填报时间',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'status',
    dataIndex: 'status',
    title: '状态',
    width: '200px',
  },
  // {
  //   uid: 'updateBy',
  //   dataIndex: 'updateBy',
  //   title: '更新人',
  //   width: '200px',
  // },
  // {
  //   uid: 'updateTime',
  //   dataIndex: 'updateTime',
  //   title: '更新时间',
  //   width: '200px',
  // },
];
