import dayjs from "dayjs";
import { Empty } from "vant";
import { defineComponent, onMounted, reactive, type PropType } from "vue";

import { ExamTaskType, type ExamDetailState, type ExamRecordState } from "@ghcloud/cube-secure-edu-service";

import { authStore } from "@/api/auth-store";
import { cubeSecureEduService, cubeSecureEduPublicService } from "@/api/server";
import { HandleExamType, useExamHandleStore } from "@/views/secure-exam/exam-handle-hooks";

import styles from "./index.module.less";
export const ExamRecord = defineComponent({
  props: {
    details: {
      type: Object as PropType<ExamDetailState>,
      default: () => {},
    },
  },
  setup: (props) => {
    const examHandleStore = useExamHandleStore();
    const state = reactive<{ examRecords: ExamRecordState[] }>({
      examRecords: [],
    });
    const getRecords = async (): Promise<void> => {
      const authenticated = Boolean(authStore.token);
      const shouldUsePublicService = props.details.examTaskType === ExamTaskType.MERCHANT_EXAM || !authenticated;
      const params = {
        userIdentify: localStorage.getItem("browserId"),
        id: props.details.id,
      };
      const res = shouldUsePublicService
        ? await cubeSecureEduPublicService.getExamTaskRecords(params)
        : await cubeSecureEduService.getExamTaskRecords(params);
      state.examRecords = res;
    };
    // 考试解析
    const handleAnalysis = (id: string): void => {
      const params = {
        id: props.details.id,
        examTaskId: id,
        examPaperId: props.details.examPaperId,
        type: HandleExamType.ANALTSIS,
        examDuration: props.details.examDuration,
        examTaskType: props.details.examTaskType,
      };
      examHandleStore.goExamHandle(params);
      examHandleStore.resetExamHandleState();
    };
    onMounted(() => {
      getRecords();
    });
    return (): JSX.Element => (
      <div class={styles.examRecord}>
        {state.examRecords.length !== 0 &&
          state.examRecords.map((item, index) => {
            return (
              <div
                class={styles.recordItem}
                key={item.id}
                style={{ borderLeft: index !== state.examRecords.length - 1 ? "1px dashed #ebebeb" : "none" }}
              >
                <div class={styles.stepIcon} />
                <div class={styles.examTime}>{dayjs(item.createTime).format("YYYY-MM-DD HH:mm:ss")}</div>
                <div class={styles.examResult}>
                  <div>
                    {" "}
                    考试结果：{item.score}分{" "}
                    <span class={[styles.resultStatus, item.passed ? styles.passed : styles.unpassed]}>
                      {item.passed ? "通过" : "未通过"}
                    </span>
                  </div>
                  <div
                    class={styles.operate}
                    onClick={() => {
                      handleAnalysis(item.id);
                    }}
                  >
                    查看解析
                  </div>
                </div>
              </div>
            );
          })}
        {!state.examRecords.length && <Empty description="暂无数据" />}
      </div>
    );
  },
});
