import { computed, defineComponent, onMounted, reactive, ref, watch, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import ModalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getDeviceBuyArea, getDeviceNumber } from "@/infrastructure/api/device";
import { setDeviceData } from "@/infrastructure/utils/common";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { buildVisualMenuTagCode, buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./environmental-device.module.less";

const deviceTotalIcon = getThemeImage("device-total.png");
const deviceOnlineIcon = getThemeImage("device-total-online.png");
const deviceOfflineIcon = getThemeImage("device-total-offline.png");

/** 对齐 security-device-count 色板 */
const colorList = ["#2B7FFF", "#4DA6FF", "#00C2E0", "#7EB8FF", "#F6C343"];

type AreaItem = {
  name: string;
  value: number;
  color: string;
  percent: number;
  areaId?: string;
};

type DeviceStatusFilter = "" | "ONLINE" | "OFFLINE";

export const EnvironmentalDevice = defineComponent({
  name: "EnvironmentalDevice",
  setup() {
    const { globalState } = useStateStore();
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const deviceModalShow = ref(false);
    const stats = reactive({
      total: 0,
      online: 0,
      offline: 0,
    });
    const areaList = ref<AreaItem[]>([]);
    const deviceParameter = reactive({
      areaId: "" as string | undefined,
      status: "" as DeviceStatusFilter,
      filterAreaIds: [] as string[],
      tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
      dateRange: [] as string[],
      deviceState: undefined as boolean | undefined,
    });

    const hasAreaData = computed(() => areaList.value.length > 0);

    const openDeviceList = (status: DeviceStatusFilter = ""): void => {
      deviceParameter.status = status;
      deviceParameter.deviceState = status === "ONLINE" ? true : status === "OFFLINE" ? false : undefined;
      deviceParameter.areaId = globalState.business.currentAreaId;
      deviceParameter.filterAreaIds = [];
      deviceParameter.tagCodes = buildVisualMenuTagCodes(globalState.business.currentMenu);
      deviceModalShow.value = true;
    };

    const openAreaDevices = (item: AreaItem): void => {
      if (!item?.name) return;
      deviceParameter.status = "";
      deviceParameter.deviceState = undefined;
      deviceParameter.tagCodes = buildVisualMenuTagCodes(globalState.business.currentMenu);
      if (item.name === "其他") {
        deviceParameter.areaId = undefined;
        deviceParameter.filterAreaIds = areaList.value.map((row) => row.areaId).filter((id): id is string => Boolean(id));
      } else {
        deviceParameter.areaId = item.areaId || areaList.value.find((row) => row.name === item.name)?.areaId;
        deviceParameter.filterAreaIds = [];
      }
      deviceModalShow.value = true;
    };

    const loadData = async (): Promise<void> => {
      try {
        const data = await getDeviceNumber({
          tagCodes: buildVisualMenuTagCode(globalState.business.currentMenu),
          areaId: globalState.business.currentAreaId,
        });
        stats.total = Number(data?.totalNumber) || 0;
        stats.offline = Number(data?.offlineNumber) || 0;
        stats.online = Number(data?.normalNumber) || 0;

        const res = await getDeviceBuyArea({
          tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
          areaLevel: globalState.business.currentAreaLeave + 1,
        });
        const rows = setDeviceData(Array.isArray(res) ? res : [], colorList) as Array<{
          name: string;
          value: number;
          color: string;
          areaId?: string;
        }>;
        const sum = rows.reduce((acc, item) => acc + (Number(item.value) || 0), 0) || stats.total || 1;
        areaList.value = rows.map((item) => ({
          ...item,
          value: Number(item.value) || 0,
          percent: Math.round(((Number(item.value) || 0) / sum) * 1000) / 10,
        }));
      } catch {
        stats.total = 0;
        stats.online = 0;
        stats.offline = 0;
        areaList.value = [];
      } finally {
        loaded.value = true;
      }
    };

    watch(
      () => globalState.business.currentAreaId,
      () => {
        void loadData();
      },
    );

    onMounted(() => {
      void loadData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={styles.statsRow}>
          <button type="button" class={[styles.statCard, styles.isTotal, styles.isClickable]} onClick={() => openDeviceList("")}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={deviceTotalIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>设备总数</span>
              <span class={styles.statValue}>
                <CountTo startVal={0} endVal={stats.total} separator="" duration={1600} />
              </span>
            </span>
          </button>
          <button type="button" class={[styles.statCard, styles.isOnline, styles.isClickable]} onClick={() => openDeviceList("ONLINE")}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={deviceOnlineIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>在线设备</span>
              <span class={[styles.statValue, styles.isOnlineValue]}>
                <CountTo startVal={0} endVal={stats.online} separator="" duration={1600} />
              </span>
            </span>
          </button>
          <button type="button" class={[styles.statCard, styles.isOffline, styles.isClickable]} onClick={() => openDeviceList("OFFLINE")}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={deviceOfflineIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>离线设备</span>
              <span class={[styles.statValue, styles.isOfflineValue]}>
                <CountTo startVal={0} endVal={stats.offline} separator="" duration={1600} />
              </span>
            </span>
          </button>
        </div>

        <div class={[styles.analysisSurface, loaded.value && !hasAreaData.value ? styles.isEmpty : ""]}>
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : !hasAreaData.value ? (
            <NoData />
          ) : (
            <>
              <div class={styles.chartWrap}>
                <ElevatorAnalysisPie pieData={areaList.value}>
                  <div class={[styles.pieCenter, styles.isClickable]} onClick={() => openDeviceList("")}>
                    <div class={styles.pieCenterValue}>
                      <CountTo startVal={0} endVal={stats.total} separator="" duration={1600} />
                    </div>
                    <div class={styles.pieCenterLabel}>设备总数</div>
                  </div>
                </ElevatorAnalysisPie>
              </div>
              <div class={styles.genreList}>
                {areaList.value.map((item, index) => (
                  <button
                    type="button"
                    class={[styles.genreItem, styles.isClickable]}
                    key={`${isZoom ? "zoom-" : ""}${item.name}-${index}`}
                    onClick={() => openAreaDevices(item)}
                  >
                    <span class={styles.genreName}>
                      <i class={styles.genreColor} style={{ background: item.color }} />
                      <span class={styles.genreNameText} title={item.name}>
                        {item.name}
                      </span>
                    </span>
                    <span class={styles.genreCount}>
                      {item.value}
                      <em class={styles.genreUnit}>个</em>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="动环设备"
            class="visual-v2-sub-panel v2-panel-card environmental-device-v2-panel"
            zoomable
            zoom-title="动环设备详情"
            zoom-width={900}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="overview-device" />,
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalEquipmentAllTable
          showModal={deviceModalShow.value}
          onClose={() => {
            deviceModalShow.value = false;
          }}
          parameter={deviceParameter}
        />
      </>
    );
  },
});

export default EnvironmentalDevice;
