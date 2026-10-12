export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '业务通知类型编码',
    width: '200px',
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '业务通知类型',
    width: '200px',
  },
  {
    uid: 'hasSet',
    dataIndex: 'hasSet',
    title: '配置状态',
    width: '200px',
    render(h, v) {
      return (
        <app-enabled-display
          enabled={v}
          trueLabel="已配置"
          falseLabel="未配置"
        />
      );
    },
  },

  // {
  //   uid: 'businessType',
  //   dataIndex: 'businessType',
  //   title: '通知业务类型',
  //   width: '200px',
  // },
  // {
  //   uid: 'level',
  //   dataIndex: 'level',
  //   title: '通知等级',
  //   width: '200px',
  // },
  // {
  //   uid: 'upgradeMinutes',
  //   dataIndex: 'upgradeMinutes',
  //   title: '已通知时刻计算升级到下级的时长(0时不升级)',
  //   width: '200px',
  // },
  // {
  //   uid: 'devDeptFlag',
  //   dataIndex: 'devDeptFlag',
  //   title: '设备管理部门启用标识',
  //   width: '200px',
  // },
  // {
  //   uid: 'devDeptPost',
  //   dataIndex: 'devDeptPost',
  //   title: '设备管理部门岗位',
  //   width: '200px',
  // },
  // {
  //   uid: 'deptFlag',
  //   dataIndex: 'deptFlag',
  //   title: '部门启用标识',
  //   width: '200px',
  // },
  // {
  //   uid: 'deptId',
  //   dataIndex: 'deptId',
  //   title: '部门ID',
  //   width: '200px',
  // },
  // {
  //   uid: 'deptPostId',
  //   dataIndex: 'deptPostId',
  //   title: '岗位ID',
  //   width: '200px',
  // },
  // {
  //   uid: 'usersFlag',
  //   dataIndex: 'usersFlag',
  //   title: '用户启用标识',
  //   width: '200px',
  // },
  // {
  //   uid: 'userIds',
  //   dataIndex: 'userIds',
  //   title: '限定最多10个用户',
  //   width: '200px',
  // },
  // {
  //   uid: 'waySms',
  //   dataIndex: 'waySms',
  //   title: '短息方式',
  //   width: '200px',
  // },
  // {
  //   uid: 'wayWechat',
  //   dataIndex: 'wayWechat',
  //   title: '企业微信方式',
  //   width: '200px',
  // },
  // {
  //   uid: 'waySite',
  //   dataIndex: 'waySite',
  //   title: '站内信方式',
  //   width: '200px',
  // },
  // {
  //   uid: 'waySitePopup',
  //   dataIndex: 'waySitePopup',
  //   title: '弹窗方式',
  //   width: '200px',
  // },
  // {
  //   uid: 'enabled',
  //   dataIndex: 'enabled',
  //   title: '启停',
  //   width: '200px',
  // },
];
