export default () => [
  {
    uid: 'vehiclePlate',
    dataIndex: 'vehiclePlate',
    title: '车牌号',
    width: '150px',
  },
  {
    uid: 'vehicleType',
    dataIndex: 'vehicleType',
    title: '车型',
    width: '150px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'color',
    dataIndex: 'color',
    title: '颜色',
    width: '150px',
  },
  {
    uid: 'owner',
    dataIndex: 'owner',
    title: '所属人',
    width: '180px',
  },
  {
    uid: 'mobile',
    dataIndex: 'mobile',
    title: '联系电话',
    width: '180px',
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
    uid: 'fileDTOS',
    dataIndex: 'fileDTOS',
    title: '图片',
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
