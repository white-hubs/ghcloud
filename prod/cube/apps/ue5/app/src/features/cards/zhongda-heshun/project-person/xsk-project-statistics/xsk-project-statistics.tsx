import { type VNode, defineComponent, ref, onMounted } from "vue";

import { ProgressBar } from "@/features/cards/zhongda-heshun/components/progress-bar/progress-bar";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";

import styles from "./xsk-project-statistics.module.less";
const IconUser = "/resource/v1/ue5-migrate/components/businessPanel/zhongda-heshun/assets/svg/user.svg";
import { Skeleton } from "ant-design-vue";

import type { UserInfo } from "@ghcloud/cube-ouaa-service/src/ouaa.service";
import type { ProjectStatisticsBaseVO } from "@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto";

import { closePersonModal, openPersonModal } from "@/features/cards/zhongda-heshun/components/person-modal/person-modal";
import { createUserMarker } from "@/features/cards/zhongda-heshun/utils/gis-helper";
import { createPersonModal } from "@/features/cards/zhongda-heshun/utils/modal-helper";
import { cubeZDDataVizService } from "@/infrastructure/api/service";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { clearMap } from "@/visualization-core/event/register/gis";

/** 项目统计 */

export const XSKProjectStatistics = defineComponent({
  setup() {
    const dataList = ref<ProjectStatisticsBaseVO[]>([]);
    const total = ref(0);
    const loading = ref(false);
    const getData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res = await cubeZDDataVizService.getPersonnelDepartment();
        if (res) {
          dataList.value = res ?? [];
          total.value = res.reduce((acc, cur) => acc + cur.number, 0);
        }
      } catch {
      } finally {
        setTimeout(() => {
          loading.value = false;
        }, 500);
      }
    };
    onMounted(() => {
      clearMap();
      getData();

      // clearClusteredMarkers()
      // showPersonMarker()
      // showProjectMarker()
    });
    const handleCurrent = async (item: { label: string; value: number }): Promise<void> => {
      const deptId = dataList.value.find((e) => e.keyName === item.label)?.keyId || "";
      let doCloseCallBack = true;
      await openPersonModal({
        title: "人员统计",
        data: { ...item, deptId: deptId },
        onClose: () => {
          // doCloseCallBack && restoreTheInitialStateOfTheMap()
        },
        onLocate: (data) => {
          doCloseCallBack = false;
          clearMap();
          createUserMarker(data as unknown as UserInfo, undefined, true);

          closePersonModal();
        },
      });
    };
    const handleTotalClick = async (): Promise<void> => {
      createPersonModal("人员情况");
    };
    return (): VNode => (
      <SubPanelTemplate titleFontSize="22px">
        <Skeleton loading={loading.value} active>
          <div class={styles["user-static"]} onClick={handleTotalClick}>
            <div class={styles["label"]}>
              <img src={IconUser} />
              人员总数
            </div>
            <div class={styles["value"]}>
              <CountTo
                startVal={0}
                endVal={total.value}
                duration={2000}
                separator=""
                style="color: #fff; text-align: center; font-size: 22px;"
              ></CountTo>
              <span class={styles["unit"]}>人</span>
            </div>
          </div>
          <div class={styles.scroll}>
            {dataList.value?.length === 0 && <NoData />}
            {dataList.value.map((item) => (
              <div class={styles.item} key={item.keyName}>
                <ProgressBar total={total.value} label={item.keyName} value={item.number} onClick={handleCurrent} />
              </div>
            ))}
          </div>
        </Skeleton>
      </SubPanelTemplate>
    );
  },
});
