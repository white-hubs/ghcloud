import type { Component } from "vue";

/** 考勤流程审批记录 */
export default [
  {
    path: "/flow-approval-record",
    name: "flowApprovalRecord",
    component: async (): Promise<Component> => {
      const module = await import("@/views/flow-approval-record");
      return module.FlowApprovalRecord;
    },
    meta: {
      title: "考勤流程审批记录",
    },
  },
];
