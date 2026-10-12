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
    uid: 'area',
    dataIndex: 'areaNames',
    title: '所属区域',
    width: '200px',
    render(h, v, r) {
      return r.areaNames?.join('/') || '--';
    },
  },
  {
    uid: 'deptName',
    dataIndex: 'deptName',
    title: '管理部门',
    width: '150px',
  },
  {
    uid: 'type',
    dataIndex: 'type',
    title: '档位类型',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'attribute',
    dataIndex: 'attribute',
    title: '空间属性',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'tradeModel',
    dataIndex: 'tradeModel',
    title: '经营类型',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'acreage',
    dataIndex: 'acreage',
    title: '面积',
    width: '100px',
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
  },
  {
    uid: 'bimBind',
    dataIndex: 'bimInfo',
    title: 'BIM绑定',
    width: '200px',
    render(h, v) {
      return v?.ecode ? v.ecode : '未绑定';
    },
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
  // add
  {
    uid: 'coverArea',
    dataIndex: 'coverArea',
    title: '占地面积(m²)',
    width: '120px',
    align: 'center',
    render(h, v) {
      return v == null ? '--' : v;
    },
  },
  {
    uid: 'fireArea',
    dataIndex: 'fireArea',
    title: '消防面积(m²)',
    width: '120px',
    align: 'center',
    render(h, v) {
      return v == null ? '--' : v;
    },
  },
  {
    uid: 'cleanArea',
    dataIndex: 'cleanArea',
    title: '清洁面积(m²)',
    width: '120px',
    align: 'center',
    render(h, v) {
      return v == null ? '--' : v;
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
    uid: 'companyName',
    dataIndex: 'companyName',
    title: '所属商户',
    width: '200px',
  },
];
