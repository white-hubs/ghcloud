import { computed, defineComponent, onMounted, reactive, ref, provide } from "vue";

import UniversalPanelCardIcon from "../_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS, universalPanelZoomClass } from "../_shared/universal-panel-v2";
import ModalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getDeviceListBuyScene } from "@/infrastructure/api/device";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "../_shared/universal-panel-v2-shared.less";

import styles from "./device-offline-details.module.less";

interface OfflineDeviceRow {
  code: string;
  deviceArea: string;
  deviceStatus: string;
  name?: string;
  area?: { pathName?: string };
  status?: { onlineState?: boolean };
}

const deviceTotalIcon = getThemeImage("device-total.png");
const deviceOnlineIcon = getThemeImage("device-total-online.png");
const deviceOfflineIcon = getThemeImage("device-total-offline.png");

const displayText = (value: unknown): string => {
  if (value === null || value === undefined) return "--";
  const text = String(value).trim();
  return text ? text : "--";
};

export const DeviceOfflineDetails = defineComponent({
  name: "DeviceOfflineDetails",
  props: {
    title: { type: String, required: true, default: "离线设备明细" },
  },
  setup(props) {
    const { globalState } = useStateStore();
    const stats = reactive({
      total: 0,
      online: 0,
      offline: 0,
    });
    const column = [
      { title: "设备编号", dataIndex: "code", slots: { customRender: "code" } },
      { title: "设备区域", dataIndex: "deviceArea", slots: { customRender: "deviceArea" } },
      { title: "状态", dataIndex: "deviceStatus", slots: { customRender: "deviceStatus" }, width: 72 },
    ];
    const deviceParameter = reactive({
      deviceState: false as boolean | undefined,
      tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
      areaId: undefined as string | undefined,
    });
    const listData = ref<OfflineDeviceRow[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const deviceModalShow = ref(false);

    const hasData = computed(() => stats.total > 0 || listData.value.length > 0);

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

    const getData = async (): Promise<void> => {
      try {
        const query = {
          sceneType: globalState.business.currentMenu,
          areaId: globalState.business.currentAreaId,
          pageNumber: 1,
          pageSize: 200,
        };
        const res = await getDeviceListBuyScene(query);
        const records = (res.records ?? []) as OfflineDeviceRow[];
        const onlineRecords = records.filter((item) => Boolean(item.status?.onlineState));
        const offlineRecords = records.filter((item) => !item.status?.onlineState);

        listData.value = offlineRecords.map((item) => ({
          ...item,
          deviceArea: item.area?.pathName || "--",
          deviceStatus: "离线",
        }));
        stats.online = onlineRecords.length;
        stats.offline = offlineRecords.length;
        stats.total = onlineRecords.length + offlineRecords.length;
      } catch {
        listData.value = [];
        stats.total = 0;
        stats.online = 0;
        stats.offline = 0;
      } finally {
        loaded.value = true;
      }
    };

    const openDeviceList = (deviceState?: boolean): void => {
      deviceParameter.deviceState = deviceState;
      deviceParameter.tagCodes = buildVisualMenuTagCodes(globalState.business.currentMenu);
      deviceParameter.areaId = globalState.business.currentAreaId;
      deviceModalShow.value = true;
    };

    const closeDeviceList = (): void => {
      deviceModalShow.value = false;
    };

    onMounted(() => {
      void getData();
    });

    const renderStatus = (): JSX.Element => <span class={[styles.statusTag, styles.statusOffline]}>离线</span>;
    const renderCode = ({ record }: { record: OfflineDeviceRow }): JSX.Element => <span>{displayText(record.code)}</span>;
    const renderArea = ({ record }: { record: OfflineDeviceRow }): JSX.Element => <span>{displayText(record.deviceArea)}</span>;

    const tableSlots = {
      deviceStatus: renderStatus,
      code: renderCode,
      deviceArea: renderArea,
    };

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        class={["up-card-body", styles.cardBody, isZoom ? styles.zoomBody : "", ...(isZoom ? universalPanelZoomClass : [])]}
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
                  onClick={() => openDeviceList(item.deviceState)}
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
              {!loaded.value ? (
                <PanelCardLoading zoom={isZoom} />
              ) : listData.value.length === 0 ? (
                <div class={styles.emptySurface}>
                  <NoData />
                </div>
              ) : (
                <RollTable column={column} data={listData.value} showLength={isZoom ? 10 : 5} v-slots={tableSlots} />
              )}
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
            class={`${UNIVERSAL_PANEL_V2_CLASS} device-offline-details-v2-panel`}
            zoomable
            zoom-title={`${props.title}详情`}
            zoom-width={860}
            v-slots={{
              titleIcon: () => <UniversalPanelCardIcon name="device" />,
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalEquipmentAllTable showModal={deviceModalShow.value} onClose={closeDeviceList} parameter={deviceParameter} />
      </>
    );
  },
});

export default DeviceOfflineDetails;
