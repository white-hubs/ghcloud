import { computed, defineComponent, onMounted, reactive, ref, provide } from "vue";

import UniversalPanelCardIcon from "../_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS, universalPanelZoomClass } from "../_shared/universal-panel-v2";
import ModalAlarmTableNew from "@/features/equipment/modal-table/modal-alarm-tableNew";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsLevel } from "@/infrastructure/api/alarm";
import { AlarmLevelType } from "@/infrastructure/api/models/alarm";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "../_shared/universal-panel-v2-shared.less";

import styles from "./alarm-level.module.less";

const levelColors = ["#f14545", "#ffab10", "#2f8dff", "#655dd1"];
const levelCodeMap: Record<string, string> = {
  一级: "one_level",
  二级: "two_level",
  三级: "three_level",
  四级: "four_level",
};

type PieDataItem = {
  name: string;
  value: number;
  color: string;
  levelCode: string;
  chainRatio: number;
  isGrow: boolean;
  percent: number;
};

export const AlarmLevel = defineComponent({
  name: "AlarmLevel",
  props: {
    title: { type: String, required: true, default: "报警级别分布" },
  },
  setup(props) {
    const { globalState } = useStateStore();

    const timeFrame = ref<ModelValueItf>();
    const alarmLevelData = ref<AlarmLevelType[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const alarmModalShow = ref(false);
    const parameter = reactive({
      alarmLevelCode: "",
      alarmStatus: "" as string | undefined,
      dateRange: [] as string[],
      departmentId: "" as string | undefined,
    });

    // 接口返回了级别列表即展示（含全 0），仅空数组时走暂无数据
    const hasData = computed(() => alarmLevelData.value.length > 0);
    const totalCount = computed(() => alarmLevelData.value.reduce((sum, item) => sum + (Number(item.alarmNum) || 0), 0));
    const pieData = computed<PieDataItem[]>(() => {
      const total = totalCount.value || 1;
      return alarmLevelData.value.map((item, index) => {
        const value = Number(item.alarmNum) || 0;
        return {
          name: item.name,
          value,
          color: levelColors[index] || levelColors[levelColors.length - 1],
          levelCode: levelCodeMap[item.name.substring(0, 2)] || "",
          chainRatio: item.chainRatio,
          isGrow: Boolean(item.isGrow),
          percent: Math.round((value / total) * 1000) / 10,
        };
      });
    });

    const getAlarmLevel = async (): Promise<void> => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: timeFrame.value?.dateRange?.join(",") ?? "",
        type: timeFrame.value?.timeType,
      };
      try {
        const res = await statisticsLevel(params);
        alarmLevelData.value = (Array.isArray(res) ? res : []).map((item) => ({
          ...item,
          isGrow: item.chainRatio > 0,
          name: item.name.includes("报警") ? item.name : `${item.name}报警`,
        }));
      } catch {
        alarmLevelData.value = [];
      } finally {
        loaded.value = true;
      }
    };

    const resolvePieItem = (item: PieDataItem | { data?: { originData?: PieDataItem } }): PieDataItem | null => {
      const resolved = (item as { data?: { originData?: PieDataItem } })?.data?.originData ?? (item as PieDataItem);
      if (!resolved?.name) return null;
      return resolved;
    };

    const openLevelModal = (item: PieDataItem | { data?: { originData?: PieDataItem } }): void => {
      const level = resolvePieItem(item);
      if (!level) return;
      parameter.alarmStatus = undefined;
      parameter.departmentId = undefined;
      parameter.dateRange = [...(timeFrame.value?.dateRange ?? [])];
      parameter.alarmLevelCode = level.levelCode;
      alarmModalShow.value = true;
    };

    onMounted(() => {
      void getAlarmLevel();
    });

    const renderDateForm = (): JSX.Element => (
      <div class="header-toolbar" data-no-zoom>
        <DateInlineForm
          modelValue={timeFrame.value}
          onUpdate:modelValue={(v) => {
            timeFrame.value = v;
          }}
          onSearch={getAlarmLevel}
        />
      </div>
    );

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
          <div class={styles.analysisSurface}>
            <div class={styles.chartWrap}>
              <ElevatorAnalysisPie pieData={pieData.value} onClickbar={openLevelModal}>
                <div class={styles.pieCenterValue}>
                  <CountTo startVal={0} endVal={totalCount.value} separator="" duration={2000} />
                </div>
                <div class={styles.pieCenterLabel}>报警总数</div>
              </ElevatorAnalysisPie>
            </div>
            <div class={styles.levelList}>
              {pieData.value.map((item) => (
                <button
                  key={`${isZoom ? "zoom-" : ""}${item.name}`}
                  type="button"
                  class={styles.levelItem}
                  onClick={() => openLevelModal(item)}
                >
                  <span class={styles.levelName}>
                    <i class={styles.levelColor} style={{ background: item.color }} />
                    <span class={styles.levelNameText} title={item.name}>
                      {item.name}
                    </span>
                  </span>
                  <span class={styles.levelCount}>
                    {item.value}
                    <em class={styles.levelUnit}>次</em>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title={props.title}
            class={`${UNIVERSAL_PANEL_V2_CLASS} alarm-level-v2-panel`}
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
        <ModalAlarmTableNew showModal={alarmModalShow.value} onClose={() => (alarmModalShow.value = false)} parameter={parameter} />
      </>
    );
  },
});

export default AlarmLevel;
