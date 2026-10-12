import { getAppraiseStatisticsInfo, getDepartStatisticsInfo, getInductionStatisticsInfo, getRecruitStatisticsInfo, getRegularStatisticsInfo, getRotationPostStatisticsInfo } from "@/api/statistics";
import { TableColumnsType } from "ant-design-vue";
import { KEYWORD_ALIAS } from '@ghcloud/cube-business-alias-manage-plugin'
import moment from "moment";
// 轮岗
const workshiftColumns: TableColumnsType = [
  {
    title: "拟轮岗部门",
    dataIndex: "rotationOrganizationName",
    key: "rotationOrganizationName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "现所在部门",
    dataIndex: "organizationName",
    key: "organizationName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: `轮岗${KEYWORD_ALIAS.staff}`,
    dataIndex: "staffName",
    key: "staffName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "轮岗时间",
    dataIndex: "rotationTime",
    key: "rotationTime",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "申请人",
    dataIndex: "applicantName",
    key: "applicantNname",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "申请时间",
    dataIndex: "applyTime",
    key: "applyTime",
    customRender: ({ text }) => {
      return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : '-';
    },
  },
  {
    title: "处理时间",
    dataIndex: "applyDoneTime",
    key: "applyDoneTime",
    customRender: ({ text }) => {
      return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : '-';
    },
  },
];
// 转正
const regularColumns: TableColumnsType = [
  {
    title: "岗位",
    dataIndex: "postName",
    key: "postName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "部门",
    dataIndex: "organizationName",
    key: "organizationName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: `转正${KEYWORD_ALIAS.staff}`,
    dataIndex: "staffName",
    key: "staffName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "申请人",
    dataIndex: "applicantName",
    key: "applicantName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "申请时间",
    dataIndex: "applyTime",
    key: "applyTime",
    customRender: ({ text }) => {
      return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : '-';
    },
  },
  {
    title: "处理时间",
    dataIndex: "applyDoneTime",
    key: "applyDoneTime",
    customRender: ({ text }) => {
      return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : '-';
    },
  },
];
// 招聘
const recruitColumns: TableColumnsType = [
  {
    title: "申请岗位",
    dataIndex: "postName",
    key: "postName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "增补人数",
    dataIndex: "num",
    key: "num",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "申请人",
    dataIndex: "applicantName",
    key: "applicantName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "申请时间",
    dataIndex: "applyTime",
    key: "applyTime",
    customRender: ({ text }) => {
      return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : '-';
    },
  },
  {
    title: "处理时间",
    dataIndex: "applyDoneTime",
    key: "applyDoneTime",
    customRender: ({ text }) => {
      return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : '-';
    },
  },
];
// 入职
const inductionColumns: TableColumnsType = [
  {
    title: "入职岗位",
    dataIndex: "postName",
    key: "postName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "入职部门",
    dataIndex: "organizationName",
    key: "organizationName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: `入职${KEYWORD_ALIAS.staff}`,
    dataIndex: "staffName",
    key: "staffName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "申请人",
    dataIndex: "applicantName",
    key: "applicantName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "申请时间",
    dataIndex: "applyTime",
    key: "applyTime",
    customRender: ({ text }) => {
      return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : '-';
    },
  },
  {
    title: "处理时间",
    dataIndex: "applyDoneTime",
    key: "applyDoneTime",
    customRender: ({ text }) => {
      return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : '-';
    },
  },
]
// 离职
const departColumns: TableColumnsType = [
  {
    title: "离职岗位",
    dataIndex: "postName",
    key: "postName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "离职部门",
    dataIndex: "organizationName",
    key: "organizationName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: `离职${KEYWORD_ALIAS.staff}`,
    dataIndex: "staffName",
    key: "staffName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "申请人",
    dataIndex: "applicantName",
    key: "applicantName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "申请时间",
    dataIndex: "applyTime",
    key: "applyTime",
    customRender: ({ text }) => {
      return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "-";
    },
  },
  {
    title: "处理时间",
    dataIndex: "applyDoneTime",
    key: "applyDoneTime",
    customRender: ({ text }) => {
      return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "-";
    },
  },
]
// 考核 
const appraiseColumns: TableColumnsType = [
  {
    title: `${KEYWORD_ALIAS.staff}名称`,
    dataIndex: "staffName",
    key: "staffName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "所在岗位",
    dataIndex: "postName",
    key: "postName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "所在部门",
    dataIndex: "organizationName",
    key: "organizationName",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "绩效考核分数",
    dataIndex: "score",
    key: "score",
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "考核时间",
    dataIndex: "assessTime",
    key: "assessTime",
    customRender: ({ text }) => {
      return text || '-';
    },
  },
]
export const typeForColumnsMap = new Map<string, TableColumnsType>([
  ["recruit", recruitColumns], //招聘
  ["induction", inductionColumns], //入职
  ["appraise", appraiseColumns], //考核
  ["regular", regularColumns], //转正
  ["depart", departColumns], //转正
  ["workshift", workshiftColumns], //轮岗
])
export const typeForNameMap = new Map<string, string>([
  ["recruit", "招聘"],
  ["induction", "入职"],
  ["appraise", "考核"],
  ["regular", "转正"],
  ["depart", "离职"],
  ["workshift", "轮岗"],
]);
export const typeForMethods = new Map<string, any>([
  ["recruit", getRecruitStatisticsInfo], //招聘
  ["induction", getInductionStatisticsInfo], //入职
  ["appraise", getAppraiseStatisticsInfo], //考核
  ["regular", getRegularStatisticsInfo], //转正
  ["depart", getDepartStatisticsInfo], //转正
  ["workshift", getRotationPostStatisticsInfo], //轮岗
]);
