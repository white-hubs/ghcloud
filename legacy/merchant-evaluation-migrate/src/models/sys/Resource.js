import Auditable from '../common/Auditable';
import { StringOperators } from '../common/Operators';
export default () => [
  {
    uid: 'id',
    dataIndex: 'id',
    title: '主键',
  },
  {
    uid: 'pid',
    dataIndex: 'pid',
    title: '父项',
    width: '200px',
  },
  {
    uid: 'type',
    dataIndex: 'type',
    title: '类型',
    width: '10rem',
    form: {
      default: 'MENU',
      rules: [
        {
          required: true,
          message: '必填项',
        },
      ],
    },
    formatter: {
      type: 'Enum',
      props: {
        code: 'ResourceType',
      },
    },
  },
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编码',
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
    minWidth: '20rem',
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
    uid: 'icon',
    dataIndex: 'icon',
    title: '图标',
    width: '8em',
    align: 'center',
    render(h, icon) {
      if (icon) {
        return (
          <i style={{ fontSize: 'larger' }} class={`iconfont icon-${icon}`}></i>
        );
      }
      return null;
    },
  },
  {
    uid: 'path',
    dataIndex: 'path',
    title: '路径',
    width: '200px',
    filter: {
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'apis',
    dataIndex: 'apis',
    title: 'apis',
    width: '200px',
  },
  {
    uid: 'enabled',
    dataIndex: 'enabled',
    title: '状态',
    width: '8rem',
    render(h, enabled) {
      if (enabled) {
        return <a-tag color="#87d068">启用</a-tag>;
      } else {
        return <a-tag color="#f50">禁用</a-tag>;
      }
    },
    form: {
      default: true,
    },
  },
  ...Auditable(),
];
