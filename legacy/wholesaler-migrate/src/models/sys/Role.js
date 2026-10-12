import Auditable from '../common/Auditable';
import { StringOperators, ValueOperators } from '../common/Operators';
export default () => [
  {
    uid: 'id',
    dataIndex: 'id',
    title: ' 角色ID',
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '角色名称',
    sorter: true,
    width: '200px',
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
    title: '角色编码',
    sorter: true,
    width: '200px',
  },
  {
    uid: 'enabled',
    dataIndex: 'enabled',
    title: '角色状态',
    sorter: true,
    width: '200px',
    render(h, enabled) {
      return <app-enabled-display enabled={enabled} />;
    },
    filter: {
      advance: true,
      operators: ValueOperators,
      control: {
        type: 'Number',
      },
    },
    form: {
      default: 1,
      rules: [
        {
          required: true,
          message: '必填项',
        },
      ],
    },
  },
  {
    uid: 'remark',
    dataIndex: 'remark',
    title: '备注',
    sorter: true,
    filter: {
      quick: true,
      advance: true,
      operators: StringOperators,
    },
  },
  ...Auditable(),
];
