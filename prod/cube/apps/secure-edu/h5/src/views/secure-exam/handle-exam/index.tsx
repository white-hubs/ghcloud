import { useExamHandleStore, HandleExamType } from "../exam-handle-hooks";
import { MultipleChoice } from "./components/multiple-choice";
import { OperateBottom } from "./components/operate-bottom";
import { SingleChoice } from "./components/single-choice";
import styles from "./index.module.less";
import { authStore } from "@/api/auth-store";
import { cubeSecureEduService, cubeSecureEduPublicService } from "@/api/server";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { ExamTaskType, QuestionType } from "@ghcloud/cube-secure-edu-service";
import { showNotify, showDialog, showConfirmDialog } from "vant";
import { computed, defineComponent, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
export const HandleExam = defineComponent({
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const examHandleStore = useExamHandleStore();
    const remainingSeconds = ref(Math.max(0, Number(route.query.examDuration ?? 0) * 60));
    const timerId = ref<number | null>(null);
    const currentQuestion = computed(
      () => examHandleStore.examHandleState.paperDetails.examQuestions[examHandleStore.examHandleState.currentQuestionIndex],
    );
    const currentQuestionKey = computed(
      () => `${examHandleStore.examHandleState.currentQuestionIndex}-${currentQuestion.value?.id || "question"}`,
    );
    const timerText = computed(() => {
      const minutes = Math.floor(remainingSeconds.value / 60);
      const seconds = remainingSeconds.value % 60;
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    });
    const clearTimer = (): void => {
      if (timerId.value !== null) {
        window.clearInterval(timerId.value);
        timerId.value = null;
      }
    };
    const countDownFinish = (): void => {
      clearTimer();
      showDialog({
        title: "提示",
        message: "考试时间到!将按当前答案交卷",
      }).then(async () => {
        await examHandleStore.handleSubmitExam();
      });
    };
    const startTimer = (): void => {
      clearTimer();
      if (route.query.type !== HandleExamType.STARTEXAM || !route.query.examDuration) {
        return;
      }
      remainingSeconds.value = Math.max(0, Number(route.query.examDuration) * 60);
      if (remainingSeconds.value <= 0) {
        countDownFinish();
        return;
      }
      timerId.value = window.setInterval(() => {
        remainingSeconds.value -= 1;
        if (remainingSeconds.value <= 0) {
          remainingSeconds.value = 0;
          countDownFinish();
        }
      }, 1000);
    };
    // 获取试卷数据
    const getPaperData = async (): Promise<void> => {
      try {
        const authenticated = Boolean(authStore.token);
        const isStaffExam = route.query.examTaskType === ExamTaskType.STAFF_EXAM;
        const shouldUsePublicService = route.query.examTaskType === ExamTaskType.MERCHANT_EXAM || (!isStaffExam && !authenticated);
        if (isStaffExam && !authenticated) {
          await router.replace({
            path: "/auth/login",
            query: {
              redirect: encodeURIComponent(route.fullPath),
            },
          });
          return;
        }
        const params = {
          id: route.query.id as string,
          paperId: route.query.examPaperId as string,
          userIdentify: localStorage.getItem("browserId") ?? "",
        };
        const result = shouldUsePublicService
          ? await cubeSecureEduPublicService.getUserExamPaper(params)
          : await cubeSecureEduService.getUserExamPaper(params);
        examHandleStore.setStartExamTime();
        examHandleStore.setPaperDetails(result);
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
      }
    };
    const getExamRecordInfo = async (): Promise<void> => {
      const authenticated = Boolean(authStore.token);
      const isStaffExam = route.query.examTaskType === ExamTaskType.STAFF_EXAM;
      const shouldUsePublicService = route.query.examTaskType === ExamTaskType.MERCHANT_EXAM || (!isStaffExam && !authenticated);
      const params = {
        examTaskId: route.query.examTaskId as string,
      };
      const result = shouldUsePublicService
        ? await cubeSecureEduPublicService.getExamRecordDetail(params)
        : await cubeSecureEduService.getExamRecordDetail(params);
      examHandleStore.setPaperDetails(result);
    };
    // 上一题
    const handlePrev = (): void => {
      const current = examHandleStore.examHandleState.currentQuestionIndex;
      if (current === 0) {
        showNotify({ type: "warning", message: "当前已是第一题" });
        return;
      }
      examHandleStore.setCurrentQuestionIndex(current - 1);
    };
    // 下一题
    const handleNext = (): void => {
      const current = examHandleStore.examHandleState.currentQuestionIndex;
      if (current >= examHandleStore.examHandleState.paperDetails.examQuestions.length - 1) {
        showNotify({ type: "warning", message: "当前已是最后一题" });
        return;
      }
      examHandleStore.setCurrentQuestionIndex(current + 1);
    };
    // 提交考试
    const handleSubmitExam = (): void => {
      const notEditQuestions = examHandleStore.examHandleState.paperDetails.examQuestions.filter((item) => !item.editState);
      const message = notEditQuestions.length === 0 ? "确定交卷吗?" : `还有${notEditQuestions.length}题未作答，确定交卷吗?`;
      showConfirmDialog({
        title: "交卷",
        message,
      })
        .then(async () => {
          await examHandleStore.handleSubmitExam();
        })
        .catch(() => {
          // on cancel
        });
    };
    const handleStateBack = (): void => {
      history.pushState(null, "", document.URL);
      showConfirmDialog({
        title: "提示",
        message: "当前退出会以当前选择提交考试,是否确认?",
      })
        .then(async () => {
          examHandleStore.setIsBack(true);
          try {
            await examHandleStore.handleSubmitExam();
          } catch {
            router.push({
              path: "/examinationTaskList",
              query: {
                marketTenant: sessionStorage.getItem("marketTenant") || "",
                headTenant: sessionStorage.getItem("headTenant") || "",
              },
            });
          }
        })
        .catch(() => {
          // on cancel
        });
    };
    onMounted(async () => {
      if (route.query.type === HandleExamType.STARTEXAM) {
        history.pushState(null, "", location.href);
        window.addEventListener("popstate", handleStateBack, false);
        await getPaperData();
        startTimer();
        document.title = examHandleStore.examHandleState.paperDetails.name;
      } else {
        await getExamRecordInfo();
        document.title = examHandleStore.examHandleState.paperDetails.name;
      }
    });
    onUnmounted(() => {
      clearTimer();
      window.removeEventListener("popstate", handleStateBack, false);
    });
    return (): JSX.Element => (
      <>
        <CubeNavBar title="安全教育" showBack />
        <div class={styles.container}>
          <div class={styles.title}>
            <div class={styles.type}>
              {
                examHandleStore.examHandleState.paperDetails.examQuestions[examHandleStore.examHandleState.currentQuestionIndex]
                  ?.questionTypeName
              }
            </div>
            <div class={styles.time}>
              {route.query.type === HandleExamType.STARTEXAM && route.query.examDuration && <span>{timerText.value}</span>}
            </div>
          </div>
          <div class={styles.subject}>
            {currentQuestion.value?.questionType === QuestionType.SINGLE_CHOICE && (
              <SingleChoice key={currentQuestionKey.value} questionEntity={currentQuestion.value} />
            )}
            {currentQuestion.value?.questionType === QuestionType.MULTIPLE_CHOICE && (
              <MultipleChoice key={currentQuestionKey.value} questionEntity={currentQuestion.value} />
            )}
            {currentQuestion.value?.questionType === QuestionType.JUDGE && (
              <SingleChoice key={currentQuestionKey.value} questionEntity={currentQuestion.value} />
            )}
          </div>
          <OperateBottom onNext={handleNext} onPrev={handlePrev} onSubmitExam={handleSubmitExam} />
        </div>
      </>
    );
  },
});
