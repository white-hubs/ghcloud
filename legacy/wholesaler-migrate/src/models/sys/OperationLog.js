import Auditable from '../common/Auditable';
import { StringOperators, ValueOperators } from '../common/Operators';
import LogStatus from '@/components/sys/OperationLog/StatusDisplay';
export default () => [
  {
    uid: 'id',
    dataIndex: 'id',
    title: '主键',
  },
  {
    uid: 'title',
    dataIndex: 'title',
    title: '模块标题',
    sorter: true,
    nowrap: true,
    filter: {
      quick: true,
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'businessType',
    dataIndex: 'businessType',
    title: '业务类型',
    sorter: true,
    width: '200px',
    formatter: {
      type: 'Enum',
      props: {
        code: 'LogBusinessType',
      },
    },
    filter: {
      advance: true,
      operators: ValueOperators,
      control: {
        type: 'Number',
      },
    },
  },
  {
    uid: 'method',
    dataIndex: 'method',
    title: '方法名称',
    sorter: true,
    width: '200px',
    filter: {
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'requestMethod',
    dataIndex: 'requestMethod',
    title: '请求方式',
    sorter: true,
    width: '200px',
    filter: {
      quick: true,
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'terminalType',
    dataIndex: 'terminalType',
    title: '终端类别',
    sorter: true,
    width: '200px',
    formatter: {
      type: 'Enum',
      props: {
        code: 'TerminalType',
      },
    },
    filter: {
      advance: true,
      operators: ValueOperators,
      control: {
        type: 'Number',
      },
    },
  },
  {
    uid: 'username',
    dataIndex: 'username',
    title: '操作人员',
    sorter: true,
    width: '15rem',
    filter: {
      quick: true,
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'url',
    dataIndex: 'url',
    title: '请求URL',
    sorter: true,
    width: '200px',
    sizes: ['xl', 'xxl'],
    filter: {
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'ip',
    dataIndex: 'ip',
    title: '终端IP',
    sorter: true,
    width: '200px',
    filter: {
      quick: true,
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'location',
    dataIndex: 'location',
    title: '操作地点',
    sorter: true,
    width: '200px',
    filter: {
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'params',
    dataIndex: 'params',
    title: '请求参数',
    sorter: true,
    width: '200px',
    filter: {
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'status',
    dataIndex: 'status',
    title: '操作状态',
    sorter: true,
    width: '15rem',
    filter: {
      advance: true,
      operators: ValueOperators,
      control: {
        type: 'Number',
      },
    },
    render(h, status) {
      return <LogStatus status={status} />;
    },
  },
  {
    uid: 'errorMsg',
    dataIndex: 'errorMsg',
    title: '错误消息',
    sorter: true,
    sizes: ['xl', 'xxl'],
    filter: {
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'time',
    dataIndex: 'time',
    title: '操作时间',
    sorter: true,
    width: '18rem',
    render(h, time) {
      return <app-date-display date={time} format="YYYY-MM-DD HH:mm:ss" />;
    },
    filter: {
      advance: true,
      operators: ValueOperators,
      control: {
        type: 'Date',
      },
    },
  },
];
