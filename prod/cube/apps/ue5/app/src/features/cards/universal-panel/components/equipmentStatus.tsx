import { computed, defineComponent, onMounted, reactive, ref, provide } from "vue";

import UniversalPanelCardIcon from "../_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS, universalPanelZoomClass } from "../_shared/universal-panel-v2";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import { resolveEquipmentManagementPanelContext } from "@/features/cards/air-exhaust/_shared/supply-exhaust-air-panel-context";
import ModalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statusStat } from "@/infrastructure/api/maintain";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "@/features/cards/air-conditioning/_shared/air-conditioning-v2-shared.module.less";
import "../_shared/universal-panel-v2-shared.less";

import styles from "./equipmentStatus.module.less";

const deviceTotalIcon = getThemeImage("device-total.png");

const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];

type PieDatum = {
  name: string;
  value: number;
  color: string;
  percent: number;
};

export const EquipmentStatus = defineComponent({
  name: "EquipmentStatus",
  props: {
    panelName: { type: String, required: false },
  },
  setup(props) {
    const { globalState } = useStateStore();
    const panelContext = resolveEquipmentManagementPanelContext(props.panelName);
    const deviceTotal = ref(0);
    const pieData = ref<PieDatum[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const deviceModalShow = ref(false);
    const deviceParameter = reactive<Record<string, unknown>>({
      deviceState: undefined,
      tagCodes: [],
      areaId: undefined,
    });

    const isUnifiedV2 = computed(() => panelContext.isV2);
    const panelClassName = computed(() =>
      isUnifiedV2.value
        ? `${panelContext.panelClass} equipment-status-v2-panel meeting-device-status-v2-panel`
        : `${UNIVERSAL_PANEL_V2_CLASS} equipment-status-v2-panel`,
    );
    // 接口返回状态列表即展示（含全 0）
    const hasData = computed(() => pieData.value.length > 0);

    const getDeviceStatus = async (): Promise<void> => {
      try {
        const res = await statusStat();
        const rows = Array.isArray(res) ? res : [];
        const total = rows.reduce((sum, item) => sum + Number(item.num || 0), 0);
        const base = total || 1;
        deviceTotal.value = total;
        pieData.value = rows.map((item, index) => {
          const value = Number(item.num || 0);
          return {
            name: item.name,
            value,
            color: colors[index % colors.length],
            percent: Math.round((value / base) * 1000) / 10,
          };
        });
      } catch {
        deviceTotal.value = 0;
        pieData.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getDeviceStatus();
    });

    const openDeviceList = (): void => {
      Object.assign(deviceParameter, {
        deviceState: undefined,
        tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
        areaId: globalState.business.currentAreaId,
      });
      deviceModalShow.value = true;
    };

    const closeDeviceList = (): void => {
      deviceModalShow.value = false;
    };

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        class={[
          isUnifiedV2.value ? "air-conditioning-card-body" : "up-card-body",
          styles.cardBody,
          isZoom ? styles.zoomBody : "",
          ...(isZoom ? (isUnifiedV2.value ? panelContext.zoomClass : universalPanelZoomClass) : []),
        ]}
        data-no-zoom
      >
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : !hasData.value ? (
          <div class={[styles.isEmpty, isUnifiedV2.value ? "air-conditioning-surface" : "up-empty"]}>
            <NoData />
          </div>
        ) : (
          <>
            <button type="button" class={[styles.totalCard, styles.isTotal]} onClick={openDeviceList} aria-label="查看全部设备列表">
              <span class={styles.statIcon} aria-hidden="true">
                <img src={deviceTotalIcon} alt="" />
              </span>
              <span class={styles.statContent}>
                <span class={styles.statLabel}>设备总数</span>
                <span class={styles.statValue}>
                  <CountTo startVal={0} endVal={deviceTotal.value} separator="" duration={2000} />
                </span>
              </span>
            </button>
            <div class={styles.analysisSurface}>
              <div class={styles.chartWrap}>
                <ElevatorAnalysisPie pieData={pieData.value} onClickbar={openDeviceList}>
                  <div class={styles.pieCenterValue}>
                    <CountTo startVal={0} endVal={deviceTotal.value} separator="" duration={2000} />
                  </div>
                  <div class={styles.pieCenterLabel}>设备总数</div>
                </ElevatorAnalysisPie>
              </div>
              <div class={styles.statusList}>
                {pieData.value.map((item) => (
                  <button type="button" class={styles.statusItem} key={`${isZoom ? "zoom-" : ""}${item.name}`} onClick={openDeviceList}>
                    <span class={styles.statusTop}>
                      <span class={styles.statusName} title={item.name}>
                        {item.name}
                      </span>
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
            title="设备状态统计"
            class={panelClassName.value}
            zoomable
            zoom-title="设备状态统计详情"
            zoom-width={760}
            v-slots={{
              titleIcon: () => (isUnifiedV2.value ? <CardTitleIcon name="overview-device" /> : <UniversalPanelCardIcon name="device" />),
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

export default EquipmentStatus;
