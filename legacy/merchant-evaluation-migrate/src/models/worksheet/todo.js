import { StringOperators, ValueOperators } from '../common/Operators';
import {
  isPhone,
  isEmail,
  isIDCardNumber,
  isValidUsername,
} from '../common/Validators';
export default () => [
  {
    uid: 'taskId',
    dataIndex: 'taskId',
    title: '工单编号',
    nowrap: true,
    sorter: true,
    render(h, value, record, index) {
      return (
        <app-link-btn to={`/worksheet/detail/${record.processInstance.id}`}>
          {value}
        </app-link-btn>
      );
    },
  },
  {
    uid: 'processInstance',
    dataIndex: 'processInstance',
    title: '工单模板名称',
    nowrap: true,
    sorter: true,
    render(h, value, record) {
      return record.processInstance?.name;
    },
    filter: {
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'processInitiatorUser',
    dataIndex: 'processInitiatorUser',
    title: '发起人',
    nowrap: true,
    sorter: true,
    render(h, value, record) {
      return record.processInitiatorUser.nickname;
    },
  },
  {
    uid: 'status',
    dataIndex: 'status',
    title: '状态',
    nowrap: true,
    sorter: true,
    render(h, value, record) {
      const isFinish = false; // !!record.endTime; // TODO 一定是未完成

      return isFinish ? (
        <a-tag color="#87d068">已完成</a-tag>
      ) : (
        <a-tag color="#2db7f5">进行中</a-tag>
      );
    },
  },
  {
    uid: 'taskName',
    dataIndex: 'taskName',
    title: '当前节点',
    nowrap: true,
    sorter: true,
  },
  {
    uid: 'taskAssigneeUser',
    dataIndex: 'taskAssigneeUser',
    title: '受理人',
    nowrap: true,
    sorter: true,
    render(h, value, record) {
      return record.taskAssigneeUser ? record.taskAssigneeUser.nickname : '';
    },
  },
  {
    uid: 'taskCandidateUsers',
    dataIndex: 'taskCandidateUsers',
    title: '候选受理人',
    nowrap: true,
    sorter: true,
    render(h, value, record) {
      return record.taskCandidateUsers
        ? record.taskCandidateUsers.map((item) => item.nickname).join(', ')
        : '';
    },
  },
  {
    uid: 'taskCreateTime',
    dataIndex: 'taskCreateTime',
    title: '发起时间',
    nowrap: true,
    sorter: true,
    filter: {
      quick: true,
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'taskEndTime',
    dataIndex: 'taskEndTime',
    title: '结束时间',
    nowrap: true,
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
];
