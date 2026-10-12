import Auditable from '../common/Auditable';
import { StringOperators } from '../common/Operators';
export default () => [
  {
    uid: 'id',
    dataIndex: 'id',
    title: '部门id',
  },
  {
    uid: 'parentId',
    dataIndex: 'parentId',
    title: '父部门id',
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
    uid: 'managerId',
    dataIndex: 'managerId',
    title: '负责人ID',
    sorter: true,
    width: '200px',
    filter: {
      quick: true,
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'leaderId',
    dataIndex: 'leaderId',
    title: '分管领导ID',
    sorter: true,
    width: '200px',
  },
  {
    uid: 'remark',
    dataIndex: 'remark',
    title: '备注',
    sorter: true,
    width: '200px',
    filter: {
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'sort',
    dataIndex: 'sort',
    title: '排序',
    sorter: true,
    form: {
      default: 0,
    },
  },
  ...Auditable(),
];
