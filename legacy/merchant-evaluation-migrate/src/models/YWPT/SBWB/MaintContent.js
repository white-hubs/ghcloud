/**
 * code	string	 编码	
name	string	 名称	
description
 */
export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编码',
    width: '200px',
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'deviceType',
    dataIndex: 'deviceTypeCode',
    title: '设备类型',
    width: '200px',
    render(h, v) {
      return <app-dict-display value={v} />;
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
];
