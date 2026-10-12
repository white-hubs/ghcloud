import appraiseApprovalList from '@/views/Appraise/appraiseApprovalList.vue'
import appraiseStatistics from '@/views/Appraise/appraiseStatistics.vue'
import departApprovalList from '@/views/Depart/departApprovalList.vue'
import departProceduresList from '@/views/Depart/departProceduresList.vue'
import departStatistics from '@/views/Depart/departStatistics.vue'
import drillApprovalList from '@/views/Drill/drillApprovalList.vue'
import inductionApprovalList from '@/views/Induction/inductionApprovalList.vue'
import inductionStatistics from '@/views/Induction/inductionStatistics.vue'
import overView from '@/views/overView.vue'
import personnelStatistics from '@/views/personnelStatistics.vue'
import posiManage from '@/views/posiManage.vue'
import recruitApprovalList from '@/views/Recruit/recruitApprovalList.vue'
import recruitStatistics from '@/views/Recruit/recruitStatistics.vue'
import regularApprovalList from '@/views/Regular/regularApprovalList.vue'
import regularStatistics from '@/views/Regular/regularStatistics.vue'
import statisticsInfo from '@/views/statisticsInfo/index.vue'
import workShiftApprovalList from '@/views/WorkShift/workShiftApprovalList.vue'
import workShiftStatistics from '@/views/WorkShift/workShiftStatistics.vue'
import roster from '../views/roster/roster.vue'
import rosterOperate from '../views/roster/rosterOperate.vue'
import fieldConfig from '../views/field-config/field-config.vue'
import businessPermissions from '@/views/roster/business-permissions.vue'
/** 固定的路由 */
export const constantRoutes: AuthRoute.Route[] = [
  {
    path: "/flowConfig",
    name: "flowConfig",
    component: async () => import("@/views/flowConfig.vue"),
  },
  {
    path: '/statisticsInfo',
    name: "statisticsInfo",
    component: statisticsInfo,
  },
  {
    path: "/posiManage",
    name: "posiManage",
    component: posiManage,
  },
  {
    path: "/overView",
    name: "overView",
    component: overView,
  },
  {
    path: "/recruitStatisticsList",
    name: "recruitStatisticsList",
    component: recruitStatistics,
  },
  {
    path: "/inductionStatisticsList",
    name: "inductionStatisticsList",
    component: inductionStatistics,
  },
  {
    path: "/appraiseStatisticsList",
    name: "appraiseStatisticsList",
    component: appraiseStatistics,
  },
  {
    path: "/regularStatisticsList",
    name: "regularStatisticsList",
    component: regularStatistics,
  },
  {
    path: "/departStatisticsList",
    name: "departStatisticsList",
    component: departStatistics,
  },
  {
    path: "/workShiftStatisticsList",
    name: "workShiftStatisticsList",
    component: workShiftStatistics,
  },
  {
    path: "/recruitApprovalList",
    name: "recruitApprovalList",
    component: recruitApprovalList,
  },
  {
    path: "/personnelStatisticsList",
    name: "personnelStatisticsList",
    component: personnelStatistics,
  },
  {
    path: "/workShiftApprovalList",
    name: "workShiftApprovalList",
    component: workShiftApprovalList,
  },
  {
    path: "/inductionApprovalList",
    name: "inductionApprovalList",
    component: inductionApprovalList,
  },
  {
    path: "/drillApprovalList",
    name: "drillApprovalList",
    component: drillApprovalList,
  },
  {
    path: "/regularApprovalList",
    name: "regularApprovalList",
    component: regularApprovalList,
  },
  {
    path: "/departApprovalList",
    name: "departApprovalList",
    component: departApprovalList,
  },
  {
    path: "/appraiseApprovalList",
    name: "appraiseApprovalList",
    component: appraiseApprovalList,
  },
  {
    path: "/departProceduresList",
    name: "departProceduresList",
    component: departProceduresList,
  },
  {
    path: "/roster",
    name: "roster",
    component: roster,
  },
  {
    path: "/rosterOperate",
    name: "rosterOperate",
    component: rosterOperate,
  },
  {
    path: "/business-permissions",
    name: "business-permissions",
    component: businessPermissions,
  },
  {
    path: "/person-type",
    name: "person-type",
    component:  async () => import("@/views/person-type/person-type.vue"),
  },
  {
    path: "/field-config",
    name: "field-config",
    component: fieldConfig,
  },
];
