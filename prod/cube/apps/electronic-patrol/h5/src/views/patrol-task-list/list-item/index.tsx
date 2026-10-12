import { stateMapVo } from "../constant";
import styles from "./index.module.less";
import { cubeElectronPatrolService } from "@/api/server";
import { getAssetsFile } from "@/utils";
import type { ElectronTaskVo } from "@ghcloud/cube-electronic-patrol-service";
import dayjs from "dayjs";
import { showNotify } from "vant";
import { defineComponent, type PropType } from "vue";
import { useRouter } from "vue-router";
export const ListItem = defineComponent({
  props: {
    taskVo: {
      type: Object as PropType<ElectronTaskVo>,
      default: () => {},
    },
  },
  emits: ["getList"],
  setup: (props, { emit }) => {
    const abnormalIcon = getAssetsFile("ic_abnormal.png");
    const router = useRouter();
    const handleClick = (): void => {
      router.push({
        path: "/patrol-task-detail",
        query: {
          taskId: props.taskVo.id,
        },
      });
    };
    const handleTransfer = (e: Event): void => {
      e.stopPropagation();
      router.push({
        path: "/patrol-task-transfer",
        query: {
          taskId: props.taskVo.id,
        },
      });
    };
    const handleDispatch = (e: Event): void => {
      e.stopPropagation();
      router.push({
        path: "/patrol-task-dispatch",
        query: {
          id: props.taskVo.id,
        },
      });
    };
    const handleAddCollaborator = (e: Event): void => {
      e.stopPropagation();
      router.push({
        path: "/patrol-task-collaboration",
        query: {
          taskId: props.taskVo.id,
          cooperateUsers: props.taskVo.assistIds,
        },
      });
    };
    const handleReceive = async (e: Event): Promise<void> => {
      e.stopPropagation();
      const nowTime = new Date().getTime();
      if (nowTime < props.taskVo.startDate) {
        showNotify({
          type: "danger",
          message: "当前时间未在任务时间范围",
        });
        return;
      }
      if (nowTime > props.taskVo.endDate) {
        showNotify({
          type: "danger",
          message: "当前时间未在任务时间范围",
        });
        return;
      }
      try {
        await cubeElectronPatrolService.receiveElectronTask({
          taskId: props.taskVo.id,
        });
        emit("getList");
        showNotify({
          type: "success",
          message: "接收成功",
        });
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
      }
    };
    return (): JSX.Element => (
      <div class={styles.cardItem} onClick={handleClick}>
        <div class={styles["card-top"]}>
          <div class={[styles["card-status"], styles[props.taskVo.status]]}>{stateMapVo[props.taskVo.status]}</div>
          <div class={styles["card-title"]}>{props.taskVo.taskName}</div>
          <div class={styles["card-time"]}>{dayjs(props.taskVo.publisherTime).format("YYYY-MM-DD")}</div>
        </div>
        <div class={styles["card-content"]}>
          {props.taskVo.result === "ABNORMAL" && abnormalIcon && <img class={styles.abnormalIcon} src={abnormalIcon} alt="" srcset="" />}
          <div class={styles.row}>
            <div class={styles["content-item"]}>
              <div class={styles["item-title"]}>巡更时间：</div>
              <div class={styles["item-value"]}>{props.taskVo.executeData}</div>
            </div>
            {/* <div class={styles['content-item']}>
              <div class={styles['item-title']}>巡更点数：</div>
              <div class={styles['item-value']}>{props.taskVo.patrolLocationNum}</div>
            </div> */}
            <div class={styles["content-item"]}>
              <div class={styles["item-title"]}>发布部门：</div>
              <div class={styles["item-value"]}>{props.taskVo.publisherDepName}</div>
            </div>
          </div>
          <div class={styles.row}>
            <div class={styles["content-item"]}>
              <div class={styles["item-title"]}>发布人：</div>
              <div class={styles["item-value"]}>{props.taskVo.publisherName}</div>
            </div>
            <div class={styles["content-item"]}>
              <div class={styles["item-title"]}>巡更人员：</div>
              <div class={styles["item-value"]}>{props.taskVo.userName}</div>
            </div>
          </div>
        </div>
        {props.taskVo.status === "IN_EXECUTION" && (
          <div class={styles["card-footer"]}>
            {props.taskVo.distribution && (
              <div class={[styles["footer-item"], styles.transfer]} onClick={handleDispatch}>
                分发
              </div>
            )}
            {props.taskVo.loginBelonger && (
              <div class={[styles["footer-item"], styles.transfer]} onClick={handleTransfer}>
                移交
              </div>
            )}
            {props.taskVo.loginBelonger && (
              <div class={styles["footer-item"]} onClick={handleAddCollaborator}>
                添加协同
              </div>
            )}
            {props.taskVo.loginBelonger && (
              <div class={styles["footer-item"]} onClick={handleClick}>
                巡更
              </div>
            )}
          </div>
        )}
        {props.taskVo.status === "TO_BE_RECEIVED" && (
          <div class={styles["card-footer"]}>
            <div class={[styles["footer-item"], styles.transfer]} onClick={handleReceive}>
              接收
            </div>
          </div>
        )}
      </div>
    );
  },
});
