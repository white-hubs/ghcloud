import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch, provide } from "vue";

import UniversalPanelCardIcon from "@/features/cards/universal-panel/_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS, universalPanelZoomClass } from "@/features/cards/universal-panel/_shared/universal-panel-v2";
import ModalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "@/features/cards/universal-panel/_shared/universal-panel-v2-shared.less";

import styles from "./device-status-distribution.module.less";

const STATUS_LABEL: Record<string, string> = {
  ALARM: "报警",
  TROUBLE: "故障",
  OFFLINE: "离线",
  NORMAL: "正常",
};

const STATUS_COLOR: Record<string, string> = {
  NORMAL: "#00f27b",
  OFFLINE: "#ffab10",
  ALARM: "#f14545",
  TROUBLE: "#ffc700",
};

const FALLBACK_COLORS = ["#2f8dff", "#19f8f7", "#ffc700", "#ef424a"];

type StatusItem = {
  key: string;
  name: string;
  value: number;
  color: string;
  percent: number;
};

type StatCardItem = {
  label: string;
  value: number;
  cardClass: string;
  valueClass: string;
  iconSrc: string;
  deviceState?: boolean;
};

export const DeviceStatusDistribution = defineComponent({
  name: "DeviceStatusDistribution",
  props: {
    title: { type: String, required: false, default: "设备实时数据" },
  },
  setup(props) {
    const { globalState } = useStateStore();
    const { getEquipmentNumber } = useCommon();

    const timer = ref<ReturnType<typeof setInterval> | null>(null);

    const deviceTotal = ref(0);
    const onlineCount = ref(0);
    const offlineCount = ref(0);
    const statusList = ref<StatusItem[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const deviceAllModalShow = ref(false);
    const deviceAllParameter = reactive({
      areaId: globalState.business.currentAreaId,
      tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
      filterAreaIds: [] as string[],
      deviceState: undefined as boolean | undefined,
      dateRange: [] as string[],
    });

    const hasData = computed(() => statusList.value.length > 0 || deviceTotal.value > 0);

    const deviceTotalIcon = getThemeImage("device-total.png");
    const deviceOnlineIcon = getThemeImage("device-total-online.png");
    const deviceOfflineIcon = getThemeImage("device-total-offline.png");

    const statCards = computed<StatCardItem[]>(() => [
      {
        label: "设备总数",
        value: deviceTotal.value,
        cardClass: styles.isTotal,
        valueClass: "",
        iconSrc: deviceTotalIcon,
        deviceState: undefined,
      },
      {
        label: "在线设备",
        value: onlineCount.value,
        cardClass: styles.isOnline,
        valueClass: styles.isOnlineValue,
        iconSrc: deviceOnlineIcon,
        deviceState: true,
      },
      {
        label: "离线设备",
        value: offlineCount.value,
        cardClass: styles.isOffline,
        valueClass: styles.isOfflineValue,
        iconSrc: deviceOfflineIcon,
        deviceState: false,
      },
    ]);

    const openDeviceList = (deviceState?: boolean): void => {
      Object.assign(deviceAllParameter, {
        areaId: globalState.business.currentAreaId,
        tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
        deviceState,
      });
      deviceAllModalShow.value = true;
    };

    const onStatusClick = (item: StatusItem): void => {
      if (item.key === "OFFLINE" || item.name === "离线") {
        openDeviceList(false);
        return;
      }
      if (item.key === "NORMAL" || item.name === "正常") {
        openDeviceList(true);
        return;
      }
      openDeviceList(undefined);
    };

    const deviceDataInfo = async (): Promise<void> => {
      try {
        const res: any = await getEquipmentNumber();
        const rows = Array.isArray(res?.deviceStatusNums) ? res.deviceStatusNums : [];

        let online = 0;
        let offline = 0;
        let total = Number(res?.deviceNum ?? 0);

        const mapped = rows.map((item: { name?: string; num?: number }, index: number) => {
          const key = String(item.name ?? "");
          const value = Number(item.num ?? 0);
          if (key === "NORMAL") online = value;
          if (key === "OFFLINE") offline = value;

          return {
            key,
            name: STATUS_LABEL[key] || key || "未知",
            value,
            color: STATUS_COLOR[key] || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
            percent: 0,
          };
        });

        if (!total) {
          total = mapped.reduce((sum, item) => sum + item.value, 0);
        }

        const base = total || 1;
        statusList.value = mapped.map((item) => ({
          ...item,
          percent: Math.round((item.value / base) * 1000) / 10,
        }));

        deviceTotal.value = total;
        onlineCount.value = online;
        offlineCount.value = offline;
      } catch {
        deviceTotal.value = 0;
        onlineCount.value = 0;
        offlineCount.value = 0;
        statusList.value = [];
      } finally {
        loaded.value = true;
      }
    };

    const startLoop = (): void => {
      if (timer.value) clearInterval(timer.value);
      void deviceDataInfo();
      timer.value = setInterval(
        () => {
          void deviceDataInfo();
        },
        (window as Window & { config?: { pageLoopRequestTime?: number } }).config?.pageLoopRequestTime ?? 60000,
      );
    };

    watch(
      () => globalState.business.currentAreaId,
      () => {
        startLoop();
      },
    );

    onMounted(() => {
      startLoop();
    });

    onBeforeUnmount(() => {
      if (timer.value) clearInterval(timer.value);
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        class={["up-card-body", styles.cardBody, isZoom ? styles.zoomBody : "", ...(isZoom ? universalPanelZoomClass : [])]}
        data-no-zoom
      >
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : !hasData.value ? (
          <div class={["up-empty", styles.isEmpty]}>
            <NoData />
          </div>
        ) : (
          <>
            <div class={styles.statsRow}>
              {statCards.value.map((item) => (
                <button
                  type="button"
                  class={[styles.statCard, item.cardClass]}
                  key={`${isZoom ? "zoom-" : ""}${item.label}`}
                  onClick={() => openDeviceList(item.deviceState)}
                >
                  <span class={styles.statIcon} aria-hidden="true">
                    <img src={item.iconSrc} alt="" />
                  </span>
                  <span class={styles.statContent}>
                    <span class={styles.statLabel}>{item.label}</span>
                    <span class={[styles.statValue, item.valueClass]}>
                      <CountTo startVal={0} endVal={item.value} separator="" duration={2000} />
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div class={styles.analysisSurface}>
              <div class={styles.chartWrap}>
                <ElevatorAnalysisPie
                  pieData={statusList.value}
                  onClickbar={(item?: { name?: string }) => {
                    const find = statusList.value.find((row) => row.name === item?.name);
                    if (find) onStatusClick(find);
                  }}
                >
                  <div class={styles.pieCenterValue}>
                    <CountTo startVal={0} endVal={deviceTotal.value} separator="" duration={2000} />
                  </div>
                  <div class={styles.pieCenterLabel}>设备总数</div>
                </ElevatorAnalysisPie>
              </div>
              <div class={styles.statusList}>
                {statusList.value.map((item) => (
                  <button
                    type="button"
                    class={styles.statusItem}
                    key={`${isZoom ? "zoom-" : ""}${item.key || item.name}`}
                    onClick={() => onStatusClick(item)}
                  >
                    <span class={styles.statusTop}>
                      <span class={styles.statusName}>{item.name}</span>
                      <span class={styles.statusCount}>{item.value}</span>
                    </span>
                    <span class={styles.statusBarRow}>
                      <span class={styles.statusColor} style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                      <span class={styles.statusBarTrack}>
                        <span
                          class={styles.statusBarFill}
                          style={{
                            width: `${Math.max(item.percent, item.value > 0 ? 4 : 0)}%`,
                            background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                          }}
                        />
                      </span>
                    </span>
                    <span class={styles.statusBottom}>
                      <span class={styles.statusShare}>{item.percent}%</span>
                      <span class={styles.statusUnit}>占比</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title={props.title}
            class={`${UNIVERSAL_PANEL_V2_CLASS} device-status-distribution-v2-panel`}
            zoomable
            zoom-title={`${props.title}详情`}
            zoom-width={760}
            v-slots={{
              titleIcon: () => <UniversalPanelCardIcon name="device" />,
              "zoom-content": () => renderBody(true),
              default: () => renderBody(false),
            }}
          />
        </div>
        <ModalEquipmentAllTable
          showModal={deviceAllModalShow.value}
          onClose={() => {
            deviceAllModalShow.value = false;
          }}
          parameter={deviceAllParameter}
        />
      </>
    );
  },
});

export default DeviceStatusDistribution;
