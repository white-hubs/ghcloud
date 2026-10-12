import { Tag } from 'ant-design-vue';
import Auditable from '../common/Auditable';
import { StringOperators, ValueOperators } from '../common/Operators';
import {
  isPhone,
  isEmail,
  isIDCardNumber,
  isValidUsername,
} from '../common/Validators';
export default () => [
  {
    uid: 'id',
    dataIndex: 'id',
    title: '用户ID',
  },
  {
    uid: 'deptId',
    dataIndex: 'deptName',
    title: '部门',
    // sorter: true,
    width: '200px',
  },
  {
    uid: 'postIds',
    dataIndex: 'postIds',
    title: '岗位',
    sorter: true,
    width: '120px',
    filter: {
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'username',
    dataIndex: 'username',
    title: '登录账号',
    // nowrap: true,
    sorter: true,
    width: '160px',
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
    uid: 'password',
    dataIndex: 'password',
    title: '密码',
    sorter: true,
    filter: {
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
    uid: 'nickname',
    dataIndex: 'nickname',
    title: '用户昵称',
    sorter: true,
    width: '160px',
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
    uid: 'isManager',
    dataIndex: 'isManager',
    title: '管理员',
    width: '100px',
    render(h, v) {
      // return
      return <a-tag color={!v ? '' : 'green'}>{!v ? '否' : '是'}</a-tag>;
    },
  },
  {
    uid: 'gender',
    dataIndex: 'gender',
    title: '性别',
    sorter: true,
    width: '100px',
    sizes: ['xxl', 'xl'],
    formatter: {
      type: 'Enum',
      props: {
        code: 'Gender',
      },
    },
    filter: {
      advance: true,
      operators: ValueOperators,
      control: {
        type: 'Enum',
        props: {
          code: 'Gender',
        },
      },
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
    uid: 'mobile',
    dataIndex: 'mobile',
    title: '手机号码',
    // sorter: true,
    width: '150px',
    formatter: {
      type: 'Phone',
    },
    filter: {
      advance: true,
      quick: true,
      operators: StringOperators,
    },
    form: {
      rules: [
        {
          required: true,
          message: '必填项',
        },
        {
          validator: (r, v) => !v || isPhone(v),
          message: '手机号码不正确。',
        },
      ],
    },
  },
  {
    uid: 'email',
    dataIndex: 'email',
    title: '邮箱',
    sorter: true,
    width: '200px',
    sizes: ['xxl', 'xl'],
    filter: {
      quick: true,
      advance: true,
      operators: StringOperators,
    },
    form: {
      rules: [
        {
          validator: (r, v) => !v || isEmail(v),
          message: '邮箱格式不正确',
        },
      ],
    },
  },
  {
    uid: 'identityCard',
    dataIndex: 'identityCard',
    title: '身份证号码',
    sorter: true,
    width: '200px',
    filter: {
      advance: true,
      operators: StringOperators,
    },
    form: {
      // rules: [
      //   {
      //     validator: (r, v) => !v || isIDCardNumber(v),
      //     message: '身份证号码不正确',
      //   },
      // ],
    },
    render(h, text) {
      return <app-id-card-display number={text} />;
    },
  },
  {
    uid: 'avatar',
    dataIndex: 'avatar',
    title: '用户头像',
    sorter: true,
    width: '200px',
  },
  {
    uid: 'enabled',
    dataIndex: 'enabled',
    title: '状态',
    sorter: true,
    width: '100px',
    render(h, enabled) {
      return <app-enabled-display enabled={enabled} />;
    },
    filter: {
      advance: true,
      operators: ValueOperators,
      control: {
        type: 'Enum',
        props: {
          code: 'UserStatus',
        },
      },
    },
    form: {
      rules: [
        {
          required: true,
          message: '必填项',
        },
      ],
      default: true,
    },
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
    uid: 'loginIp',
    dataIndex: 'loginIp',
    title: '最后登录IP',
    sorter: true,
    width: '200px',
    filter: {
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'loginTime',
    dataIndex: 'loginTime',
    title: '最后登录时间',
    sorter: true,
    width: '200px',
    formatter: {
      type: 'Date',
    },
    filter: {
      operators: ValueOperators,
      control: {
        type: 'Date',
      },
    },
  },
  {
    uid: 'roleIds',
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
  ...Auditable(),
];
