import { computed, defineComponent, onMounted, reactive, ref, watch, provide } from "vue";

import UniversalPanelCardIcon from "@/features/cards/universal-panel/_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS, universalPanelZoomClass } from "@/features/cards/universal-panel/_shared/universal-panel-v2";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsLevel } from "@/infrastructure/api/alarm";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "@/features/cards/universal-panel/_shared/universal-panel-v2-shared.less";

import styles from "./lift-alarm-level-stats.module.less";

type AlarmLevelItem = {
  name: string;
  value: number;
  color: string;
  percent: number;
};

// 与图的“报警等级”语义一致：红/琥珀/蓝/紫
const levelColors = ["#f14545", "#ffab10", "#2f8dff", "#655dd1", "#19b9d1", "#39b86b"];
const levelNames = ["一级报警", "二级报警", "三级报警", "四级报警", "五级报警", "六级报警"];

export const LiftAlarmLevelStats = defineComponent({
  name: "LiftAlarmLevelStats",
  setup() {
    const { globalState } = useStateStore();
    const { currentTheme } = useVisualTheme();
    const isMinimalWhite = computed(() => currentTheme.value === "minimal-white");

    const timeFrame = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });

    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const total = ref(0);
    const list = ref<AlarmLevelItem[]>([]);

    const defaultList: AlarmLevelItem[] = levelNames.map((name, index) => ({
      name,
      value: 0,
      color: levelColors[index],
      percent: 0,
    }));

    const getAlarmLevel = async (): Promise<void> => {
      loaded.value = false;
      total.value = 0;
      list.value = [...defaultList];
      try {
        const params = reactive({
          sceneType: globalState.business.currentMenu,
          areaId: globalState.business.currentAreaId,
          period: timeFrame.value.dateRange.join(","),
          type: timeFrame.value.timeType,
        });
        const res: any[] = await statisticsLevel(params);
        const rows = Array.isArray(res) ? res : [];

        const mapped = rows.map((item: any, index: number) => {
          const value = Number(item.alarmNum) || 0;
          total.value += value;
          const rawName = String(item.name ?? "");
          const name = rawName.includes("报警") ? rawName : `${rawName}报警`;
          return {
            name,
            value,
            color: levelColors[index % levelColors.length],
            percent: 0,
          } as AlarmLevelItem;
        });

        if (mapped.length > 0) {
          const base = mapped.reduce((sum, item) => sum + item.value, 0) || 1;
          list.value = defaultList.map((defaultItem, index) => {
            const item = mapped[index];
            return item ? { ...item, color: defaultItem.color, percent: Math.round((item.value / base) * 1000) / 10 } : { ...defaultItem };
          });
        } else {
          // 接口返回空数组时仍展示结构（全 0）
          list.value = [...defaultList];
          total.value = 0;
        }
      } catch {
        loaded.value = true;
        list.value = [...defaultList];
        total.value = 0;
      } finally {
        loaded.value = true;
      }
    };

    watch(
      () => globalState.business.currentAreaId,
      () => {
        void getAlarmLevel();
      },
    );

    onMounted(() => {
      void getAlarmLevel();
    });

    const renderDateForm = (): JSX.Element => (
      <div class={styles.headerToolbar} data-no-zoom>
        <DateInlineForm
          modelValue={timeFrame.value}
          onUpdate:modelValue={(v) => {
            timeFrame.value = v;
          }}
          onSearch={getAlarmLevel}
        />
      </div>
    );

    const hasData = computed(() => loaded.value && list.value.length > 0);

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        class={["up-card-body", styles.cardBody, isZoom ? styles.zoomBody : "", ...(isZoom ? universalPanelZoomClass : [])]}
        data-no-zoom
      >
        {!hasData.value ? (
          !loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : (
            <div class={["up-empty", styles.isEmpty]}>
              <NoData />
            </div>
          )
        ) : (
          <div class={styles.analysisSurface}>
            <div class={styles.chartWrap}>
              <ElevatorAnalysisPie
                pieData={list.value}
                radius={isMinimalWhite.value ? "78" : "75"}
                ringVariant={isMinimalWhite.value ? "clean" : "default"}
              >
                <div class={styles.pieCenterValue}>
                  <CountTo startVal={0} endVal={total.value} separator="" duration={2000} />
                </div>
                <div class={styles.pieCenterLabel}>报警总数</div>
              </ElevatorAnalysisPie>
            </div>

            <div class={styles.statusList}>
              {list.value.map((item) => (
                <div class={styles.statusItem} key={item.name}>
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
                    <span class={styles.statusShare}>占比 {item.percent}%</span>
                  </span>
                </div>
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
            title="报警等级统计"
            class={`${UNIVERSAL_PANEL_V2_CLASS} lift-alarm-level-stats-v2-panel`}
            zoomable
            zoom-title="报警等级统计详情"
            zoom-width={760}
            v-slots={{
              titleIcon: () => <UniversalPanelCardIcon name="trend" />,
              extra: () => renderDateForm(),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
      </>
    );
  },
});

export default LiftAlarmLevelStats;
