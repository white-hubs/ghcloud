import { ResultItem } from "../result-item/result-item";
import styles from "./standard-result-item.module.less";
import type { StandardResultItemModel } from "@ghcloud/cube-daily-task-service";
import { Empty } from "@ghcloud/cube-ui";
import { defineComponent, type PropType } from "vue";
export const StandardResultItem = defineComponent({
  props: {
    standardResult: {
      type: Array as PropType<StandardResultItemModel[]>,
      default: () => [],
    },
  },
  setup: (props) => (): JSX.Element => (
    <div class={styles.container}>
      {(!Array.isArray(props.standardResult) || props.standardResult.length === 0) && <Empty description="暂无执行结果" />}
      {Array.isArray(props.standardResult) &&
        props.standardResult.map((item) => (
          <div class={styles["item-container"]} key={item.standardId}>
            <div class={styles.title}>{item.standardName}</div>
            <ResultItem patrolResult={item.itemList ?? []} />
          </div>
        ))}
    </div>
  ),
});
