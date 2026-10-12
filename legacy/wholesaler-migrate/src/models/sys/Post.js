import Auditable from '../common/Auditable';
import { StringOperators } from '../common/Operators';
export default () => [
  {
    uid: 'id',
    dataIndex: 'id',
    title: 'ID',
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '岗位名称',
    width: '500px',
    sorter: true,
    filter: {
      quick: true,
      advance: true,
      operators: StringOperators,
    },
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
    uid: 'code',
    dataIndex: 'code',
    title: '岗位编码',
    width: '500px',
    sorter: true,
    filter: {
      quick: true,
      advance: true,
      operators: StringOperators,
    },
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
    title: '序号',
    with: '8rem',
    sorter: true,
    form: {
      default: 0,
    },
  },
  ...Auditable(),
];
