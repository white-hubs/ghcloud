import Auditable from '../common/Auditable';
import { StringOperators, ValueOperators } from '../common/Operators';
export default () => [
  {
    uid: 'id',
    dataIndex: 'id',
    title: '主键',
  },
  {
    uid: 'username',
    dataIndex: 'username',
    title: '登录账号',
    sorter: true,
    minWidth: '20rem',
    filter: {
      quick: true,
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'ip',
    dataIndex: 'ip',
    title: '登录IP',
    sorter: true,
    width: '12rem',
    filter: {
      quick: true,
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'location',
    dataIndex: 'location',
    title: '登录地点',
    sorter: true,
    width: '200px',
    filter: {
      quick: true,
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'browserName',
    dataIndex: 'browserName',
    title: '浏览器名称',
    sorter: true,
    width: '15rem',
    sizes: ['md', 'xl', 'xxl'],
    filter: {
      quick: true,
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'browserVersion',
    dataIndex: 'browserVersion',
    title: '浏览器版本',
    sorter: true,
    width: '200px',
    filter: {
      quick: true,
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'os',
    dataIndex: 'os',
    title: '操作系统',
    sorter: true,
    width: '200px',
    filter: {
      quick: true,
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'device',
    dataIndex: 'device',
    title: '浏览器类型',
    sorter: true,
    width: '200px',
    filter: {
      quick: true,
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'succeed',
    dataIndex: 'succeed',
    title: '是否成功',
    sorter: true,
    width: '15rem',
    filter: {
      advance: true,
      operators: ValueOperators,
      control: {
        type: 'Number',
      },
    },
    render(h, succeed) {
      if (succeed) {
        return <a-tag color="#87d068">成功</a-tag>;
      }
      return <a-tag color="#F50">失败</a-tag>;
    },
  },
  {
    uid: 'msg',
    dataIndex: 'msg',
    title: '提示消息',
    sorter: true,
    sizes: ['md', 'xl', 'xxl'],
    width: '20rem',
    filter: {
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'loginTime',
    dataIndex: 'loginTime',
    title: '访问时间',
    sorter: true,
    width: '18rem',

    render(h, loginTime) {
      return <app-date-display date={loginTime} format="YYYY-MM-DD HH:mm:ss" />;
    },
    filter: {
      advance: true,
      operators: ValueOperators,
      control: {
        type: 'Date',
      },
    },
  },
  ...Auditable(),
];
