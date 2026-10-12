export default () => [
  {
    uid: 'elementCode',
    dataIndex: 'elementCode',
    title: '构件编码',
    width: '200px',
    sorter: true,
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '构件名称',
    width: '150px',
  },
  {
    uid: 'levelName',
    dataIndex: 'levelName',
    title: '楼层名称',
    width: '100px',
  },
  {
    uid: 'groupName',
    dataIndex: 'groupName',
    title: '分组',
    width: '100px',
  },
  {
    uid: 'hasBind',
    dataIndex: 'hasBind',
    title: '是否绑定',
    width: '100px',
    render(h, v) {
      return (
        <app-enabled-display
          enabled={v}
          trueLabel="已绑定"
          falseLabel="未绑定"
        />
      );
    },
  },
  // {
  //   uid: 'action',
  //   dataIndex: 'hasBind',
  //   title: '操作',
  //   width: '8rem',
  //   // fixed: 'right',
  //   render(h, v, r) {
  //     const handlclick = () => {
  //       r.hasBind = false;
  //     };
  //     return (
  //       <app-link-btn onClick={handlclick} loading={true}>
  //         解除绑定
  //       </app-link-btn>
  //     );
  //   },
  // },
];
