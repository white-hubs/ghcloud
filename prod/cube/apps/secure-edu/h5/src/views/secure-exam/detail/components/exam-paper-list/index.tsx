import { Empty, Image } from "vant";
import { computed, defineComponent, type PropType } from "vue";

import type { ExamDetailState, PaperState } from "@ghcloud/cube-secure-edu-service";

import { getAssetsFile } from "@/utils";

import styles from "./index.module.less";

type ExamPaperSummary = Pick<PaperState, "id" | "name" | "score" | "passingGradeScore">;
type ExamDetailWithLegacyPapers = ExamDetailState & {
  examPapers?: ExamPaperSummary[];
};

export const ExamPaperList = defineComponent({
  props: {
    details: {
      type: Object as PropType<ExamDetailState>,
      default: () => {},
    },
  },
  setup: (props) => {
    const examIcon = getAssetsFile("exam-icon.png");
    const paperList = computed<ExamPaperSummary[]>(() => {
      const details = props.details as ExamDetailWithLegacyPapers;

      if (details.examPapers?.length) {
        return details.examPapers;
      }

      if (details.examPaperDetails) {
        return [details.examPaperDetails];
      }

      if (details.examPaperId || details.examPaperName) {
        return [
          {
            id: details.examPaperId,
            name: details.examPaperName || "--",
            score: 0,
            passingGradeScore: 0,
          },
        ];
      }

      return [];
    });
    return (): JSX.Element => (
      <div class={styles.paperList}>
        {paperList.value.map((item) => {
          return (
            <div class={styles.paperItem} key={item.id}>
              <div class={styles.infoItem}>
                <Image src={examIcon} style={{ flexShrink: 0 }} width="46" height="46" />
                <div class={styles.itemContent}>
                  <div class={styles.title}>{item.name}</div>
                  <div class={styles.info}>
                    <span>总分：{item.score}分</span>
                    <span>及格：{item.passingGradeScore}分</span>
                    {props.details.timed && <span>时长：{props.details.examDuration}分钟</span>}
                  </div>
                </div>
              </div>
              {/* {props.details.examTaskStatus === 'IN_PROGRESS' &&
                <div class={styles.operate}>
                  <div class={styles.btn} onClick={handleStartExam}>开始考试</div>
                </div>} */}
            </div>
          );
        })}
        {!paperList.value.length && <Empty description="暂无数据" />}
      </div>
    );
  },
});
