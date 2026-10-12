import departmentWorkList from "@/views/departmentWork/departmentWorkList.vue";
import departmentWorkStatistics from "@/views/departmentWork/departmentWorkStatistics.vue";
import circulationStatistics from "@/views/DocumentCirculation/circulationStatistics.vue";
import documentApprovalList from "@/views/DocumentCirculation/documentApprovalList.vue";
import documentReceivedList from "@/views/DocumentReceived/documentReceivedList.vue";
import documentReceivedStatistics from "@/views/DocumentReceived/documentReceivedStatistics.vue";
import flowConfig from "@/views/flowConfig.vue";
import issueApprovalList from "@/views/IssueApproval/issueApprovalList.vue";
import issueStatistics from "@/views/IssueApproval/issueStatistics.vue";
import issueStatisticsInfo from "@/views/IssueApproval/issueStatisticsInfo.vue";
import matterUrgeApproval from "@/views/MatterUrge/matterUrgeApproval.vue";
import approvalStatistics from "@/views/superviseManage/approvalStatistics.vue";
import eventApprovalList from "@/views/superviseManage/eventApprovalList.vue";
import eventExchangeList from "@/views/superviseManage/eventExchangeList.vue";
import eventHandleApprovalList from "@/views/superviseManage/eventHandleApprovalList.vue";
import eventHandleDetail from "@/views/superviseManage/eventHandleDetail.vue";
import eventHandleDetailSH from "@/views/superviseManage/eventHandleDetailSH.vue";
import eventHandleList from "@/views/superviseManage/eventHandleList.vue";
import eventHandleListSH from "@/views/superviseManage/eventHandleListSH.vue";
import eventTypeList from "@/views/superviseManage/eventTypeList.vue";
import exchangeStatistics from "@/views/superviseManage/exchangeStatistics.vue";
import systemSolicitatioList from "@/views/SystemSolicitation/systemSolicitatioList.vue";
import systemStatistics from "@/views/SystemSolicitation/systemStatistics.vue";
import systemStatisticsInfo from '@/views/SystemSolicitation/systemStatisticsInfo.vue';
import sealManageList from "@/views/UseSealManage/sealManageList.vue";
import sealStatisticsInfo from '@/views/UseSealManage/sealStatisticsInfo.vue';
import useSealApprovalList from "@/views/UseSealManage/useSealApprovalList.vue";
import useSealStatistics from "@/views/UseSealManage/useSealStatistics.vue";
import workOrder from "@/views/workOrder.vue";
import messageConfig from '@/views/message-config/index.vue'
/** 固定的路由 */
export const constantRoutes: AuthRoute.Route[] = [
  {
    path: "/flowConfig",
    name: "flowConfig",
    component: flowConfig,
  },
  {
    path: "/message-config",
    name: "message-config",
    component: messageConfig,
  },
  {
    path: '/systemStatisticsInfo',
    name: "systemStatisticsInfo",
    component: systemStatisticsInfo,
  },
  {
    path: '/issueStatisticsInfo',
    name: "issueStatisticsInfo",
    component: issueStatisticsInfo,
  },
  {
    path: "/sealStatisticsInfo",
    name: "sealStatisticsInfo",
    component: sealStatisticsInfo,
  },
  {
    path: "/systemSolicitatioList",
    name: "systemSolicitatioList",
    component: systemSolicitatioList,
  },
  {
    path: "/systemStatistics",
    name: "systemStatistics",
    component: systemStatistics,
  },
  {
    path: "/useSealApprovalList",
    name: "useSealApprovalList",
    component: useSealApprovalList,
  },
  {
    path: "/useSealStatistics",
    name: "useSealStatistics",
    component: useSealStatistics,
  },
  {
    path: "/sealManageList",
    name: "sealManageList",
    component: sealManageList,
  },
  {
    path: "/issueApprovalList",
    name: "issueApprovalList",
    component: issueApprovalList,
  },
  {
    path: "/issueStatistics",
    name: "issueStatistics",
    component: issueStatistics,
  },
  {
    path: "/documentApprovalList",
    name: "documentApprovalList",
    component: documentApprovalList,
  },
  {
    path: "/circulationStatistics",
    name: "circulationStatistics",
    component: circulationStatistics,
  },
  {
    path: "/documentReceivedList",
    name: "documentReceivedList",
    component: documentReceivedList,
  },
  {
    path: "/documentReceivedStatistics",
    name: "documentReceivedStatistics",
    component: documentReceivedStatistics,
  },
  {
    path: "/departmentWorkList",
    name: "departmentWorkList",
    component: departmentWorkList,
  },
  {
    path: "/departmentWorkStatistics",
    name: "departmentWorkStatistics",
    component: departmentWorkStatistics,
  },
  {
    path: "/matterUrgeApprovalList",
    name: "matterUrgeApprovalList",
    component: matterUrgeApproval,
  },
  {
    path: "/approvalStatistics",
    name: "approvalStatistics",
    component: approvalStatistics,
  },
  {
    path: "/eventApprovalList",
    name: "eventApprovalList",
    component: eventApprovalList,
  },
  {
    path: "/eventExchangeList",
    name: "eventExchangeList",
    component: eventExchangeList,
  },
  {
    path: "/eventHandleList",
    name: "eventHandleList",
    component: eventHandleList,
  },
  {
    path: "/eventHandleListSH",
    name: "eventHandleListSH",
    component: eventHandleListSH,
  },
  {
    path: "/eventTypeList",
    name: "eventTypeList",
    component: eventTypeList,
  },
  {
    path: "/exchangeStatistics",
    name: "exchangeStatistics",
    component: exchangeStatistics,
  },
  {
    path: "/eventHandleApprovalList",
    name: "eventHandleApprovalList",
    component: eventHandleApprovalList,
  },
  {
    path: "/eventHandleDetail",
    name: "eventHandleDetail",
    component: eventHandleDetail,
  },
  {
    path: "/eventHandleDetailSH",
    name: "eventHandleDetailSH",
    component: eventHandleDetailSH,
  },
  {
    path: "/workOrder",
    name: "workOrder",
    component: workOrder,
  },
];
