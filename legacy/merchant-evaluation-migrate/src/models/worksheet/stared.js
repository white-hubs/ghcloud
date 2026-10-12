import { StringOperators, ValueOperators } from '../common/Operators';
import {
  isPhone,
  isEmail,
  isIDCardNumber,
  isValidUsername,
} from '../common/Validators';
export default () => [
  {
    uid: 'processInstanceName',
    dataIndex: 'processInstanceName',
    title: '工单名称',
    nowrap: true,
    sorter: true,
  },
  {
    uid: 'processInstanceKey',
    dataIndex: 'processInstanceKey',
    title: '工单编号',
    nowrap: true,
    sorter: true,
    render(h, value, record) {
      return (
        <app-link-btn
          to={`/worksheet/activity/detail/${record.processInstanceId}/started`}
        >
          {value}
        </app-link-btn>
      );
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
    filter: {
      advance: true,
      operators: StringOperators,
    },
  },
  {
    uid: 'status',
    dataIndex: 'status',
    title: '状态',
    nowrap: true,
    sorter: true,
    render(h, value, record) {
      const isFinish = !!record.processEndTime;

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
    uid: 'taskAssignee',
    dataIndex: 'taskAssignee',
    title: '受理人',
    nowrap: true,
    sorter: true,
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
    uid: 'processStartTime',
    dataIndex: 'processStartTime',
    title: '发起时间',
    nowrap: true,
    sorter: true,
  },
  {
    uid: 'processEndTime',
    dataIndex: 'processEndTime',
    title: '结束时间',
    nowrap: true,
    sorter: true,
  },
];
