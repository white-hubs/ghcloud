import { defineComponent, type PropType } from "vue";

import type { StandardItemResultModel } from "@ghcloud/cube-daily-task-service";
import { ImagePreviewGroup, Image, Empty } from "@ghcloud/cube-ui";

import styles from "./result-item.module.less";
export const ResultItem = defineComponent({
  props: {
    patrolResult: {
      type: Array as PropType<StandardItemResultModel[]>,
      default: () => [],
    },
  },
  setup: (props) => (): JSX.Element => (
    <div class={styles.container}>
      {(!Array.isArray(props.patrolResult) || props.patrolResult.length === 0) && <Empty description="暂无执行结果" />}
      {Array.isArray(props.patrolResult) &&
        props.patrolResult.map((ele, index) => (
          <div class={styles["result-item"]} key={ele.itemId}>
            <div class={styles["result-item-list"]}>
              <div class={styles["result-item"]}>
                <div class={styles["first-index"]}> {index + 1}、</div>
                <div class={styles["item-content"]}>
                  <div>
                    <label>{ele.itemName}:</label>{" "}
                    <span class={ele.errorFlag ? styles["error-value"] : styles["normal-value"]}>{ele.resultName}</span>
                  </div>
                  <div>
                    <label>描述信息:</label> <span>{ele.remark || "--"}</span>
                  </div>
                  {Array.isArray(ele.fileList) && ele.fileList.length > 0 && (
                    <ImagePreviewGroup>
                      {ele.fileList.map((file) => (
                        <Image key={file.id} src={file.path} style={{ width: "100px", height: "100px" }} width={100} height={100} />
                      ))}
                    </ImagePreviewGroup>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  ),
});
