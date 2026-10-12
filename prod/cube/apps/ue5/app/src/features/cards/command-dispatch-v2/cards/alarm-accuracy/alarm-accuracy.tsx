import { defineComponent, onMounted, ref, provide } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { deviceTagGroupSearch } from "@/infrastructure/api/alarm";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./alarm-accuracy.module.less";

const titleIcon = getThemeImage("alarm-accuracy-rate.png");

const TAG_LABEL: Record<string, string> = {
  "builtin.app::SECURITY_MONITORING": "安防监控",
  "builtin.app::ELECTRICMANAGE": "电气安全",
  "builtin.app::FIRECONTROL": "消防安全",
  "builtin.app::GAS_MANAGEMENT": "用气安全",
  "builtin.app::ROTATINGMANAGE": "动环监控",
};

const ACCENT_COLORS = ["#3f8fe8", "#26c2bc", "#faad14", "#3ecf8e", "#5b9ce2"];

const DEVICE_TAGS = Object.keys(TAG_LABEL);

type AccuracyItem = {
  name: string;
  value: number;
  accentColor: string;
};

const clampPercent = (value: number): number => Math.max(0, Math.min(Number(value) || 0, 100));

export const AlarmAccuracy = defineComponent({
  name: "AlarmAccuracy",
  setup() {
    const { globalState } = useStateStore();
    const alarmtimeType = ref({
      timeType: "THIS_YEAR",
      dateRange: [] as string[],
    });
    const contentList = ref<AccuracyItem[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const changeDate = async (): Promise<void> => {
      try {
        const res = await deviceTagGroupSearch({
          areaId: globalState.business.currentAreaId,
          type: alarmtimeType.value.timeType,
          period: alarmtimeType.value.dateRange.join(","),
          deviceTags: DEVICE_TAGS,
        });
        contentList.value = (Array.isArray(res) ? res : []).map((item: { code: string; ratio: number }, index: number) => ({
          name: TAG_LABEL[item.code] || item.code,
          value: Number(item.ratio) || 0,
          accentColor: ACCENT_COLORS[index % ACCENT_COLORS.length],
        }));
      } catch {
        contentList.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void changeDate();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : contentList.value.length === 0 ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <div class={styles.metricPanel}>
            {contentList.value.map((item) => (
              <div class={styles.metricRow} key={`${isZoom ? "zoom-" : ""}${item.name}`}>
                <div class={styles.rowBody}>
                  <div class={styles.rowHead}>
                    <span class={styles.rowLabel}>{item.name}</span>
                    <span class={styles.rowValue}>
                      <CountTo startVal={0} endVal={Number(item.value)} separator="" duration={1600} />
                      <span class={styles.rowUnit}>%</span>
                    </span>
                  </div>
                  <div class={styles.rowTrack}>
                    <div
                      class={styles.rowFill}
                      style={{
                        width: `${clampPercent(item.value)}%`,
                        background: item.accentColor,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="报警正确率"
          class="visual-v2-sub-panel v2-panel-card cmd-alarm-accuracy-v2-panel"
          zoomable
          zoom-title="报警正确率详情"
          zoom-width={720}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class={styles.titleIcon} />,
            extra: () => (
              <DateInlineForm
                modelValue={alarmtimeType.value}
                onUpdate:modelValue={(v) => {
                  alarmtimeType.value = v;
                }}
                onSearch={changeDate}
                data-no-zoom
              />
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default AlarmAccuracy;
