import { computed, defineComponent, onMounted, reactive, ref, provide } from "vue";

import UniversalPanelCardIcon from "../_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS, universalPanelZoomClass } from "../_shared/universal-panel-v2";
import ModalAlarmTableNew from "@/features/equipment/modal-table/modal-alarm-tableNew";
import ModalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { equipmentAlarmRateData } from "@/infrastructure/utils/requestData/alarm";
import { buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import WaterPolo from "@/shared-ui/panel/charts/waterPolo/waterPolo";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "../_shared/universal-panel-v2-shared.less";

import styles from "./equipment-alarm-rate.module.less";

const deviceTotalIcon = getThemeImage("device-total.png");
const alarmDeviceIcon = getThemeImage("device-total-offline.png");

export const EquipmentAlarmRate = defineComponent({
  name: "EquipmentAlarmRate",
  props: {
    title: { type: String, required: true, default: "设备报警率" },
    panelName: { type: String, required: false },
  },
  setup(props) {
    const { globalState } = useStateStore();

    const timeFrame = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const deviceTotal = ref(0);
    const alarmNum = ref(0);
    const alarmRate = ref(0);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const deviceModalShow = ref(false);
    const alarmModalShow = ref(false);
    const deviceParameter = reactive<Record<string, unknown>>({
      deviceState: undefined as boolean | undefined,
      tagCodes: [] as string[],
      areaId: undefined as string | undefined,
    });
    const alarmParameter = reactive({
      dateRange: [] as string[],
      alarmStatus: undefined as string | undefined,
      filterAlarmStatus: undefined as string | undefined,
    });

    const isEmpty = computed(() => loaded.value && !deviceTotal.value && !alarmNum.value && !alarmRate.value);

    const equipmentAlarmRateInfo = async (): Promise<void> => {
      try {
        const param = {
          sceneType: globalState.business.currentMenu,
          areaId: globalState.business.currentAreaId,
          period: timeFrame.value?.dateRange?.join(",") ?? "",
          type: timeFrame.value?.timeType,
        };
        const res = await equipmentAlarmRateData(param);
        alarmRate.value = Math.round(Number(res.proportion) * 10000) / 100.0;
        deviceTotal.value = Number(res.deviceTotal) || 0;
        alarmNum.value = Number(res.alarmNum) || 0;
      } catch {
        alarmRate.value = 0;
        deviceTotal.value = 0;
        alarmNum.value = 0;
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void equipmentAlarmRateInfo();
    });

    const openDeviceList = (): void => {
      Object.assign(deviceParameter, {
        deviceState: undefined,
        tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
        areaId: globalState.business.currentAreaId,
      });
      deviceModalShow.value = true;
    };

    const openAlarmList = (): void => {
      alarmParameter.dateRange = [...(timeFrame.value?.dateRange ?? [])];
      alarmParameter.alarmStatus = undefined;
      alarmParameter.filterAlarmStatus = undefined;
      alarmModalShow.value = true;
    };

    const renderDateForm = (): JSX.Element => (
      <div class="header-toolbar" data-no-zoom>
        <DateInlineForm
          modelValue={timeFrame.value}
          onUpdate:modelValue={(v) => {
            timeFrame.value = v;
          }}
          onSearch={equipmentAlarmRateInfo}
        />
      </div>
    );

    const renderMetricCards = (isZoom: boolean): JSX.Element => (
      <div class={styles.metricList}>
        <button type="button" class={[styles.metricCard, styles.isTotal]} onClick={openDeviceList} aria-label="查看全部设备列表">
          <span class={styles.metricIcon} aria-hidden="true">
            <img src={deviceTotalIcon} alt="" />
          </span>
          <span class={styles.metricContent}>
            <span class={styles.metricLabel}>设备总数</span>
            <span class={styles.metricValueRow}>
              <span class={styles.metricValue}>
                {isZoom ? deviceTotal.value : <CountTo startVal={0} endVal={deviceTotal.value} separator="" duration={2000} />}
              </span>
              <span class={styles.metricUnit}>台</span>
            </span>
          </span>
        </button>
        <button type="button" class={[styles.metricCard, styles.isAlarm]} onClick={openAlarmList} aria-label="查看报警设备列表">
          <span class={styles.metricIcon} aria-hidden="true">
            <img src={alarmDeviceIcon} alt="" />
          </span>
          <span class={styles.metricContent}>
            <span class={styles.metricLabel}>报警设备总数</span>
            <span class={styles.metricValueRow}>
              <span class={[styles.metricValue, styles.isAlarmValue]}>
                {isZoom ? alarmNum.value : <CountTo startVal={0} endVal={alarmNum.value} separator="" duration={2000} />}
              </span>
              <span class={styles.metricUnit}>台</span>
              <span class={styles.metricShare}>占比 {alarmRate.value}%</span>
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
              onClick={openAlarmList}
              aria-label={`查看报警设备列表，报警率 ${alarmRate.value}%`}
            >
              <WaterPolo
                title=""
                value={alarmRate.value}
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
            class={`${UNIVERSAL_PANEL_V2_CLASS} equipment-alarm-rate-v2-panel`}
            zoomable
            zoom-title={`${props.title}详情`}
            zoom-width={800}
            v-slots={{
              titleIcon: () => <UniversalPanelCardIcon name="alarm" />,
              extra: () => renderDateForm(),
              "zoom-content": () => renderBody(true),
              default: () => renderBody(false),
            }}
          />
        </div>
        <ModalEquipmentAllTable
          showModal={deviceModalShow.value}
          onClose={() => (deviceModalShow.value = false)}
          parameter={deviceParameter}
        />
        <ModalAlarmTableNew showModal={alarmModalShow.value} onClose={() => (alarmModalShow.value = false)} parameter={alarmParameter} />
      </>
    );
  },
});

export default EquipmentAlarmRate;
