import { Icon } from "vant";
import { defineComponent, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useExamHandleStore, HandleExamType } from "../../../exam-handle-hooks";

import styles from "./index.module.less";
export const OperateBottom = defineComponent({
  emits: ["prev", "next", "submitExam"],

  setup: (props, { emit }) => {
    const examHandleStore = useExamHandleStore();
    const route = useRoute();
    const router = useRouter();
    const state = reactive({
      actionVisible: false,
    });
    const handleOpenSheet = (): void => {
      state.actionVisible = true;
    };
    const handlePrev = (): void => {
      emit("prev");
    };
    const handleNext = (): void => {
      emit("next");
    };
    const handleClickItem = (index: number): void => {
      examHandleStore.setCurrentQuestionIndex(index);
      state.actionVisible = false;
    };
    const handleSubmit = (): void => {
      if (route.query.type === HandleExamType.STARTEXAM) {
        emit("submitExam");
      } else {
        examHandleStore.resetExamHandleState();
        router.push({
          path: "/examinationTaskList",
          query: {
            marketTenant: sessionStorage.getItem("marketTenant") || "",
            headTenant: sessionStorage.getItem("headTenant") || "",
          },
        });
      }
    };
    return (): JSX.Element => (
      <div class={styles.operateBottom}>
        <div class={styles.scantron} onClick={handleOpenSheet}>
          <Icon name="qr" size="14" />
          <span>答题卡</span>
        </div>
        <div class={styles.prev} onClick={handlePrev}>
          <Icon name="play-circle-o" size="14" />
          <span>上一题</span>
        </div>
        {examHandleStore.examHandleState.currentQuestionIndex !== examHandleStore.examHandleState.paperDetails.examQuestions.length - 1 && (
          <div class={styles.next} onClick={handleNext}>
            <Icon name="play-circle-o" size="14" />
            <span>下一题</span>
          </div>
        )}
        {examHandleStore.examHandleState.currentQuestionIndex === examHandleStore.examHandleState.paperDetails.examQuestions.length - 1 && (
          <div>
            {/* 使用该dom站位 */}
            <div class={styles.next} style={{ visibility: "hidden" }}>
              <Icon name="play-circle-o" size="14" />
              <span>下一题</span>
            </div>
            <div class={styles.submit} onClick={handleSubmit}>
              {route.query.type === HandleExamType.STARTEXAM ? "提交" : "完成"}
            </div>
          </div>
        )}

        {state.actionVisible && (
          <div
            class={styles.sheetOverlay}
            onClick={() => {
              state.actionVisible = false;
            }}
          >
            <div
              class={styles.sheetContent}
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <div class={styles.sheetTitle}>答题卡</div>
              <div class={styles.tips}>
                <div class={styles.answered}>
                  <div class={styles.icon} />
                  <span>已答</span>
                  <span>{examHandleStore.questionAnswerStateCount.value.answeredCount}</span>
                </div>
                <div class={styles.unanswered}>
                  <div class={[styles.icon, styles.unansweredIcon]} />
                  <span>未答</span>
                  <span>{examHandleStore.questionAnswerStateCount.value.unAnsweredCount}</span>
                </div>
              </div>
              <div class={styles.quesList}>
                {examHandleStore.examHandleState.paperDetails.examQuestions.map((item, index) => {
                  return (
                    <div
                      key={item.id}
                      class={[
                        styles.item,
                        item.editState && styles.checked,
                        examHandleStore.examHandleState.currentQuestionIndex === index && styles.current,
                      ]}
                      onClick={() => {
                        handleClickItem(index);
                      }}
                    >
                      {item.sort}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
});
