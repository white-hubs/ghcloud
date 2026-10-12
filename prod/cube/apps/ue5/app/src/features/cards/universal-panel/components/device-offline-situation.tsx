import { defineComponent, onMounted, reactive, ref, provide } from "vue";

import UniversalPanelCardIcon from "../_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS, universalPanelZoomClass } from "../_shared/universal-panel-v2";
import ModalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { deviceStatusNum } from "@/infrastructure/api/securitymanagement";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "../_shared/universal-panel-v2-shared.less";

import styles from "./device-offline-situation.module.less";

const deviceTotalIcon = getThemeImage("device-total.png");
const deviceOnlineIcon = getThemeImage("device-total-online.png");
const deviceOfflineIcon = getThemeImage("device-total-offline.png");

const VISIBLE_ROWS = 4;
const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 30;

type SystemRow = {
  applicationName?: string;
  normalNum?: number;
  offLineNum?: number;
};

export const DeviceOfflineSituation = defineComponent({
  name: "DeviceOfflineSituation",
  setup() {
    const { globalState } = useStateStore();
    const { getEquipmentNumber } = useCommon();
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const deviceModalShow = ref(false);
    const deviceParameter = reactive({
      deviceState: undefined as boolean | undefined,
      tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
      areaId: undefined as string | undefined,
    });

    const stats = reactive({
      total: 0,
      online: 0,
      offline: 0,
      rate: 0,
    });

    const columns = [
      { title: "系统名称", dataIndex: "applicationName" },
      { title: "在线", dataIndex: "normalNum", width: 72, slots: { customRender: "normalNum" } },
      { title: "离线", dataIndex: "offLineNum", width: 72, slots: { customRender: "offLineNum" } },
    ];
    const tableData = ref<SystemRow[]>([]);

    const openDeviceList = (deviceState?: boolean): void => {
      Object.assign(deviceParameter, {
        deviceState,
        tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
        areaId: globalState.business.currentAreaId,
      });
      deviceModalShow.value = true;
    };

    const loadData = async (): Promise<void> => {
      try {
        const res: any = await getEquipmentNumber();
        const total = Number(res?.deviceNum) || 0;
        let offline = 0;
        (Array.isArray(res?.deviceStatusNums) ? res.deviceStatusNums : []).forEach((item: { name?: string; num?: number }) => {
          if (item.name === "OFFLINE") offline = Number(item.num) || 0;
        });
        const online = Math.max(0, total - offline);
        stats.total = total;
        stats.offline = offline;
        stats.online = online;
        stats.rate = total > 0 ? Math.round((offline / total) * 10000) / 100 : 0;

        const rows = await deviceStatusNum({
          sceneType: globalState.business.currentMenu,
          areaId: globalState.business.currentAreaId,
        });
        tableData.value = Array.isArray(rows) ? rows : [];
      } catch {
        stats.total = 0;
        stats.online = 0;
        stats.offline = 0;
        stats.rate = 0;
        tableData.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void loadData();
    });

    const tableSlots = {
      normalNum: ({ record }: { record: SystemRow }) => (
        <span class={[styles.countCell, styles.onlineCount]}>
          <span class={styles.dot} />
          {Number(record.normalNum) || 0}
          <small>台</small>
        </span>
      ),
      offLineNum: ({ record }: { record: SystemRow }) => (
        <span class={[styles.countCell, styles.offlineCount]}>
          <span class={styles.dot} />
          {Number(record.offLineNum) || 0}
          <small>台</small>
        </span>
      ),
    };

    const renderBody = (isZoom: boolean): JSX.Element => {
      const visibleRows = isZoom ? 8 : VISIBLE_ROWS;
      const tableHeight = HEADER_HEIGHT + visibleRows * ROW_HEIGHT;

      return (
        <div
          class={[
            "up-card-body",
            styles.cardBody,
            isZoom ? styles.isZoom : "",
            isZoom ? "device-offline-situation-v2-panel device-offline-situation-zoom" : "",
            ...(isZoom ? universalPanelZoomClass : []),
          ]}
          data-no-zoom
        >
          {/* 对齐右侧「设备处理及趋势分析」：顶部汇总卡 + 下方状态网格 */}
          <button type="button" class={styles.summaryCard} onClick={() => openDeviceList()} aria-label="查看全部设备">
            <span class={styles.summaryLeft}>
              <span class={styles.summaryIcon} aria-hidden="true">
                <img src={deviceTotalIcon} alt="" />
              </span>
              <span class={styles.summaryText}>
                <span class={styles.summaryLabel}>设备总数</span>
                <span class={styles.summaryValueRow}>
                  <span class={styles.summaryValue}>
                    <CountTo startVal={0} endVal={stats.total} separator="" duration={1400} />
                  </span>
                  <span class={styles.summaryUnit}>台</span>
                </span>
              </span>
            </span>
            <span class={styles.summaryRate}>
              <span class={styles.summaryRateLabel}>离线率</span>
              <span class={styles.summaryRateValue}>{Number(stats.rate || 0).toFixed(2)}%</span>
            </span>
          </button>

          <div class={styles.statusGrid}>
            <button
              type="button"
              class={[styles.statusCard, styles.isOnline]}
              onClick={() => openDeviceList(true)}
              aria-label="查看在线设备"
            >
              <span class={styles.statusIcon} aria-hidden="true">
                <img src={deviceOnlineIcon} alt="" />
              </span>
              <span class={styles.statusLabel}>在线设备</span>
              <span class={styles.statusValueRow}>
                <span class={[styles.statusValue, styles.isOnlineValue]}>
                  <CountTo startVal={0} endVal={stats.online} separator="" duration={1400} />
                </span>
                <span class={styles.statusUnit}>台</span>
              </span>
            </button>
            <button
              type="button"
              class={[styles.statusCard, styles.isOffline]}
              onClick={() => openDeviceList(false)}
              aria-label="查看离线设备"
            >
              <span class={styles.statusIcon} aria-hidden="true">
                <img src={deviceOfflineIcon} alt="" />
              </span>
              <span class={styles.statusLabel}>离线设备</span>
              <span class={styles.statusValueRow}>
                <span class={[styles.statusValue, styles.isOfflineValue]}>
                  <CountTo startVal={0} endVal={stats.offline} separator="" duration={1400} />
                </span>
                <span class={styles.statusUnit}>台</span>
              </span>
            </button>
          </div>

          <div class={[styles.tableSurface, "visual-v2-roll-table"]} style={{ height: `${tableHeight}px` }}>
            {!loaded.value ? (
              <PanelCardLoading zoom={isZoom} />
            ) : tableData.value.length === 0 ? (
              <div class={styles.emptySurface}>
                <NoData />
              </div>
            ) : (
              <RollTable column={columns} data={tableData.value} showLength={visibleRows} v-slots={tableSlots} />
            )}
          </div>
        </div>
      );
    };

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="设备离线情况"
            class={`${UNIVERSAL_PANEL_V2_CLASS} device-offline-situation-v2-panel`}
            zoomable
            zoom-title="设备离线情况详情"
            zoom-width={920}
            v-slots={{
              titleIcon: () => <UniversalPanelCardIcon name="device" />,
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalEquipmentAllTable
          showModal={deviceModalShow.value}
          parameter={deviceParameter}
          onClose={() => {
            deviceModalShow.value = false;
          }}
        />
      </>
    );
  },
});

export default DeviceOfflineSituation;
