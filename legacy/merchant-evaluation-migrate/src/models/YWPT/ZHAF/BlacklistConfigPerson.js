export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '200px',
    // sorter: true,
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
    title: '类型',
    width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'device',
    dataIndex: 'deviceId',
    title: '布控点',
    width: '200px',
    render(h, v, r) {
      return r?.deviceDTO?.name;
    },
  },
  {
    uid: 'face',
    dataIndex: 'face',
    title: '人脸图像',
    width: '150px',
    render(h, v, r) {
      if (r.fileDTOS?.length) {
        // return (
        //   <img
        //     src={'/fileresource/' + r.fileDTOS[0].path}
        //     style={{ height: '30px' }}
        //   />
        // );
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
    uid: 'alarmNum',
    dataIndex: 'alarmNum',
    title: '告警次数',
    width: '100px',
  },
  {
    uid: 'source',
    dataIndex: 'source',
    title: '黑名单来源',
    width: '120px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'createBy',
    dataIndex: 'createBy',
    title: '创建用户',
    width: '100px',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
  },
];
