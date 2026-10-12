import Auditable from '../common/Auditable';
export default () => [
  {
    uid: 'typeCode',
    dataIndex: 'typeCode',
    title: '字典类别',
    sorter: true,
    width: '200px',
    form: {
      rules: [
        {
          required: true,
          message: '必填项',
        },
      ],
    },
  },
  {
    uid: 'parentCode',
    dataIndex: 'parentCode',
    title: '父编码',
    sorter: true,
    width: '200px',
  },
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编码',
    sorter: true,
    width: '200px',
    form: {
      rules: [
        {
          required: true,
          message: '必填项',
        },
      ],
    },
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
    sorter: true,
    width: '200px',
    form: {
      rules: [
        {
          required: true,
          message: '必填项',
        },
      ],
    },
  },
  {
    uid: 'sort',
    dataIndex: 'sort',
    title: '顺序号',
    sorter: true,
    form: {
      default: 0,
    },
  },
  ...Auditable(),
];
