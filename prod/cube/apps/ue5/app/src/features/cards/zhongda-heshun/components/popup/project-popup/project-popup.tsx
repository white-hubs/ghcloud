import dayjs from "dayjs";
import { computed, defineComponent } from "vue";

import type { ProjectPageVO } from "@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto";

import { Tag } from "../../tag/tag";

import styles from "./project-popup.module.less";

interface ProjectPopupProps {
  project: ProjectPageVO;
}

/** 项目弹层 */
export const ProjectPopup = defineComponent({
  emits: ["close"],
  props: {
    project: {
      type: Object as () => ProjectPageVO,
      required: true,
    },
  },
  setup(props: ProjectPopupProps, { emit }) {
    return (): JSX.Element => {
      const handleClick = (): void => {
        emit("close");
      };
      const statusText = computed(() => {
        const statusTextMap = {
          WAITING: "待开始",
          PROCESSING: "进行中",
          COMPLETED: "已完成",
        };
        return function (status: string): string {
          return statusTextMap[status];
        };
      });
      return (
        <>
          <div class={styles["project-popup"]}>
            <div class={styles["info"]}>
              <div class={styles["title"]}>
                <div class={styles["name"]}>
                  <span>{props.project?.projectName || "--"}</span>
                  {/* @ts-ignore */}
                  <Tag type={props.project?.status || "WAITING"}>{statusText.value(props.project?.status || "WAITING")}</Tag>
                </div>
                <div class={styles["close-button"]} onClick={handleClick}></div>
              </div>
              <div class={styles["row-text"]}>
                <span class={styles["label"]}>项目类型：</span>
                <span class={styles["value"]}>{props.project?.projectTypeName || "--"}</span>
              </div>
              <div class={styles["row-text"]}>
                <span class={styles["label"]}>业主单位：</span>
                <span class={styles["value"]}>{props.project?.company || "--"}</span>
              </div>
              <div class={styles["row-text"]}>
                <span class={styles["label"]}>项目周期：</span>
                <span class={styles["value"]}>
                  {props.project?.beginTime && props.project?.endTime
                    ? `${dayjs(props.project?.beginTime).format("YYYY-MM-DD")} ~ ${dayjs(props.project?.endTime).format("YYYY-MM-DD")}`
                    : ""}
                </span>
              </div>
              <div class={styles["row-text"]}>
                <span class={styles["label"]}>项目地点：</span>
                <span class={styles["value"]}>{props.project?.disinfectionLocationName || "--"}</span>
              </div>
              <div class={styles["row-text"]}>
                <span class={styles["label"]}>负责人：</span>
                <span class={styles["value"]}>{props.project?.leaderName || "--"}</span>
              </div>
            </div>
          </div>
        </>
      );
    };
  },
});
