export default () => [
  {
    uid: 'typeName',
    dataIndex: 'typeName',
    title: '设备类型',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'count',
    dataIndex: 'count',
    title: '数量',
    width: '100px',
  },
  {
    uid: 'fileDTOS',
    dataIndex: 'fileDTOS',
    title: '设备图片',
    render(h, v, r) {
      if (r.fileDTOS?.length) {
        return (
          <app-imgs-display
            files={r.fileDTOS}
            style={{ zoom: 0.5, margin: '-16px 0 -18px' }}
          />
        );
      } else {
        return '--';
      }
    },
  },
  {
    uid: 'stallName',
    dataIndex: 'stallName',
    title: '所属档位',
    width: '200px',
  },
  {
    uid: 'companyName',
    dataIndex: 'companyName',
    title: '所在商户',
    width: '200px',
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
  },
];
