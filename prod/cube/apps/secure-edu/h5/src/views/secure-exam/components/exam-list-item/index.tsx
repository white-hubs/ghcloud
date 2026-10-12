import styles from "./index.module.less";
import { authStore } from "@/api/auth-store";
import { cubeSecureEduPublicService, cubeSecureEduService } from "@/api/server";
import { ExamTaskType } from "@ghcloud/cube-secure-edu-service";
import dayjs from "dayjs";
import { showNotify } from "vant";
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
export const ExamListItem = defineComponent({
  props: {
    examProp: {
      type: Object,
      default: () => {},
    },
  },
  setup: (props) => {
    const router = useRouter();
    const statusObj: Record<string, string> = {
      STAY_EXAM: "待考试",
      IN_PROGRESS: "进行中",
      ENDED: "已结束",
    };
    const handleStartExam = async (e: Event): Promise<void> => {
      e.stopPropagation();
      const authenticated = Boolean(authStore.token);
      const shouldUsePublicService = props.examProp.examTaskType === ExamTaskType.MERCHANT_EXAM || !authenticated;
      const result = shouldUsePublicService
        ? await cubeSecureEduPublicService.getExamDetail({ id: props.examProp.id, userIdentify: localStorage.getItem("browserId") })
        : await cubeSecureEduService.getExamDetail({ id: props.examProp.id });
      if (result.examFrequencyLimit) {
        showNotify({ type: "warning", message: "考试次数已用完" });
        return;
      }
      const startExamQuery = {
        id: result.id,
        examPaperId: result.examPaperId,
        examDuration: result.examDuration,
        examTaskType: result.examTaskType,
      };
      if (result.examTaskType === ExamTaskType.STAFF_EXAM) {
        localStorage.removeItem("userInfo");
        router.push({
          path: "/secure-exam/staff-exam-auth",
          query: startExamQuery,
        });
        return;
      }
      if (result.examTaskType === ExamTaskType.MERCHANT_EXAM) {
        localStorage.removeItem("userInfo");
        router.push({
          path: "/secure-exam/sign-in",
          query: startExamQuery,
        });
        return;
      }
      showNotify({ type: "warning", message: "考试类型异常，暂无法开始考试" });
    };
    const handleDetail = (): void => {
      router.push({
        path: "/secure-exam/detail",
        query: {
          id: props.examProp.id,
        },
      });
    };
    return (): JSX.Element => (
      <div class={styles["list-item"]} onClick={handleDetail}>
        <div class={styles.title}>
          <div class={[styles.status, styles[props.examProp.examTaskStatus]]}>{statusObj[props.examProp.examTaskStatus]}</div>
          <div class={styles["title-name"]}>{props.examProp.name}</div>
        </div>
        <div class={styles.content}>
          <div class={styles["content-item"]}>
            <div class={styles["content-item-label"]}>考试时间</div>
            <div class={styles["content-item-value"]}>
              {dayjs(props.examProp.examStartTime).format("MM-DD HH:mm")}至{dayjs(props.examProp.examEndTime).format("MM-DD HH:mm")}
            </div>
          </div>
          <div class={styles["content-item"]}>
            <div class={styles["content-item-label"]}>考试标准</div>
            <div class={styles["content-item-value"]}>
              {props.examProp.examDuration || "--"}分钟，{props.examProp.examPaperQuestionNumber || "--"}题
            </div>
          </div>
          <div class={styles["content-item"]}>
            <div class={styles["content-item-label"]}>合格标准</div>
            <div class={styles["content-item-value"]}>
              {props.examProp.examPaperPassingGradeScore || "--"}分及格({props.examProp.examPaperScore || "--"}分满分)
            </div>
          </div>
        </div>
        {props.examProp.examTaskStatus === "IN_PROGRESS" && (
          <div class={styles.operate}>
            <div class={styles["operate-btn"]} onClick={handleStartExam}>
              开始考试
            </div>
          </div>
        )}
      </div>
    );
  },
});
