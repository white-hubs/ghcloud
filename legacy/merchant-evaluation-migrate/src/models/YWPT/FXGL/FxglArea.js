export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '所属区域',
    width: '100px',
    render(h, v) {
      return v;
      // return <app-dict-display value={v} />
    },
  },
  {
    uid: 'pointTotal',
    dataIndex: 'pointTotal',
    title: '风险点数',
    width: '200px',
  },
  {
    uid: 'total',
    dataIndex: 'total',
    title: '风险记录数',
    width: '200px',
  },
];
