import { StandardResultItem } from "../standard-result-item/standard-result-item";
import styles from "./target-result-item.module.less";
import type { TargetResultModel, StandardResultItemModel } from "@ghcloud/cube-daily-task-service";
import { Empty } from "@ghcloud/cube-ui";
import { defineComponent, type PropType } from "vue";
export const TargetResultItem = defineComponent({
  props: {
    targetResult: {
      type: Array as PropType<TargetResultModel[]>,
      default: () => [],
    },
  },
  setup: (props) => (): JSX.Element => (
    <div class={styles.container}>
      {props.targetResult.length === 0 && <Empty description="暂无执行结果" />}
      {props.targetResult.map((item: TargetResultModel) => (
        <div class={styles["target-item-container"]} key={item.targetId}>
          <div class={styles.title}>{item.targetName}</div>
          {Array.isArray(item.standardResultList) &&
            item.standardResultList.length > 0 &&
            (Array.isArray((item.standardResultList[0] as { standardList?: unknown[] }).standardList) ? (
              item.standardResultList.map((standardItem) => (
                <StandardResultItem standardResult={(standardItem as { standardList: StandardResultItemModel[] }).standardList ?? []} />
              ))
            ) : (
              <StandardResultItem standardResult={item.standardResultList as unknown as StandardResultItemModel[]} />
            ))}
        </div>
      ))}
    </div>
  ),
});
