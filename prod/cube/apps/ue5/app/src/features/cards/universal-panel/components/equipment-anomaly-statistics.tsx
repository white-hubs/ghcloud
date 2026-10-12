import { computed, defineComponent, reactive, ref, provide } from "vue";

import UniversalPanelCardIcon from "../_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS, universalPanelZoomClass } from "../_shared/universal-panel-v2";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { abnormalStatistics } from "@/infrastructure/api/alarm";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "../_shared/universal-panel-v2-shared.less";

import styles from "./equipment-anomaly-statistics.module.less";

const alarmCountIcon = getThemeImage("alarm-count.png");
const alarmUnhandledIcon = getThemeImage("alarm-count-unhandled.png");

type AnomalyRow = {
  timeFlag: string;
  equipmentNum: number;
  alarmNum: number;
};

export const EquipmentAnomalyStatistics = defineComponent({
  name: "EquipmentAnomalyStatistics",
  props: {
    title: { type: String, required: true, default: "设备异常统计" },
  },
  setup(props) {
    const { globalState } = useStateStore();

    const metrics = reactive({
      deviceCount: 0,
      alarmCount: 0,
    });
    const listData = ref<AnomalyRow[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const receptionTrendsTime = ref<ModelValueItf>();

    const alarmColumn = [
      { title: "日期", dataIndex: "timeFlag", width: 120 },
      { title: "异常设备数量", dataIndex: "equipmentNum" },
      { title: "报警次数", dataIndex: "alarmNum", width: 140 },
    ];

    const metricCards = computed(() => [
      {
        label: "异常设备数量",
        value: metrics.deviceCount,
        cardClass: styles.isDevice,
        iconSrc: alarmUnhandledIcon,
      },
      {
        label: "报警次数",
        value: metrics.alarmCount,
        cardClass: styles.isAlarm,
        iconSrc: alarmCountIcon,
      },
    ]);

    const getAbnormalStatistics = async (): Promise<void> => {
      try {
        const param = {
          sceneType: globalState.business.currentMenu,
          areaId: globalState.business.currentAreaId,
          period: receptionTrendsTime.value?.dateRange?.join(",") ?? "",
          type: receptionTrendsTime.value?.timeType,
        };
        const res = await abnormalStatistics(param);
        metrics.deviceCount = Number(res?.equipmentDeviceTotal) || 0;
        metrics.alarmCount = Number(res?.equipmentTotal) || 0;
        const rows = Array.isArray(res?.equipmentList) ? [...res.equipmentList] : [];
        if (receptionTrendsTime.value?.timeType === "THIS_YEAR") {
          rows.forEach((x) => {
            x.timeFlag = `${x.timeFlag}月`;
          });
        }
        if (receptionTrendsTime.value?.timeType === "TODAY") {
          rows.forEach((x) => {
            x.timeFlag = `${x.timeFlag}时`;
          });
        }
        listData.value = rows;
      } catch {
        metrics.deviceCount = 0;
        metrics.alarmCount = 0;
        listData.value = [];
      } finally {
        loaded.value = true;
      }
    };

    const renderDateForm = (): JSX.Element => (
      <div class="header-toolbar" data-no-zoom>
        <DateInlineForm
          modelValue={receptionTrendsTime.value}
          onUpdate:modelValue={(v) => {
            receptionTrendsTime.value = v;
          }}
          onSearch={getAbnormalStatistics}
        />
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        class={["up-card-body", styles.cardBody, isZoom ? styles.zoomBody : "", ...(isZoom ? universalPanelZoomClass : [])]}
        data-no-zoom
      >
        <div class={styles.statsRow}>
          {metricCards.value.map((item) => (
            <div class={[styles.statCard, item.cardClass]} key={`${isZoom ? "zoom-" : ""}${item.label}`}>
              <span class={styles.statIcon} aria-hidden="true">
                <img src={item.iconSrc} alt="" />
              </span>
              <span class={styles.statContent}>
                <span class={styles.statLabel}>{item.label}</span>
                <span class={styles.statValue}>
                  <CountTo startVal={0} endVal={item.value} separator="" duration={1600} />
                </span>
              </span>
            </div>
          ))}
        </div>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : listData.value.length === 0 ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <div class={[styles.tableSurface, "visual-v2-roll-table"]}>
            <RollTable column={alarmColumn} data={listData.value} showLength={isZoom ? 8 : 5} />
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title={props.title}
          class={`${UNIVERSAL_PANEL_V2_CLASS} equipment-anomaly-statistics-v2-panel`}
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={760}
          v-slots={{
            titleIcon: () => <UniversalPanelCardIcon name="device" />,
            extra: () => renderDateForm(),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default EquipmentAnomalyStatistics;
