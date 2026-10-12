export default () => [
  {
    uid: 'id',
    dataIndex: 'id',
    title: '用户ID',
    width: '200px',
  },
  {
    uid: 'username',
    dataIndex: 'username',
    title: '登录账号',
    width: '200px',
  },
  {
    uid: 'nickname',
    dataIndex: 'nickname',
    title: '用户昵称',
    width: '200px',
  },
  {
    uid: 'role',
    dataIndex: 'roleIds',
    title: '角色',
    width: '200px',
    render(h, ids) {
      const scopeSlots = {
        scopedSlots: {
          default: (h, model) => <span>{model.name}</span>,
        },
      };
      return (
        ids &&
        ids.map((item) => {
          return (
            <app-display url={`/sys/roles/${item}`} scopeSlots={scopeSlots} />
          );
        })
      );
    },
  },
  {
    uid: 'online',
    dataIndex: 'online',
    title: '在线状态',
    width: '100px',
  },
  {
    uid: 'mobile',
    dataIndex: 'mobile',
    title: '手机号码',
    width: '200px',
  },
  {
    uid: 'token',
    dataIndex: 'tokenDTOS',
    title: 'Token',
    width: '200px',
    render(h, v) {
      return v.length ? v.map((it) => it.token).join('; ') : '--';
    },
  },
  {
    uid: 'tokenNum',
    dataIndex: 'tokenDTOS',
    title: 'Token数',
    width: '200px',
    render(h, v) {
      return v.length || 0;
    },
  },
];
