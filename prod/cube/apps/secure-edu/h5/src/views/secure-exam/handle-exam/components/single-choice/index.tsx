import { computed, defineComponent, type PropType } from "vue";
import { useRoute } from "vue-router";

import type { ExamQuestion, QuestionOptionState } from "@ghcloud/cube-secure-edu-service";

import { HandleExamType, useExamHandleStore } from "../../../exam-handle-hooks";

import styles from "./index.module.less";

export const SingleChoice = defineComponent({
  props: {
    questionEntity: {
      type: Object as PropType<ExamQuestion>,
      default: () => {},
    },
  },
  setup: (props) => {
    const route = useRoute();
    const examHandleStore = useExamHandleStore();
    const isStartExam = computed(() => route.query.type === HandleExamType.STARTEXAM);
    const options = computed<QuestionOptionState[]>(
      () => JSON.parse(props.questionEntity.questionContent || "[]") as QuestionOptionState[],
    );
    const realAnswer = computed(() => options.value.filter((item) => item.isRight).map((item) => item.optionID));
    const checkedAnswer = computed(() => options.value.filter((item) => item.isCheck).map((item) => item.optionID));

    const updateQuestion = (nextOptions: QuestionOptionState[]): void => {
      const selected = nextOptions.find((item) => item.isCheck)?.optionID ?? "";
      const questionIndex = examHandleStore.examHandleState.paperDetails.examQuestions.findIndex(
        (item) => item.id === props.questionEntity.id,
      );
      if (questionIndex === -1) {
        return;
      }
      examHandleStore.examHandleState.paperDetails.examQuestions.splice(questionIndex, 1, {
        ...props.questionEntity,
        editState: true,
        answerState: realAnswer.value.includes(selected),
        questionContent: JSON.stringify(nextOptions),
      });
    };

    const handleSelect = (optionID: string): void => {
      if (!isStartExam.value) {
        return;
      }
      updateQuestion(
        options.value.map((item) => ({
          ...item,
          isCheck: item.optionID === optionID,
        })),
      );
    };

    const getOptionClass = (item: QuestionOptionState): Array<string | false> => {
      const selected = item.isCheck;
      const analysis = !isStartExam.value;
      return [
        styles.option,
        selected && styles.selected,
        analysis && item.isRight && styles.right,
        analysis && selected && !item.isRight && styles.wrong,
      ];
    };

    return (): JSX.Element => (
      <div class={styles.singleChoice}>
        <div class={styles.title}>
          {props.questionEntity.sort}. {props.questionEntity.name}
        </div>
        <div class={styles.options}>
          {options.value.map((item) => (
            <button key={item.optionID} class={getOptionClass(item)} type="button" onClick={() => handleSelect(item.optionID)}>
              <span class={styles.checkIcon} />
              <span class={styles.optionId}>{item.optionID}</span>
              <span class={styles.optionText}>{item.optionTitle}</span>
            </button>
          ))}
        </div>
        {!isStartExam.value && (
          <div class={styles.answerAnalysis}>
            <div class={styles.answer} style={{ color: "#39B54A" }}>
              正确答案：{realAnswer.value.join("、")}
            </div>
            <div class={styles.answer}>我的答案：{checkedAnswer.value.join("、") || "未作答"}</div>
            <div class={styles.answer}>解析：{props.questionEntity.answerAnalysis}</div>
          </div>
        )}
      </div>
    );
  },
});
