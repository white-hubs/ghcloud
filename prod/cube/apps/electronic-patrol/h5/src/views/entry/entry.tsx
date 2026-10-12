import { Icon, showNotify } from "vant";
import { defineComponent, onMounted } from "vue";
import { useRouter } from "vue-router";

import { CubeNavBar, EntryMenu } from "@ghcloud/cube-app-generic-component";
import { CubeAppBusinessBridge } from "@ghcloud/cube-app-js-sdk";

import { PatrolStatistics } from "./cards/patrol-statistics/patrol-statistics";
import { cubeElectronPatrolService, cubeOuaaService } from "@/api/server";
import { usePatrolStore, handleStorePatrolPoint } from "@/custom-store/use-patrol-store";
import { routes } from "@/router";
import { updatePatrolLocationIfAbsent } from "@/utils/update-patrol-location";

import styles from "./entry.module.less";
/** 入口页面 */
export const Entry = defineComponent({
  name: "Entry",
  setup: () => {
    const patrolStore = usePatrolStore();
    const router = useRouter();
    document.title = "电子巡更";
    onMounted(async () => {
      handleSetUserInfo();
    });
    const handleSetUserInfo = async (): Promise<void> => {
      const { id, name } = await cubeOuaaService.getUserMine();
      patrolStore.setPatrolUser({
        id,
        name,
      });
    };
    const handleScanCode = async (): Promise<void> => {
      try {
        // 扫码
        const codeEntity = await CubeAppBusinessBridge.handleBusinessScanCodeToObject();
        const targetId = codeEntity?.entityId ?? "";
        if (!targetId) {
          showNotify({ type: "danger", message: "未查询到绑定对象" });
          return;
        }
        const result = await cubeElectronPatrolService.getElectronTaskByLocationId({
          locationId: targetId,
        });
        if (!result) {
          showNotify({ type: "danger", message: "未查询到执行中的巡更任务!" });
          return;
        }
        if (result.isPatrol) {
          showNotify({ type: "danger", message: "已巡更过此点位!" });
          return;
        }
        void updatePatrolLocationIfAbsent(result.locationId || targetId);
        handleStorePatrolPoint(result);

        router.push({
          path: "/patrol-result",
          query: {
            backCount: 1,
            targetId: result.locationId,
            targetName: result.locationName,
          },
        });
      } catch {
        showNotify({ type: "danger", message: "未查询到绑定对象" });
      }
    };
    return (): JSX.Element => (
      <>
        <CubeNavBar
          showBack
          title="电子巡更"
          rightSlot={() => (
            <>
              <Icon name="scan" size="20" onClick={handleScanCode} />
            </>
          )}
        />
        <div class={styles.container}>
          <EntryMenu title="业务操作" applicationCode={__ENV__.applicationCode} routes={routes} />
          {/* <SecurityMonitor /> */}
          <PatrolStatistics />
        </div>
      </>
    );
  },
});
