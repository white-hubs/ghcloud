import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import PassageRecordsTable from "@/features/cards/access-control/components/passage-records-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { trafficAnalysis } from "@/infrastructure/utils/requestData/accessControl";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./access-control-situation.module.less";

/** 对齐「视频巡逻统计 / 报警处理情况」：主题图标 + 纵向指标行 + 进度条 */
const totalIcon = getThemeImage("alarm-count.png");
const normalIcon = getThemeImage("alarm-count-handled.png");
const abnormalIcon = getThemeImage("alarm-count-unhandled.png");

const TONE_COLOR = {
  total: "#5b9ce2",
  normal: "#3ecf8e",
  abnormal: "#ffab10",
} as const;

type MetricKey = keyof typeof TONE_COLOR;

type MetricItem = {
  key: MetricKey;
  label: string;
  value: number;
  percent: number;
  icon: string;
  color: string;
  toneClass: string;
  eventResult: string;
};

export const AccessControlSituation = defineComponent({
  name: "AccessControlSituation",
  setup() {
    const trendTime = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
    const showModal = ref(false);
    const totals = reactive({
      total: 0,
      abnormal: 0,
      normal: 0,
    });
    const trafficParams = reactive({
      date: [] as string[],
      eventResult: "",
    });

    const metricRows = computed<MetricItem[]>(() => {
      const base = Math.max(totals.total, totals.normal + totals.abnormal, 1);
      return [
        {
          key: "total",
          label: "通行总数",
          value: totals.total,
          percent: 100,
          icon: totalIcon,
          color: TONE_COLOR.total,
          toneClass: styles.isTotal,
          eventResult: "",
        },
        {
          key: "normal",
          label: "正常通行",
          value: totals.normal,
          percent: Math.round((totals.normal / base) * 1000) / 10,
          icon: normalIcon,
          color: TONE_COLOR.normal,
          toneClass: styles.isNormal,
          eventResult: "DO_PASS",
        },
        {
          key: "abnormal",
          label: "异常通行",
          value: totals.abnormal,
          percent: Math.round((totals.abnormal / base) * 1000) / 10,
          icon: abnormalIcon,
          color: TONE_COLOR.abnormal,
          toneClass: styles.isAbnormal,
          eventResult: "DO_REFUSE",
        },
      ];
    });

    const resolveByLabel = (arr: Array<{ label?: string; value?: number }>, keywords: string[]): number => {
      const hit = arr.find((item) => keywords.some((key) => String(item.label ?? "").includes(key)));
      return Number(hit?.value) || 0;
    };

    const getTemplateData = async (): Promise<void> => {
      try {
        const res = await trafficAnalysis(trendTime.value.timeType);
        const arr = Array.isArray(res?.arr) ? res.arr : [];
        totals.total = Number(res?.total) || 0;
        totals.normal = resolveByLabel(arr, ["正常", "通过", "允许"]) || Number(arr[0]?.value) || 0;
        totals.abnormal = resolveByLabel(arr, ["异常", "拒绝"]) || Number(arr[1]?.value) || 0;
        if (!totals.total && (totals.normal || totals.abnormal)) {
          totals.total = totals.normal + totals.abnormal;
        }
      } catch {
        totals.total = 0;
        totals.normal = 0;
        totals.abnormal = 0;
      }
    };

    const openRecords = (item: MetricItem): void => {
      trafficParams.eventResult = item.eventResult;
      trafficParams.date = [...(trendTime.value.dateRange ?? [])];
      showModal.value = true;
    };

    onMounted(() => {
      void getTemplateData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["access-control-situation-v2-panel", styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={[styles.metricPanel, isZoom ? styles.isZoomPanel : ""]}>
          {metricRows.value.map((item) => (
            <button
              type="button"
              class={[styles.metricRow, item.toneClass]}
              key={`${isZoom ? "zoom-" : ""}${item.key}`}
              onClick={() => openRecords(item)}
            >
              <div class={styles.rowIcon} aria-hidden="true">
                <img src={item.icon} alt="" />
              </div>
              <div class={styles.rowBody}>
                <div class={styles.rowHead}>
                  <span class={styles.rowLabel}>{item.label}</span>
                  <span class={styles.rowValue}>
                    <CountTo startVal={0} endVal={item.value} separator="" duration={1600} />
                    <span class={styles.rowUnit}>{item.key === "total" ? "次" : `占比 ${item.percent}%`}</span>
                  </span>
                </div>
                <div class={styles.rowTrack}>
                  <div
                    class={styles.rowFill}
                    style={{
                      width: `${Math.max(item.percent > 0 ? item.percent : 0, item.value > 0 ? 4 : 0)}%`,
                      background: `linear-gradient(90deg, ${item.color}, ${item.color}aa)`,
                    }}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="门禁通行情况"
            class="visual-v2-sub-panel v2-panel-card access-control-situation-v2-panel"
            zoomable
            zoom-title="门禁通行情况详情"
            zoom-width={760}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="access-control-people" />,
              extra: () => (
                <div class={styles.headerToolbar} data-no-zoom>
                  <DateInlineForm
                    modelValue={trendTime.value}
                    onUpdate:modelValue={(v) => {
                      trendTime.value = v;
                    }}
                    onSearch={getTemplateData}
                  />
                </div>
              ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <PassageRecordsTable
          showModal={showModal.value}
          parameter={trafficParams}
          onClose={() => {
            showModal.value = false;
          }}
        />
      </>
    );
  },
});

export default AccessControlSituation;
