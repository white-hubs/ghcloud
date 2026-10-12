declare namespace SuperviseMangagement {
  interface rowState {
    applicantDeptId: string;
    applicantDeptName: string;
    applicantId: string;
    applicantName: string;
    applyDoneTime: null | number;
    applyTime: null | number;
    basis: string;
    completeTime: null | number;
    deptId: string;
    deptName: string;
    firstUserId: string;
    firstUserName: string;
    id: null | string;
    percentage: null | string;
    processInstanceCode: string;
    processInstanceId: string;
    processInstanceName: string;
    requirement: string;
    secondUserId: string;
    secondUserName: string;
    status: string;
    timeLimitDesc: string;
    updateCompleteTime: null | number;
    workCategoryId: string;
    workCategoryName: string;
    workDesc: string;
  }
  interface FormState {
    submitTime: string[];
    status: string | null;
    backlogKey: string;
  }
  interface handleFormState {
    period: string[];
    name: string | null;
    deptId: string | null;
    firstUserId: string | null;
    status: string | null;
  }
  const enum STATUS {
    "UNDONE" = "未完成",
    "STOP" = "已终止",
    "PROCESSING" = "处理中",
    "FINISH" = "已完成",
  }
  type TYPES = keyof typeof STATUS;
}
