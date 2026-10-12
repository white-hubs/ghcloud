import { authStore } from "@/api/auth-store";
import { cubeSecureEduService, cubeSecureEduPublicService } from "@/api/server";
import { ExamTaskType, type PaperState, type ExamResultState, type UserInfoState } from "@ghcloud/cube-secure-edu-service";
import { showNotify } from "vant";
import { reactive, computed, type ComputedRef } from "vue";
import { useRouter, useRoute } from "vue-router";

interface ExamHandleState {
  currentQuestionIndex: number;
  paperDetails: PaperState;
  startExamTime: number;
  examResult: ExamResultState;
  isback: boolean;
  endExamTime: number;
}
interface HooksState {
  examHandleState: ExamHandleState;
  setCurrentQuestionIndex: (index: number) => void;
  goExamHandle: (query: {
    id: string;
    examPaperId: string;
    type: HandleExamType;
    examTaskId?: string;
    examDuration?: number;
    examTaskType?: string;
  }) => void;
  setPaperDetails: (paperDetails: PaperState) => void;
  setStartExamTime: () => void;
  handleSubmitExam: () => Promise<void>;
  resetExamHandleState: () => void;
  setIsBack: (isback: boolean) => void;
  questionAnswerStateCount: ComputedRef<{
    answeredCount: number;
    unAnsweredCount: number;
    totalCount: number;
  }>;
  examDurationMinuts: ComputedRef<number>;
}
export enum HandleExamType {
  ANALTSIS = "analysis",
  STARTEXAM = "startExam",
  PRACTISE = "practise",
}

// 通用数据
const examHandleState = reactive<ExamHandleState>({
  currentQuestionIndex: 0,
  paperDetails: {
    id: "",
    name: "",
    score: 0,
    passingGradeScore: 0,
    remark: "",
    examPaperQuestionNumber: 0,
    retake: true,
    timed: true,
    questionCategories: [],
    examQuestions: [],
  },
  startExamTime: new Date().getTime(),
  endExamTime: new Date().getTime(),
  isback: false,
  examResult: {
    id: "",
    paperScore: 0,
    passed: false,
    score: 0,
    passingRate: 0,
  },
});
export function useExamHandleStore(): HooksState {
  const router = useRouter();
  const route = useRoute();
  const questionAnswerStateCount = computed(() => {
    const answeredCount = examHandleState.paperDetails.examQuestions.filter((item) => item.editState).length;
    return {
      answeredCount,
      unAnsweredCount: examHandleState.paperDetails.examPaperQuestionNumber - answeredCount,
      totalCount: examHandleState.paperDetails.examPaperQuestionNumber,
    };
  });
  // 持续分钟数
  const examDurationMinuts = computed(() => Math.ceil((examHandleState.endExamTime - examHandleState.startExamTime) / 1000 / 60));
  // 设置试卷
  const setPaperDetails = (paperDetails: PaperState): void => {
    examHandleState.paperDetails = paperDetails;
  };
  // 设置是返回
  const setIsBack = (isback: boolean): void => {
    examHandleState.isback = isback;
  };
  // 重置store
  const resetExamHandleState = (): void => {
    examHandleState.currentQuestionIndex = 0;
    examHandleState.isback = false;
    examHandleState.paperDetails = {
      id: "",
      name: "",
      score: 0,
      passingGradeScore: 0,
      remark: "",
      examPaperQuestionNumber: 0,
      retake: true,
      timed: true,
      questionCategories: [],
      examQuestions: [],
    };
  };
  // 设置当前问题索引
  const setCurrentQuestionIndex = (index: number): void => {
    examHandleState.currentQuestionIndex = index;
  };
  // 处理提交试卷
  const handleSubmitExam = async (): Promise<void> => {
    try {
      const authenticated = Boolean(authStore.token);
      const isMerchantExam = route.query.examTaskType === ExamTaskType.MERCHANT_EXAM;
      const isStaffExam = route.query.examTaskType === ExamTaskType.STAFF_EXAM;
      const shouldUsePublicService = isMerchantExam || (!isStaffExam && !authenticated);
      let userInfo: UserInfoState = {
        userDepartmentName: "",
        userIdentify: "",
        userName: "",
        userPhone: "",
        userPostName: "",
      };
      if (shouldUsePublicService) {
        userInfo = JSON.parse(localStorage.getItem("userInfo") as unknown as string);
      }
      examHandleState.endExamTime = new Date().getTime();
      const examDuration = Math.ceil((examHandleState.endExamTime - examHandleState.startExamTime) / 1000);
      const payload = {
        examTaskId: route.query.id as string,
        examPaperId: examHandleState.paperDetails.id,
        examDuration,
        examQuestions: examHandleState.paperDetails.examQuestions,
        userInfo,
      };
      const result = shouldUsePublicService
        ? await cubeSecureEduPublicService.submitExam(payload)
        : await cubeSecureEduService.submitExam(payload);
      examHandleState.examResult = result;
      if (!examHandleState.isback) {
        router.push({
          path: "/secure-exam/exam-end",
          query: {
            id: route.query.id as string,
            examPaperId: (route.query.examPaperId as string) ?? examHandleState.paperDetails.id,
            retake: examHandleState.paperDetails.retake ? "1" : "",
            examTaskType: route.query.examTaskType as string,
          },
        });
      } else {
        showNotify({
          message: "提交成功",
          type: "success",
        });
        router.push({
          path: "/examinationTaskList",
          query: {
            marketTenant: sessionStorage.getItem("marketTenant") || "",
            headTenant: sessionStorage.getItem("headTenant"),
          },
        });
      }
      resetExamHandleState();
    } catch (error) {
      const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
      showNotify({ type: "danger", message: errorMessage || "请求失败" });
    }
  };
  const setStartExamTime = (): void => {
    examHandleState.startExamTime = new Date().getTime();
  };
  // 开始考试
  const goExamHandle = async (query: {
    id: string;
    examPaperId: string;
    type: HandleExamType;
    examTaskId?: string;
    examDuration?: number;
    examTaskType?: string;
  }): Promise<void> => {
    const authenticated = Boolean(authStore.token);
    const isStaffExam = query.examTaskType === ExamTaskType.STAFF_EXAM;
    const shouldUsePublicService = query.examTaskType === ExamTaskType.MERCHANT_EXAM || (!isStaffExam && !authenticated);
    const result = shouldUsePublicService
      ? await cubeSecureEduPublicService.getExamDetail({ id: query.id, userIdentify: localStorage.getItem("browserId") })
      : await cubeSecureEduService.getExamDetail({ id: query.id });
    if (query.type === HandleExamType.STARTEXAM) {
      if (result.examFrequencyLimit) {
        showNotify({ type: "warning", message: "考试次数已用完" });
        return;
      }
    }
    router.push({
      path: "/secure-exam/handle-exam",
      query: {
        ...query,
        examDuration: result.timed ? result.examDuration : "",
      },
    });
  };
  return {
    examHandleState,
    setCurrentQuestionIndex,
    setStartExamTime,
    handleSubmitExam,
    setIsBack,
    resetExamHandleState,
    goExamHandle,
    examDurationMinuts,
    questionAnswerStateCount,
    setPaperDetails,
  };
}
