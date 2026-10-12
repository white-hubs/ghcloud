import { routes } from "../../router";
import { cubeGridManagementService, cubeOuaaService } from "@/api/server";

import styles from "./index.module.less";
const taskOverView = "/resource/v1/grid-management/images/entry/task-over-view.png";
import { Cell, CellGroup, Icon, showNotify } from "vant";
import { defineComponent, onMounted, reactive } from "vue";

import { CubeNavBar, EntryMenu } from "@ghcloud/cube-app-generic-component";
import { CubeAppBusinessBridge } from "@ghcloud/cube-app-js-sdk";

import { useSubPagesRouter } from "@/pages/sub-pages/sub-pages-router";

export const Entry = defineComponent({
  setup: (props, { slots }) => {
    const subPagesRouter = useSubPagesRouter();
    const state = reactive({
      statInfo: {
        totalNum: 0,
        doneTotalNum: 0,
        normalNum: 0,
        doneNormalNum: 0,
        alarmNum: 0,
        doneAlarmNum: 0,
        approveNum: 0,
        doneApproveNum: 0,
        faultOrderNum: 0,
      },
    });
    const getTaskStat = async () => {
      const user = await cubeOuaaService.getUserMine();
      const result = await cubeGridManagementService.getMyGridTodoTaskStat({
        dailyType: "GRID_MANAGE",
        userId: user.id,
      });
      state.statInfo = result;
    };
    onMounted(() => {
      getTaskStat();
    });
    const handleScanCode = async (): Promise<void> => {
      try {
        // 扫码
        const codeEntity = await CubeAppBusinessBridge.handleBusinessScanCodeToObject();
        const targetId = codeEntity?.entityId ?? "";
        const targetCategory = codeEntity?.entityType ?? "";
        if (targetId?.length > 0) {
          const base = "/apps/daily-task/h5";
          const q = new URLSearchParams({
            objectId: targetId,
            objectType: targetCategory,
            dailyType: "GRID_MANAGE",
          });
          window.location.href = `${base}#/object-tasks?${q.toString()}`;
        } else {
          showNotify({ type: "danger", message: "实体对象数据异常" });
        }
      } catch (err) {
        showNotify({ type: "danger", message: "未查询到绑定对象" });
      }
    };
    return (): JSX.Element => (
      <>
        <CubeNavBar
          title="网格管理"
          rightSlot={() => (
            <>
              <Icon name="scan" size="20" onClick={handleScanCode} />
            </>
          )}
        />
        <div class={styles["container"]}>
          <EntryMenu title="业务操作" applicationCode={__ENV__.applicationCode} routes={routes} />
          <CellGroup
            inset
            class={styles["app-group"]}
            onClick={() => {
              subPagesRouter.toTodoCenter();
            }}
          >
            <Cell title="数据看板" />
            <Cell border={false}>
              <div class={styles["task-over-view"]}>
                <div class={styles["task-over-view-title"]}>
                  <div class={styles["task-title-icon-box"]}>
                    <div class={styles["task-title-icon"]}>
                      <img src={taskOverView} alt="task-over-view" />
                    </div>
                    <span>任务总览</span>
                  </div>
                  <div class={styles["task-total"]}>
                    <span>{state.statInfo.totalNum}</span>个
                  </div>
                </div>
                <div class={styles["task-over-view-stat"]}>
                  <div class={styles["task-over-view-stat-item"]}>
                    <div class={styles["task-over-view-stat-item-title"]}>
                      全部
                      <Icon name="arrow" size={10} />
                    </div>
                    <div class={styles["task-over-view-stat-item-value"]}>
                      {state.statInfo.totalNum}
                      <span>个</span>
                    </div>
                  </div>
                  <div class={styles["task-over-view-stat-item"]}>
                    <div class={styles["task-over-view-stat-item-title"]}>
                      待处理
                      <Icon name="arrow" size={10} />
                    </div>
                    <div class={styles["task-over-view-stat-item-value"]}>
                      {state.statInfo.totalNum - state.statInfo.doneTotalNum}
                      <span>个</span>
                    </div>
                  </div>
                  <div class={styles["task-over-view-stat-item"]}>
                    <div class={styles["task-over-view-stat-item-title"]}>
                      已处理
                      <Icon name="arrow" size={10} />
                    </div>
                    <div class={styles["task-over-view-stat-item-value"]}>
                      {state.statInfo.doneTotalNum}
                      <span>个</span>
                    </div>
                  </div>
                </div>
              </div>
            </Cell>
          </CellGroup>
        </div>
      </>
    );
  },
});
