import { computed, defineComponent, onMounted, reactive, ref, provide } from "vue";

import { createAlarmModalParameter, resolveAlarmStatus } from "../../_shared/alarm-metrics/alarm-metrics";
import UniversalPanelCardIcon from "../_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS, universalPanelZoomClass } from "../_shared/universal-panel-v2";
import ModalAlarmTableNew from "@/features/equipment/modal-table/modal-alarm-tableNew";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { AlarmStatus } from "@/infrastructure/api/models/alarm";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { equipmentNumber } from "@/infrastructure/utils/requestData/alarm";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "../_shared/universal-panel-v2-shared.less";

import styles from "./alarm-processing-status.module.less";

const alarmCountIcon = getThemeImage("alarm-count.png");
const alarmHandledIcon = getThemeImage("alarm-count-handled.png");
const alarmUnhandledIcon = getThemeImage("alarm-count-unhandled.png");

type Tone = "total" | "pending" | "processing" | "suspend" | "done" | "default";

const resolveTone = (item: AlarmStatus): Tone => {
  const code = resolveAlarmStatus(item);
  const name = String(item.alarmStatusName ?? "").trim();
  if (code === "ALARM_UN_CONFIRMED" || name.includes("待")) return "pending";
  if (code === "ALARM_PROGRESS_CONFIRMED" || name.includes("处理中")) return "processing";
  if (code === "ALARM_SUSPEND" || name.includes("挂起")) return "suspend";
  if (code === "ALARM_HANDLER" || name.includes("已处理")) return "done";
  return "default";
};

const toneIcon = (tone: Tone): string => {
  if (tone === "pending") return alarmUnhandledIcon;
  if (tone === "done") return alarmHandledIcon;
  return alarmCountIcon;
};

const toneClassMap: Record<Tone, string> = {
  total: styles.isTotal,
  pending: styles.isPending,
  processing: styles.isProcessing,
  suspend: styles.isSuspend,
  done: styles.isDone,
  default: styles.isDefault,
};

const toneAccent: Record<Tone, string> = {
  total: "#5b9ce2",
  pending: "#e84749",
  processing: "#faad14",
  suspend: "#3f7fd0",
  done: "#3ecf8e",
  default: "#29C2FF",
};

export const AlarmProcessingStatus = defineComponent({
  name: "AlarmProcessingStatus",
  props: {
    title: { type: String, required: true, default: "报警处理情况" },
  },
  setup(props) {
    const { globalState } = useStateStore();

    const hiddenDangerTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const alarmCon = ref({
      count: 0,
      ratio: 0,
    });
    const deviceStatistic = ref<AlarmStatus[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const alarmModalShow = ref(false);
    const alarmModalParameter = reactive<Record<string, unknown>>({});

    // 接口返回了状态结构即展示（含全 0），仅列表为空时走暂无数据
    const hasData = computed(() => deviceStatistic.value.length > 0);

    const metricRows = computed(() => {
      const total = alarmCon.value.count || 1;
      const statusRows = deviceStatistic.value.map((item) => {
        const tone = resolveTone(item);
        const value = Number(item.alarmNum) || 0;
        return {
          key: item.alarmStatus || item.alarmStatusName,
          label: item.alarmStatusName,
          value,
          percent: Math.round((value / total) * 1000) / 10,
          tone,
          toneClass: toneClassMap[tone],
          icon: toneIcon(tone),
          color: toneAccent[tone],
          statusCode: resolveAlarmStatus(item),
        };
      });
      return [
        {
          key: "total",
          label: "报警数",
          value: alarmCon.value.count,
          percent: 100,
          tone: "total" as Tone,
          toneClass: toneClassMap.total,
          icon: alarmCountIcon,
          color: toneAccent.total,
          statusCode: "",
          ratio: alarmCon.value.ratio,
        },
        ...statusRows,
      ];
    });

    const changeHandleHiddenDangerTime = async (): Promise<void> => {
      const param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: hiddenDangerTime.value?.dateRange?.join(",") ?? "",
        type: hiddenDangerTime.value?.timeType,
      };
      try {
        const data: any = await equipmentNumber(param);
        const list = Array.isArray(data?.alarmStatusStatistics) ? data.alarmStatusStatistics : [];
        deviceStatistic.value = list;
        alarmCon.value = {
          count: Number(data?.alarmNum) || 0,
          ratio: Number(data?.chainRatio) || 0,
        };
      } catch {
        deviceStatistic.value = [];
        alarmCon.value = { count: 0, ratio: 0 };
      } finally {
        loaded.value = true;
      }
    };

    const openAlarmModal = (status = ""): void => {
      Object.assign(alarmModalParameter, createAlarmModalParameter(hiddenDangerTime.value, status));
      alarmModalShow.value = true;
    };

    onMounted(() => {
      void changeHandleHiddenDangerTime();
    });

    const renderDateForm = (): JSX.Element => (
      <div class="header-toolbar" data-no-zoom>
        <DateInlineForm
          modelValue={hiddenDangerTime.value}
          onUpdate:modelValue={(v) => {
            hiddenDangerTime.value = v;
          }}
          onSearch={changeHandleHiddenDangerTime}
        />
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        class={[
          "alarm-processing-status-v2-panel",
          "up-card-body",
          styles.cardBody,
          isZoom ? styles.zoomBody : "",
          ...(isZoom ? universalPanelZoomClass : []),
        ]}
        data-no-zoom
      >
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : !hasData.value ? (
          <div class={[styles.emptySurface, "up-empty"]}>
            <NoData />
          </div>
        ) : (
          <div class={[styles.metricPanel, isZoom ? styles.isZoom : ""]}>
            {metricRows.value.map((item) => (
              <button
                type="button"
                key={`${isZoom ? "zoom-" : ""}${item.key}`}
                class={[styles.metricRow, item.toneClass]}
                onClick={() => openAlarmModal(item.statusCode)}
              >
                <div class={styles.rowIcon} aria-hidden="true">
                  <img src={item.icon} alt="" />
                </div>
                <div class={styles.rowBody}>
                  <div class={styles.rowHead}>
                    <span class={styles.rowLabel}>{item.label}</span>
                    <span class={styles.rowValue}>
                      <CountTo startVal={0} endVal={item.value} separator="" duration={1600} />
                      {"ratio" in item && typeof item.ratio === "number" ? (
                        <span class={[styles.rowRatio, item.ratio > 0 ? styles.ratioUp : styles.ratioDown]}>环比 {item.ratio}%</span>
                      ) : (
                        <span class={styles.rowUnit}>{item.percent}%</span>
                      )}
                    </span>
                  </div>
                  <div class={styles.rowTrack}>
                    <div
                      class={styles.rowFill}
                      style={{
                        width: `${Math.max(0, Math.min(item.percent, 100))}%`,
                        background: item.color,
                      }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title={props.title}
            class={`${UNIVERSAL_PANEL_V2_CLASS} alarm-processing-status-v2-panel`}
            zoomable
            zoom-title={`${props.title}详情`}
            zoom-width={760}
            v-slots={{
              titleIcon: () => <UniversalPanelCardIcon name="alarm" />,
              extra: () => renderDateForm(),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalAlarmTableNew
          showModal={alarmModalShow.value}
          onClose={() => {
            alarmModalShow.value = false;
          }}
          parameter={alarmModalParameter}
        />
      </>
    );
  },
});

export default AlarmProcessingStatus;
