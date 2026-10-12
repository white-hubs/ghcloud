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
    title: '巡检点名称',
    width: '200px',
  },
  {
    uid: 'type',
    dataIndex: 'type',
    title: '类型',
    width: '100px',
    render(h, v) {
      return <app-dict-display value={v} />;
    },
  },
  {
    uid: 'dept',
    dataIndex: 'deptName',
    title: '所属部门',
    width: '200px',
  },
  {
    uid: 'area',
    dataIndex: 'areaNames',
    title: '所属区域',
    width: '200px',
    render(h, v) {
      return v?.join('/') || '--';
    },
  },
  {
    uid: 'object',
    dataIndex: 'pointObjectDTOS',
    title: '巡检对象',
    width: '200px',
    render(h, v) {
      // return v?.map((item) => item.objectName).join(', ') || '--';
      let child = <span>--</span>;
      if (v?.length > 2) {
        child = (
          <span>
            {v.slice(0, 2).map((item) => {
              return <span>{item.objectName || '--'}, </span>;
            })}
            ......
          </span>
        );
      } else if (v?.length) {
        child = (
          <span>
            {v.map((item, index) => {
              return (
                <span>
                  {(item.objectName || '--') +
                    (index === v.length - 1 ? '' : ', ')}
                </span>
              );
            })}
          </span>
        );
      }
      return (
        <div
          title={v?.map((item) => item.objectName || '--').join(', ') || '--'}
        >
          {child}
        </div>
      );
    },
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '创建时间',
    width: '200px',
  },
  {
    uid: 'enabled',
    dataIndex: 'enabled',
    title: '状态',
    width: '100px',
    render(h, enabled) {
      return (
        <app-enabled-display
          enabled={enabled}
          trueLabel="启用"
          falseLabel="停用"
        />
      );
    },
  },
  {
    uid: 'bim',
    dataIndex: 'bimInfo',
    title: 'BIM绑定',
    width: '100px',
    render(h, v) {
      const flag = v && ((v.x && v.y && v.z) || v.ecode);
      return (
        <app-enabled-display
          enabled={flag}
          trueLabel="已绑定"
          falseLabel="未绑定"
        />
      );
    },
  },
];
