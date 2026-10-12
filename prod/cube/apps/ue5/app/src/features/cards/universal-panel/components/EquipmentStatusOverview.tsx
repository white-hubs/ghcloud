import { computed, defineComponent, onMounted, reactive, ref, provide } from "vue";

import UniversalPanelCardIcon from "../_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS, universalPanelZoomClass } from "../_shared/universal-panel-v2";
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
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "../_shared/universal-panel-v2-shared.less";

import styles from "./EquipmentStatusOverview.module.less";

const deviceTotalIcon = getThemeImage("device-total.png");
const deviceTotalOnlineIcon = getThemeImage("device-total-online.png");
const deviceTotalOfflineIcon = getThemeImage("device-total-offline.png");

type PieDataItem = {
  name: string;
  value: number;
  color: string;
  areaId?: string;
};

type StatCardItem = {
  label: string;
  value: number;
  cardClass: string;
  iconSrc: string;
  valueClass: string;
  deviceState?: boolean;
};

/**
 * 设备状态总览：布局对齐 public-security-device-count（顶部三指标 + 区域环图图例）。
 * 客流页标题为「设备状态」时走紧凑模式，仅保留顶部指标卡。
 */
export const EquipmentStatusOverview = defineComponent({
  name: "EquipmentStatusOverview",
  props: {
    title: { type: String, required: false, default: "设备状态总览" },
  },
  setup(props) {
    const { globalState } = useStateStore();
    const { currentTheme } = useVisualTheme();
    const { getEquipmentNumber } = useCommon();
    const isCompactDeviceStatus = computed(() => props.title === "设备状态");
    const isMinimalWhite = computed(() => currentTheme.value === "minimal-white");
    // 与「设备统计」一致：外装饰环 + 刻度 + 数据环，极简白也保留背景轨
    const pieRingVariant = computed(() => "default" as const);

    const colors = ["#2B7FFF", "#4DA6FF", "#00C2E0", "#7EB8FF", "#B5D4FF"];
    const pieData = ref<PieDataItem[]>([]);
    const deviceTotal = ref(0);
    const onlineCount = ref(0);
    const offlineCount = ref(0);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const deviceModalShow = ref(false);
    const deviceParameter = reactive({
      anyAreaId: undefined as string | undefined,
      deviceState: undefined as boolean | undefined,
      filterAreaIds: [] as string[],
      tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
      areaId: undefined as string | undefined,
      dateRange: [] as string[],
    });

    const hasDeviceData = computed(
      () => deviceTotal.value > 0 || onlineCount.value > 0 || offlineCount.value > 0 || pieData.value.some((item) => item.value > 0),
    );

    const statCards = computed<StatCardItem[]>(() => [
      {
        label: "设备总数",
        value: deviceTotal.value,
        cardClass: styles.isTotal,
        iconSrc: deviceTotalIcon,
        valueClass: "",
        deviceState: undefined,
      },
      {
        label: "在线设备",
        value: onlineCount.value,
        cardClass: styles.isOnline,
        iconSrc: deviceTotalOnlineIcon,
        valueClass: styles.isOnlineValue,
        deviceState: true,
      },
      {
        label: "离线设备",
        value: offlineCount.value,
        cardClass: styles.isOffline,
        iconSrc: deviceTotalOfflineIcon,
        valueClass: styles.isOfflineValue,
        deviceState: false,
      },
    ]);

    const getEquipmentInfo = async (): Promise<void> => {
      loaded.value = false;
      pieData.value = [];
      deviceTotal.value = 0;
      onlineCount.value = 0;
      offlineCount.value = 0;

      const tagCode = buildVisualMenuTagCode(globalState.business.currentMenu);
      try {
        const [countRes, areaRes, legacyRes] = await Promise.all([
          getDeviceNumber({ tagCodes: tagCode }).catch(() => undefined),
          getDeviceBuyArea({
            tagCodes: [tagCode],
            areaLevel: globalState.business.currentAreaLeave,
          }).catch(() => []),
          getEquipmentNumber().catch(() => undefined),
        ]);

        if (countRes) {
          deviceTotal.value = Number(countRes.totalNumber) || 0;
          onlineCount.value = Number(countRes.normalNumber) || 0;
          offlineCount.value = Number(countRes.offlineNumber) || 0;
        } else if (legacyRes?.deviceNum) {
          deviceTotal.value = Number(legacyRes.deviceNum) || 0;
          const statusNums = legacyRes.deviceStatusNums ?? [];
          onlineCount.value = Number(statusNums.find((item: { name: string }) => item.name === "NORMAL")?.num) || 0;
          offlineCount.value = Number(statusNums.find((item: { name: string }) => item.name === "OFFLINE")?.num) || 0;
        }

        pieData.value = setDeviceData(Array.isArray(areaRes) ? areaRes : [], colors);
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getEquipmentInfo();
    });

    const openDeviceList = (options?: { deviceState?: boolean; anyAreaId?: string; filterAreaIds?: string[] }): void => {
      Object.assign(deviceParameter, {
        deviceState: options?.deviceState,
        anyAreaId: options?.anyAreaId,
        filterAreaIds: options?.filterAreaIds ?? [],
        tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
        areaId: options?.anyAreaId ? undefined : globalState.business.currentAreaId,
      });
      deviceModalShow.value = true;
    };

    const closeDeviceList = (): void => {
      deviceModalShow.value = false;
    };

    const onStatClick = (item: StatCardItem): void => {
      openDeviceList({
        deviceState: item.deviceState,
        anyAreaId: globalState.business.currentAreaId,
      });
    };

    const onPieLegendClick = (value?: { name: string }): void => {
      if (!value?.name) {
        return;
      }
      if (value.name === "其他") {
        openDeviceList({
          filterAreaIds: pieData.value.map((item) => item.areaId).filter(Boolean) as string[],
        });
        return;
      }
      const findItem = pieData.value.find((item) => item.name === value.name);
      if (findItem?.areaId) {
        openDeviceList({ anyAreaId: findItem.areaId });
      }
    };

    const renderStatsRow = (isZoom: boolean): JSX.Element => (
      <div class={[styles.statsRow, isZoom ? styles.isZoom : ""]} data-no-zoom>
        {statCards.value.map((item) => (
          <button
            type="button"
            class={[styles.statCard, item.cardClass]}
            key={`${isZoom ? "zoom-" : ""}${item.label}`}
            onClick={() => onStatClick(item)}
          >
            <span class={styles.statIcon} aria-hidden="true">
              <img src={item.iconSrc} alt="" class={styles.statIconImg} />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>{item.label}</span>
              <span class={styles.statValueRow}>
                <span class={[styles.statValue, item.valueClass]}>
                  <CountTo startVal={0} endVal={item.value} separator="" duration={2000} />
                </span>
                <span class={styles.statUnit}>台</span>
              </span>
            </span>
          </button>
        ))}
      </div>
    );

    const renderChartRow = (isZoom: boolean): JSX.Element => (
      <div class={[styles.chartRow, isZoom ? styles.isZoom : "", isMinimalWhite.value ? styles.isCleanRing : ""]} data-no-zoom>
        <div class={[styles.chartPieWrap, isZoom ? styles.isZoom : ""]}>
          <ElevatorAnalysisPie
            class={styles.pieChart}
            radius={isMinimalWhite.value ? "78" : "75"}
            ringVariant={pieRingVariant.value}
            pieData={pieData.value}
            onClickbar={onPieLegendClick}
            v-slots={{
              default: () => (
                <>
                  <div class={styles.pieCenterValue}>
                    <CountTo startVal={0} endVal={deviceTotal.value} separator="" duration={2000} />
                  </div>
                  <div class={styles.pieCenterLabel}>设备总数</div>
                </>
              ),
            }}
          />
        </div>
        <div class={[styles.legendList, isZoom ? styles.isZoom : ""]}>
          {pieData.value.map((item) => (
            <button
              type="button"
              class={styles.legendItem}
              key={`${isZoom ? "zoom-" : ""}${item.name}`}
              onClick={() => onPieLegendClick(item)}
            >
              <span class={styles.legendLeft}>
                <span class={styles.legendColor} style={{ background: item.color }} />
                <span class={styles.legendName} title={item.name}>
                  {item.name}
                </span>
              </span>
              <span class={styles.legendValue}>{item.value}台</span>
            </button>
          ))}
        </div>
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        class={[
          "up-card-body",
          styles.body,
          isZoom ? styles.isZoom : "",
          isCompactDeviceStatus.value ? styles.isCompact : "",
          ...(isZoom ? universalPanelZoomClass : []),
        ]}
        data-no-zoom
      >
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : !hasDeviceData.value ? (
          <div class={["up-empty", styles.empty]}>
            <NoData />
          </div>
        ) : (
          <>
            {renderStatsRow(isZoom)}
            {!isCompactDeviceStatus.value || isZoom ? renderChartRow(isZoom) : null}
          </>
        )}
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title={props.title}
            class={`${UNIVERSAL_PANEL_V2_CLASS} equipment-status-overview-v2-panel${isCompactDeviceStatus.value ? " is-compact-device-status" : ""}`}
            zoomable
            zoom-title={`${props.title}详情`}
            zoom-width={720}
            v-slots={{
              titleIcon: () => <UniversalPanelCardIcon name="device" />,
              default: () => renderBody(false),
              "zoom-content": () => <div class={styles.zoomContent}>{renderBody(true)}</div>,
            }}
          />
        </div>
        <ModalEquipmentAllTable showModal={deviceModalShow.value} onClose={closeDeviceList} parameter={deviceParameter} />
      </>
    );
  },
});

export default EquipmentStatusOverview;
