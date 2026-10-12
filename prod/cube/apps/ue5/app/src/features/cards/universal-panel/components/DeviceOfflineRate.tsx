import { computed, defineComponent, onMounted, reactive, ref, provide } from "vue";

import UniversalPanelCardIcon from "../_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS, universalPanelZoomClass } from "../_shared/universal-panel-v2";
import ModalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import WaterPolo from "@/shared-ui/panel/charts/waterPolo/waterPolo";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "../_shared/universal-panel-v2-shared.less";

import styles from "./DeviceOfflineRate.module.less";

const deviceTotalIcon = getThemeImage("device-total.png");
const deviceFaultIcon = getThemeImage("device-total-offline.png");

export const DeviceOfflineRate = defineComponent({
  name: "DeviceOfflineRate",
  props: {
    title: { type: String, required: true, default: "设备故障率" },
  },
  setup(props) {
    const { getEquipmentNumber } = useCommon();
    const { globalState } = useStateStore();
    const faultRate = ref(0);
    const deviceNum = ref(0);
    const faultNum = ref(0);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const deviceModalShow = ref(false);
    const deviceParameter = reactive<Record<string, unknown>>({
      deviceState: undefined as boolean | undefined,
      tagCodes: [] as string[],
      areaId: undefined as string | undefined,
    });

    const isEmpty = computed(() => loaded.value && !deviceNum.value);

    const equipmentStatistic = async (): Promise<void> => {
      try {
        const res = await getEquipmentNumber();
        if (!res || JSON.stringify(res) === "{}") {
          deviceNum.value = 0;
          faultNum.value = 0;
          faultRate.value = 0;
          return;
        }

        const total = Number(res.deviceNum ?? 0);
        deviceNum.value = total;

        let fault = 0;
        (res.deviceStatusNums ?? []).forEach((item: { name?: string; num?: number }) => {
          if (item.name === "OFFLINE") fault = Number(item.num ?? 0);
        });

        faultNum.value = fault;
        faultRate.value = total > 0 ? Math.round((fault / total) * 10000) / 100 : 0;
      } catch {
        deviceNum.value = 0;
        faultNum.value = 0;
        faultRate.value = 0;
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void equipmentStatistic();
    });

    const openDeviceList = (deviceState?: boolean): void => {
      Object.assign(deviceParameter, {
        deviceState,
        tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
        areaId: globalState.business.currentAreaId,
      });
      deviceModalShow.value = true;
    };

    const closeDeviceList = (): void => {
      deviceModalShow.value = false;
    };

    const renderMetricCards = (isZoom: boolean): JSX.Element => (
      <div class={styles.metricList}>
        <button
          type="button"
          class={[styles.metricCard, styles.isTotal]}
          onClick={() => openDeviceList(undefined)}
          aria-label="查看全部设备列表"
        >
          <span class={styles.metricIcon} aria-hidden="true">
            <img src={deviceTotalIcon} alt="" />
          </span>
          <span class={styles.metricContent}>
            <span class={styles.metricLabel}>设备总数</span>
            <span class={styles.metricValueRow}>
              <span class={styles.metricValue}>
                {isZoom ? deviceNum.value : <CountTo startVal={0} endVal={deviceNum.value} separator="" duration={2000} />}
              </span>
              <span class={styles.metricUnit}>台</span>
            </span>
          </span>
        </button>
        <button
          type="button"
          class={[styles.metricCard, styles.isFault]}
          onClick={() => openDeviceList(false)}
          aria-label="查看故障设备列表"
        >
          <span class={styles.metricIcon} aria-hidden="true">
            <img src={deviceFaultIcon} alt="" />
          </span>
          <span class={styles.metricContent}>
            <span class={styles.metricLabel}>故障总数</span>
            <span class={styles.metricValueRow}>
              <span class={[styles.metricValue, styles.isFaultValue]}>
                {isZoom ? faultNum.value : <CountTo startVal={0} endVal={faultNum.value} separator="" duration={2000} />}
              </span>
              <span class={styles.metricUnit}>台</span>
            </span>
          </span>
        </button>
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        class={["up-card-body", styles.cardBody, isZoom ? styles.zoomBody : "", ...(isZoom ? universalPanelZoomClass : [])]}
        data-no-zoom
      >
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : isEmpty.value ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <div class={styles.rateSurface}>
            <button
              type="button"
              class={styles.gaugeWrap}
              onClick={() => openDeviceList(false)}
              aria-label={`查看故障设备列表，故障率 ${faultRate.value}%`}
            >
              <WaterPolo
                title=""
                value={faultRate.value}
                unit="%"
                percentage
                responsive
                tone="warning"
                glow
                labelFontSize={isZoom ? 28 : 16}
              />
            </button>
            {renderMetricCards(isZoom)}
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title={props.title}
            class={`${UNIVERSAL_PANEL_V2_CLASS} device-offline-rate-v2-panel`}
            zoomable
            zoom-title={`${props.title}详情`}
            zoom-width={760}
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

export default DeviceOfflineRate;
