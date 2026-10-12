export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '资料编号',
    width: '200px',
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '资料名称',
    width: '200px',
  },
  {
    uid: 'type',
    dataIndex: 'type',
    title: '资料类型',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'deviceType',
    dataIndex: 'deviceTypeName',
    title: '适用设备类型',
    width: '200px',
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'device',
    dataIndex: 'deviceDTOS',
    title: '适用设备',
    width: '200px',
    // ellipsis: true,
    render(h, v) {
      return (
        <div title={v ? v.map((d) => d.name).join(', ') : '--'}>
          {v
            ? v.length > 2
              ? v
                  .slice(0, 2)
                  .map((d) => d.name)
                  .join(', ') + '...'
              : v
                  .slice(0, 2)
                  .map((d) => d.name)
                  .join(', ')
            : '--'}
        </div>
      );
    },
  },
  {
    uid: 'createBy',
    dataIndex: 'createByName',
    title: '创建人',
    width: '120px',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
  },
  {
    uid: 'remark',
    dataIndex: 'remark',
    title: '资料详情',
    width: '200px',
  },
  {
    uid: 'files',
    dataIndex: 'fileDTOS',
    title: '资料附件',
    width: '200px',
    render(h, v) {
      return v?.length ? v.map((it) => it.name).join(',') : '--';
    },
  },
];
