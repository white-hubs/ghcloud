import moment from "moment";
import { defineComponent, onMounted, reactive } from "vue";
import { CountTo } from "vue3-count-to";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { depTaskExecutionAnalysis } from "@/infrastructure/api/maintain";
import { getThemeImage } from "@/infrastructure/utils/getImage";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "../overview-v2-shared.module.less";
import "./patrol-situation.module.less";

const patrolTotalIcon = getThemeImage("device-total.png");

type MetricItem = {
  label: string;
  value: number;
  color: string;
  cardClass: string;
};

export const PatrolSituation = defineComponent({
  name: "PatrolSituation",
  setup() {
    const analysis = reactive({
      title: "巡检总数",
      total: 0,
      itemize: [
        { label: "任务总数", value: 0, color: "#2F8DFF", cardClass: "is-total" },
        { label: "超时任务数", value: 0, color: "#FFAB10", cardClass: "is-overtime" },
        { label: "过期任务数", value: 0, color: "#F14545", cardClass: "is-expired" },
        { label: "异常任务数", value: 0, color: "#FFC700", cardClass: "is-abnormal" },
      ] as MetricItem[],
    });

    const loadData = async (): Promise<void> => {
      try {
        const res = await depTaskExecutionAnalysis({
          period: [moment().format("YYYY-MM-DD 00:00:00"), moment().format("YYYY-MM-DD HH:mm:ss")].join(","),
        });
        analysis.itemize[0].value = Number(res?.totalTaskNum) || 0;
        analysis.itemize[1].value = Number(res?.overTimeTaskNum) || 0;
        analysis.itemize[2].value = Number(res?.expiredTaskNum) || 0;
        analysis.itemize[3].value = Number(res?.abnormalTaskNum) || 0;
        analysis.total = Number(res?.totalTaskNum) || 0;
      } catch {
        analysis.total = 0;
        analysis.itemize.forEach((item) => {
          item.value = 0;
        });
      }
    };

    onMounted(() => {
      void loadData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["overview-v2-body", "patrol-situation-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class="patrol-situation-total-card" data-no-zoom>
          <span class="patrol-situation-total-icon">
            <img src={patrolTotalIcon} alt="" />
          </span>
          <span class="overview-v2-stat-main">
            <CountTo startVal={0} endVal={analysis.total} duration={1200} class="overview-v2-stat-value" />
            <span class="overview-v2-stat-label">{analysis.title}</span>
          </span>
        </div>

        <div class="overview-v2-summary-grid is-two" data-no-zoom>
          {analysis.itemize.map((item) => (
            <div class={["overview-v2-stat-card", "patrol-situation-metric-card", item.cardClass]} key={item.label}>
              <div class="overview-v2-stat-main">
                <CountTo startVal={0} endVal={item.value} duration={1200} class="overview-v2-stat-value" />
                <div class="overview-v2-stat-label">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="overview-v2-root">
        <SubPanelTemplate
          title="巡查态势"
          class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme overview-v2-panel patrol-situation-v2-panel"
          zoomable
          zoom-title="巡查态势详情"
          zoom-width={620}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-patrol" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default PatrolSituation;
