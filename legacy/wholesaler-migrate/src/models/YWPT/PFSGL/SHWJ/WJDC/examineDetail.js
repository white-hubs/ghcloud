export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '档位名称',
    width: '220px',
  },
  {
    uid: 'area',
    dataIndex: 'area',
    title: '所属区域',
    width: '200px',
    customRender(text, record) {
      return text?.length ? text.join('/') : '--';
    },
  },
  {
    uid: 'companyName',
    dataIndex: 'companyName',
    title: '所属商户',
    width: '100px',
  },
  {
    uid: 'status',
    dataIndex: 'status',
    title: '状态',
    width: '100px',
    customRender(text, record) {
      return text === 0 ? '未填' : text === 1 ? '已填' : '---';
    },
  },
  {
    uid: 'signedWho',
    dataIndex: 'signedWho',
    title: '填写人',
    width: '100px',
    customRender(text, record) {
      return text || '---';
    },
  },
  {
    uid: 'owner',
    dataIndex: 'owner',
    title: '职位',
    width: '100px',
    customRender(text, record) {
      return text === 1 ? '档主' : '从业人员' || '---';
    },
  },

  {
    uid: 'signedTime',
    dataIndex: 'signedTime',
    title: '填写时间',
    width: '200px',
    customRender(text, record) {
      return text || '---';
    },
  },
  {
    uid: '',
    dataIndex: '',
    title: '操作',
    scopedSlots: { customRender: '操作' },
  },
];
