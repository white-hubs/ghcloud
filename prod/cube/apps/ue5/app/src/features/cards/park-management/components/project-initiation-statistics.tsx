import moment from "moment";
import { computed, defineComponent, onMounted, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { projectManagementPage } from "@/infrastructure/api/youxianqu-park";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "../cards/park-management-v2-shared.module.less";
import "./project-initiation-statistics.module.less";

/** 对齐 legacy：本周 / 本月 / 今年 */
const TIME_LIST = [
  { label: "本周", value: "THIS_WEEK" },
  { label: "本月", value: "THIS_MONTH" },
  { label: "今年", value: "THIS_YEAR" },
];

type PieItem = { name: string; value: number; color: string; rate: number; className: string };

const COLORS = {
  approved: "#29C2FF",
  pending: "#FFAB10",
};

const buildBuiltinRange = (timeType: string): string[] => {
  const fmt = "YYYY-MM-DD HH:mm:ss";
  if (timeType === "THIS_WEEK") {
    return [moment().startOf("week").add(1, "days").format("YYYY-MM-DD 00:00:00"), moment().endOf("week").add(1, "days").format(fmt)];
  }
  if (timeType === "THIS_MONTH") {
    return [moment().startOf("month").format("YYYY-MM-DD 00:00:00"), moment().endOf("month").format(fmt)];
  }
  return [moment().startOf("year").format("YYYY-MM-DD 00:00:00"), moment().endOf("year").format(fmt)];
};

export const ProjectInitiationStatistics = defineComponent({
  name: "ProjectInitiationStatistics",
  props: {
    title: { type: String, required: false, default: "项目立项统计" },
  },
  setup(props) {
    const topTimeFrame = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: buildBuiltinRange("THIS_YEAR"),
    });
    const approved = ref(0);
    const pending = ref(0);

    const total = computed(() => approved.value + pending.value);

    const pieData = computed<PieItem[]>(() => {
      const sum = total.value;
      const approvedRate = sum > 0 ? Math.round((approved.value / sum) * 1000) / 10 : 0;
      const pendingRate = sum > 0 ? Math.round((pending.value / sum) * 1000) / 10 : 0;
      return [
        { name: "已立项", value: approved.value, color: COLORS.approved, rate: approvedRate, className: "is-approved" },
        { name: "未立项", value: pending.value, color: COLORS.pending, rate: pendingRate, className: "is-pending" },
      ];
    });

    /** 对齐 legacy：period = dateRange.join(",")；foundStatus 0=未立项 / 1=已立项 */
    const resolvePeriod = (): string => {
      const range = topTimeFrame.value.dateRange;
      if (range?.[0] && range?.[1]) return `${range[0]},${range[1]}`;
      const fallback = buildBuiltinRange(topTimeFrame.value.timeType || "THIS_YEAR");
      return `${fallback[0]},${fallback[1]}`;
    };

    const changeTopTimeFrame = async (): Promise<void> => {
      try {
        const period = resolvePeriod();
        const [notYetApproved, projectApproved] = await Promise.all([
          projectManagementPage({ foundStatus: 0, period }),
          projectManagementPage({ foundStatus: 1, period }),
        ]);
        pending.value = Number(notYetApproved?.total) || 0;
        approved.value = Number(projectApproved?.total) || 0;
      } catch {
        pending.value = 0;
        approved.value = 0;
      }
    };

    onMounted(() => {
      void changeTopTimeFrame();
    });

    const renderLegend = (): JSX.Element => (
      <div class="park-manage-legend">
        {pieData.value.map((item) => (
          <div class="park-manage-legend-item" key={item.name}>
            <span class="park-manage-legend-left">
              <i class="park-manage-legend-dot" style={{ backgroundColor: item.color }} />
              <span class="park-manage-legend-name" title={item.name}>
                {item.name}
              </span>
            </span>
            <span class="park-manage-legend-value">
              {item.value}
              <span class="park-manage-legend-pct">占比 {item.rate}%</span>
            </span>
          </div>
        ))}
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["park-manage-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class="park-manage-metric-grid" data-no-zoom>
          {pieData.value.map((item) => (
            <div class={["park-manage-metric-card", item.className]} key={item.name}>
              <span class="park-manage-metric-label">{item.name}</span>
              <span class="park-manage-metric-value">
                <CountTo startVal={0} endVal={item.value} duration={1600} separator="" />
              </span>
            </div>
          ))}
        </div>
        <div class={["park-manage-pie-row", isZoom ? "is-zoom" : ""]} data-no-zoom>
          <div class={["park-manage-pie-wrap", isZoom ? "is-zoom" : ""]}>
            <ElevatorAnalysisPie class="park-manage-pie" pie-class="park-manage-pie-chart" pieData={pieData.value}>
              <div class="park-manage-pie-center">
                <div class="park-manage-pie-value">
                  <CountTo startVal={0} endVal={total.value} separator="" duration={1600} />
                </div>
                <div class="park-manage-pie-label">项目总数</div>
              </div>
            </ElevatorAnalysisPie>
          </div>
          {renderLegend()}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root park-manage-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme park-manage-v2-panel project-init-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={760}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="asset-management-status" />,
            extra: () => (
              <div class="access-control-header-toolbar" data-no-zoom>
                <DateInlineForm
                  timeList={TIME_LIST}
                  modelValue={topTimeFrame.value}
                  onUpdate:modelValue={(v: ModelValueItf) => {
                    topTimeFrame.value = {
                      timeType: v.timeType,
                      dateRange: v.dateRange?.length ? v.dateRange : buildBuiltinRange(v.timeType || "THIS_YEAR"),
                    };
                  }}
                  onSearch={changeTopTimeFrame}
                />
              </div>
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default ProjectInitiationStatistics;
