import { Circle, Button, showNotify } from "vant";
import { computed, defineComponent, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";

import { useMetaTitle } from "../../hooks/use-meta-title-hook";
import { useExamHandleStore, HandleExamType } from "../exam-handle-hooks";

import styles from "./index.module.less";
export const ExamEnd = defineComponent({
  setup: () => {
    useMetaTitle();
    const examHandleStore = useExamHandleStore();
    const route = useRoute();
    const router = useRouter();
    const colorStyles = computed(() => {
      if (examHandleStore.examHandleState.examResult.passed) {
        return {
          color: "#39B54A",
          bgColor: "#DDFDC8",
        };
      }
      return {
        color: "#FE8704",
        bgColor: "#FFE4C4",
      };
    });
    // 圆环填充率
    const circleRate = computed(() => {
      return Math.floor((examHandleStore.examHandleState.examResult.score * 100) / examHandleStore.examHandleState.examResult.paperScore);
    });
    // 考试解析
    const handleAnalysis = (): void => {
      const params = {
        id: route.query.id as string,
        examTaskId: examHandleStore.examHandleState.examResult.id,
        examPaperId: route.query.examPaperId as string,
        type: HandleExamType.ANALTSIS,
        examTaskType: route.query.examTaskType as string,
      };
      examHandleStore.goExamHandle(params);
    };
    // 监听返回
    const handleStateBack = (): void => {
      history.pushState(null, "", document.URL);
      router.push({
        path: "/examinationTaskList",
        query: {
          marketTenant: sessionStorage.getItem("marketTenant") || "",
          headTenant: sessionStorage.getItem("headTenant") || "",
        },
      });
    };
    onMounted(() => {
      history.pushState(null, "", location.href);
      window.addEventListener("popstate", handleStateBack, false);
    });
    onUnmounted(() => {
      window.removeEventListener("popstate", handleStateBack, false);
    });
    // 重新答题
    const handleStartExam = (): void => {
      if (!route.query.retake) {
        showNotify({ type: "warning", message: "考试次数已用完" });
        return;
      }
      const params = {
        id: route.query.id as string,
        examPaperId: route.query.examPaperId as string,
        type: HandleExamType.STARTEXAM,
        examTaskType: route.query.examTaskType as string,
      };
      examHandleStore.goExamHandle(params);
    };
    return (): JSX.Element => (
      <>
        <CubeNavBar title="考试结束" showBack />
        <div class={styles.container}>
          <div class={styles.scoreContainer}>
            <div class={styles.circleContainer}>
              <Circle
                currentRate={circleRate.value}
                strokeWidth={60}
                color={colorStyles.value.color}
                layerColor="#e8e8e8"
                rate={100}
                size="160px"
              >
                <div class={styles.circleInner}>
                  <div class={styles.currentScore} style={{ color: colorStyles.value.color }}>
                    <span class={styles.num}>{examHandleStore.examHandleState.examResult.score}</span>
                    <span>分</span>
                  </div>
                  <span>满分{examHandleStore.examHandleState.examResult.paperScore}分</span>
                </div>
              </Circle>
            </div>

            <div class={styles.result}>
              <div class={styles.tips} style={{ color: colorStyles.value.color, backgroundColor: colorStyles.value.bgColor }}>
                {examHandleStore.examHandleState.examResult.passed ? "通过" : "未通过"}
              </div>
            </div>
            <div class={styles.endAnaysis}>
              <div class={styles.item}>
                <div class={styles.time} style={{ color: colorStyles.value.color }}>
                  <span class={styles.timeNum}>{examHandleStore.examDurationMinuts.value}</span>
                  <span>分钟</span>
                </div>
                <div>考试时长</div>
              </div>
              <div class={styles.item}>
                <div style={{ color: "#000", fontSize: "16px", fontWeight: 500 }}>
                  {examHandleStore.examHandleState.examResult.passingRate}%
                </div>
                <div>正确率</div>
              </div>
            </div>
          </div>
          <div class={styles.operate}>
            <Button round block type="primary" onClick={handleStartExam}>
              重新答题
            </Button>
            <Button round block plain type="primary" onClick={handleAnalysis} class={styles.bottomBtn}>
              考试解析
            </Button>
          </div>
        </div>
      </>
    );
  },
});
