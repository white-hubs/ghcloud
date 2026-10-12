export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编号',
    width: '220px',
    sorter: true,
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'type',
    dataIndex: 'typeName',
    title: '类型',
    width: '150px',
  },
  {
    uid: 'floor',
    dataIndex: 'floor',
    title: '所属楼层',
    width: '200px',
    render(h, v, r) {
      return r.areaName;
    },
  },
  {
    uid: 'area',
    dataIndex: 'areaNames',
    title: '所属区域',
    width: '200px',
    render(h, v) {
      return v?.length ? v.join('/') : '--';
    },
  },
  {
    uid: 'dept',
    dataIndex: 'deptName',
    title: '所属部门',
    width: '150px',
  },
  {
    uid: 'iot',
    dataIndex: 'iotDeviceId',
    title: '物联绑定',
    width: '150px',
    render(h, v) {
      return v ? '已绑定' : '未绑定';
    },
  },
  {
    uid: 'bimBind',
    dataIndex: 'bimInfo',
    title: '模型绑定',
    width: '200px',
    render(h, v) {
      return v?.ecode ? v.ecode : '未绑定';
    },
  },
  {
    uid: 'timeLimitStr',
    dataIndex: 'timeLimitStr',
    title: '有效期',
    width: '200px',
    render(h, v, r) {
      const str = v || '--';
      return (
        <span
          style={{
            color:
              r.timeLimit > 30 || r.timeLimit === null
                ? ''
                : r.timeLimit >= 0
                ? '#faad14'
                : '#f5222d',
          }}
        >
          {str}
        </span>
      );
    },
  },
  {
    uid: 'status',
    dataIndex: 'online',
    title: '状态',
    width: '100px',
    render(h, status) {
      return <app-iot-device-status value={status} />;
    },
  },
  {
    uid: 'installAddress',
    dataIndex: 'installAddress',
    title: '安装地址',
    width: '200px',
  },
  {
    uid: 'hasPoint',
    dataIndex: 'hasPoint',
    title: '是否绑定巡检点',
    width: '200px',
    render(h, v) {
      return (
        <app-enabled-display
          enabled={!v}
          trueLabel="未绑定巡检点"
          falseLabel="已绑定巡检点"
        />
      );
    },
  },
  {
    uid: 'msg',
    dataIndex: 'msg',
    title: '提示',
    width: '200px',
    render(h, v, r) {
      return (
        <app-enabled-display
          enabled={r.optional}
          trueLabel={v}
          falseLabel={v}
        />
      );
    },
  },

  {
    uid: 'ratedCurrent',
    dataIndex: 'ratedCurrent',
    title: '额定电流',
    width: '100px',
    align: 'center',
    render(h, v) {
      return v != null ? v + ' A' : '--';
    },
  },
];
