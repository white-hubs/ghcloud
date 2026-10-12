import { useGridState } from "../../../grid-info-store";
import styles from "./index.module.less";
import { cubeGridManagementService } from "@/api/server";
const GM_IMG = '/resource/v1/grid-management/images/grid-list';
const assetIcon = `${GM_IMG}/asset-icon.png`;
const bluePhoneIcon = `${GM_IMG}/blue-phone-icon.png`;
const deviceIcon = `${GM_IMG}/device-icon.png`;
const gearIcon = `${GM_IMG}/gear-icon.png`;
const patrolIcon = `${GM_IMG}/patrol-icon.png`;
const pointIcon = `${GM_IMG}/point-icon.png`;
const smallProjectIcon = `${GM_IMG}/small-project-icon.png`;
import { useSubPagesRouter } from "@/pages/sub-pages/sub-pages-router";
import { defineComponent, onMounted, reactive } from "vue";

export const BasicInfoUI = defineComponent({
  setup: () => {
    const subPagesRouter = useSubPagesRouter();
    const state = reactive({
      gridSubordinateStat: {
        deviceCount: 0,
        patrolLocationCount: 0,
        propertyCount: 0,
        scenePointCount: 0,
        stallCount: 0,
        smallCount: 0,
      },
    });
    const gridState = useGridState();
    const subordinateEntityList: {
      icon: string;
      title: string;
      key: keyof typeof state.gridSubordinateStat;
      onClick?: () => void;
    }[] = [
      {
        icon: gearIcon,
        title: "档位",
        key: "stallCount",
        onClick: () => subPagesRouter.toStallList(gridState.getGridInfo().gridAreaId),
      },
      {
        icon: deviceIcon,
        title: "设备",
        key: "deviceCount",
        onClick: () => subPagesRouter.toDeviceList(gridState.getGridInfo().gridAreaId),
      },
      {
        icon: assetIcon,
        title: "资产",
        key: "propertyCount",
        onClick: () => subPagesRouter.toAssetList(gridState.getGridInfo().gridAreaId),
      },
      {
        icon: pointIcon,
        title: "现场点",
        key: "scenePointCount",
        onClick: () => subPagesRouter.toSitePointList(gridState.getGridInfo().gridAreaId),
      },
      {
        icon: patrolIcon,
        title: "巡更点",
        key: "patrolLocationCount",
        onClick: () => subPagesRouter.toPatrolPointList(gridState.getGridInfo().gridAreaId),
      },
      {
        icon: smallProjectIcon,
        title: "小散工程",
        key: "smallCount",
      },
    ];
    const getObjectStat = async () => {
      const result = await cubeGridManagementService.getGridAreaObjectCountStat({ gridAreaIds: [gridState.getGridInfo().gridAreaId] });
      if (!result[0]) {
        return;
      }
      // 只有一项！
      const stat = result[0];
      state.gridSubordinateStat = {
        deviceCount: stat.deviceCount,
        patrolLocationCount: stat.patrolLocationCount,
        propertyCount: stat.propertyCount,
        scenePointCount: stat.scenePointCount,
        stallCount: stat.stallCount,
        smallCount: 0,
      };
    };

    onMounted(() => {
      getObjectStat();
    });
    return (): JSX.Element => (
      <div class={styles["basic"]}>
        {gridState.getGridInfo().gridManagers.map((item) => (
          <div class={styles["center-user-card"]} key={item.gridManagerId}>
            <div class={styles["user"]}>
              <div class={styles["name"]}>{item.gridManagerName}（网格长）</div>
              <div>{gridState.getGridInfo().gridName}</div>
            </div>
            <div class={styles["phone-icon"]}>
              <img src={bluePhoneIcon} alt="" srcset="" />
            </div>
          </div>
        ))}

        <div class={styles["grid-card"]}>
          <div class={styles["grid-title"]}>网格下属</div>
          <div class={styles["grid-list"]}>
            {subordinateEntityList.map((item) => (
              <div class={styles["grid-item"]} key={item.key} onClick={() => item.onClick?.()}>
                <img src={item.icon} alt="" />
                <div class={styles["item-stat"]}>
                  <div class={styles["stat-value"]}>{item.key in state.gridSubordinateStat ? state.gridSubordinateStat[item.key] : 0}</div>
                  <div class={styles["stat-label"]}>{item.title}</div>
                </div>
              </div>
            ))}

            {/* <div class={styles["grid-item"]}>
              <img src={gearIcon} alt="" />
              <div class={styles["item-stat"]}>
                <div class={styles["stat-value"]}>33</div>
                <div class={styles["stat-label"]}>资产</div>
              </div>
            </div>
            <div class={styles["grid-item"]}>
              <img src={gearIcon} alt="" />
              <div class={styles["item-stat"]}>
                <div class={styles["stat-value"]}>33</div>
                <div class={styles["stat-label"]}>设备</div>
              </div>
            </div>
            <div class={styles["grid-item"]}>
              <img src={gearIcon} alt="" />
              <div class={styles["item-stat"]}>
                <div class={styles["stat-value"]}>33</div>
                <div class={styles["stat-label"]}>巡更点</div>
              </div>
            </div>
            <div class={styles["grid-item"]}>
              <img src={gearIcon} alt="" />
              <div class={styles["item-stat"]}>
                <div class={styles["stat-value"]}>33</div>
                <div class={styles["stat-label"]}>现场点</div>
              </div>
            </div>
            <div class={styles["grid-item"]}>
              <img src={gearIcon} alt="" />
              <div class={styles["item-stat"]}>
                <div class={styles["stat-value"]}>33</div>
                <div class={styles["stat-label"]}>小散工程</div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    );
  },
});
