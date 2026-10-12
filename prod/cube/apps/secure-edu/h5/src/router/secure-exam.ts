import type { RouteRecordRaw } from "vue-router";

const routers: RouteRecordRaw[] = [
  {
    path: "/secure-exam",
    redirect: "/examinationTaskList",
  },
  {
    name: "secure-exam",
    path: "/examinationTaskList",
    component: async () => (await import("@/views/secure-exam")).ExamList,
    meta: {
      title: "考试列表",
    },
  },
  {
    name: "exam-sign-in",
    path: "/secure-exam/sign-in",
    component: async () => (await import("@/views/secure-exam/sign-in")).SignIn,
    meta: {
      title: "考试",
    },
  },
  {
    name: "staff-exam-auth-entry",
    path: "/secure-exam/staff-exam-auth",
    component: async () => (await import("@/views/secure-exam/staff-exam-auth-entry")).StaffExamAuthEntry,
    meta: {
      title: "考试",
      requiresAuth: true,
    },
  },
  {
    name: "exam-detail",
    path: "/secure-exam/detail",
    component: async () => (await import("@/views/secure-exam/detail")).ExamDetail,
    meta: {
      title: "考试详情",
    },
  },
  {
    name: "handle-exam",
    path: "/secure-exam/handle-exam",
    component: async () => (await import("@/views/secure-exam/handle-exam")).HandleExam,
    meta: {
      title: "考试处理",
    },
  },
  {
    name: "exam-end",
    path: "/secure-exam/exam-end",
    component: async () => (await import("@/views/secure-exam/exam-end")).ExamEnd,
    meta: {
      title: "考试结束",
    },
  },
];

export const secureExamRouters: RouteRecordRaw[] = [...routers];
