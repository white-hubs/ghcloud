import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch, provide } from "vue";

import UniversalPanelCardIcon from "../_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS, universalPanelZoomClass } from "../_shared/universal-panel-v2";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import { resolveEquipmentManagementPanelContext } from "@/features/cards/air-exhaust/_shared/supply-exhaust-air-panel-context";
import ModalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import bus from "@/infrastructure/utils/bus";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "../../air-conditioning/_shared/air-conditioning-v2-shared.module.less";
import "../_shared/universal-panel-v2-shared.less";

import styles from "./public-device-distribution.module.less";

const deviceTotalIcon = getThemeImage("device-total.png");
const deviceOnlineIcon = getThemeImage("device-total-online.png");
const deviceOfflineIcon = getThemeImage("device-total-offline.png");

const deviceStatusType: Record<string, string> = {
  ALARM: "报警",
  TROUBLE: "故障",
  OFFLINE: "离线",
  NORMAL: "正常",
};

const statusToneClass: Record<string, string> = {
  ALARM: styles.statusAlarm,
  TROUBLE: styles.statusTrouble,
  OFFLINE: styles.statusOffline,
  NORMAL: styles.statusNormal,
};

export const PublicDeviceDistribution = defineComponent({
  name: "PublicDeviceDistribution",
  props: {
    panelName: { type: String, required: false },
  },
  setup(props) {
    let timer: ReturnType<typeof setInterval> | null = null;
    const column = [
      { title: "设备名称", dataIndex: "deviceName" },
      {
        title: "设备类型",
        dataIndex: "genreName",
        slots: { customRender: "genreName" },
      },
      {
        title: "区域",
        dataIndex: "areaName",
        slots: { customRender: "areaName" },
      },
      {
        title: "状态",
        dataIndex: "deviceStatus",
        slots: { customRender: "deviceStatus" },
      },
    ];
    const data = ref<Array<Record<string, unknown>>>([]);
    const stats = reactive({
      total: 0,
      online: 0,
      offline: 0,
    });
    const deviceModalShow = ref(false);
    const deviceParameter = reactive<Record<string, unknown>>({
      deviceState: undefined as boolean | undefined,
      tagCodes: [] as string[],
      areaId: undefined as string | undefined,
    });
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const { getEquipmentNumber } = useCommon();
    const { globalState } = useStateStore();
    const panelContext = resolveEquipmentManagementPanelContext(props.panelName);

    const hasData = computed(() => stats.total > 0 || data.value.length > 0);

    const statCards = computed(() => [
      {
        label: "设备总数",
        value: stats.total,
        cardClass: styles.isTotal,
        valueClass: "",
        iconSrc: deviceTotalIcon,
        deviceState: undefined as boolean | undefined,
      },
      {
        label: "在线设备",
        value: stats.online,
        cardClass: styles.isOnline,
        valueClass: styles.isOnlineValue,
        iconSrc: deviceOnlineIcon,
        deviceState: true as boolean | undefined,
      },
      {
        label: "离线设备",
        value: stats.offline,
        cardClass: styles.isOffline,
        valueClass: styles.isOfflineValue,
        iconSrc: deviceOfflineIcon,
        deviceState: false as boolean | undefined,
      },
    ]);

    const getEquipmentInfo = async (): Promise<void> => {
      try {
        const res: any = await getEquipmentNumber();
        stats.total = Number(res?.deviceNum ?? 0);
        data.value = Array.isArray(res?.devices) ? res.devices : [];

        let online = 0;
        let offline = 0;
        (res?.deviceStatusNums ?? []).forEach((item: { name?: string; num?: number }) => {
          if (item.name === "NORMAL") online = Number(item.num ?? 0);
          if (item.name === "OFFLINE") offline = Number(item.num ?? 0);
        });
        stats.online = online;
        stats.offline = offline;
      } catch {
        stats.total = 0;
        stats.online = 0;
        stats.offline = 0;
        data.value = [];
      } finally {
        loaded.value = true;
      }
    };

    const handelClickRow = (record: Record<string, unknown>): void => {
      if (record.alarmTargetCode) {
        bus.emit("equipmentPosition", record);
      }
    };

    const openDeviceModal = (deviceState?: boolean): void => {
      Object.assign(deviceParameter, {
        deviceState,
        tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
        areaId: globalState.business.currentAreaId,
      });
      deviceModalShow.value = true;
    };

    const closeDeviceModal = (): void => {
      deviceModalShow.value = false;
    };

    const startLoop = (): void => {
      if (timer) clearInterval(timer);
      void getEquipmentInfo();
      timer = setInterval(
        () => {
          void getEquipmentInfo();
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
      if (timer) clearInterval(timer);
    });

    const displayText = (value: unknown): string => {
      if (value === null || value === undefined) return "--";
      const text = String(value).trim();
      return text ? text : "--";
    };

    const renderStatus = ({ record }: { record: Record<string, string> }): JSX.Element => {
      const status = record.deviceStatus;
      return <span class={[styles.statusTag, statusToneClass[status] || styles.statusOffline]}>{deviceStatusType[status] || status}</span>;
    };

    const renderGenreName = ({ record }: { record: Record<string, unknown> }): JSX.Element => <span>{displayText(record.genreName)}</span>;

    const renderAreaName = ({ record }: { record: Record<string, unknown> }): JSX.Element => <span>{displayText(record.areaName)}</span>;

    const tableSlots = {
      deviceStatus: renderStatus,
      genreName: renderGenreName,
      areaName: renderAreaName,
    };

    const panelClass = panelContext.panelClass
      ? `${panelContext.panelClass} public-device-distribution-v2-panel`
      : `${UNIVERSAL_PANEL_V2_CLASS} public-device-distribution-v2-panel`;

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        class={[
          "up-card-body",
          styles.cardBody,
          isZoom ? styles.zoomBody : "",
          ...(panelContext.isV2 ? ["air-conditioning-card-body"] : []),
          ...(isZoom ? (panelContext.isV2 ? panelContext.zoomClass : universalPanelZoomClass) : []),
        ]}
        data-no-zoom
      >
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : !hasData.value ? (
          <div class={styles.emptySurface}>
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
                  onClick={() => openDeviceModal(item.deviceState)}
                  aria-label={`查看${item.label}列表`}
                >
                  <span class={styles.statIcon} aria-hidden="true">
                    <img src={item.iconSrc} alt="" />
                  </span>
                  <span class={styles.statContent}>
                    <span class={styles.statLabel}>{item.label}</span>
                    <span class={styles.statValueRow}>
                      <span class={[styles.statValue, item.valueClass]}>
                        {isZoom ? item.value : <CountTo startVal={0} endVal={item.value} separator="" duration={2000} />}
                      </span>
                      <span class={styles.statUnit}>台</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div class={[styles.tableSurface, "visual-v2-roll-table"]}>
              <RollTable column={column} data={data.value} onClickRow={handelClickRow} showLength={isZoom ? 10 : 5} v-slots={tableSlots} />
            </div>
          </>
        )}
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="设备分布统计"
            class={panelClass}
            zoomable
            zoom-title="设备分布统计详情"
            zoom-width={1000}
            v-slots={{
              titleIcon: () =>
                panelContext.isV2 ? (
                  <CardTitleIcon name={panelContext.isSupplyExhaustAir ? "supply-exhaust-distribution" : "air-conditioning-distribution"} />
                ) : (
                  <UniversalPanelCardIcon name="device" />
                ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalEquipmentAllTable showModal={deviceModalShow.value} onClose={closeDeviceModal} parameter={deviceParameter} />
      </>
    );
  },
});

export default PublicDeviceDistribution;
