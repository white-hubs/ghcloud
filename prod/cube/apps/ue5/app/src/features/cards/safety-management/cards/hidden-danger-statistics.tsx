import moment from "moment";
import { computed, defineComponent, onMounted, reactive, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import HiddenDangerTable from "@/features/cards/safety-management/components/hidden-danger-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { hiddenNumStatistics, hiddenTypeStatistics } from "@/infrastructure/api/maintain";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import "./hidden-danger-statistics.module.less";
import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";

const totalIcon = getThemeImage("alarm-count.png");
const processingIcon = getThemeImage("alarm-count-unhandled.png");
const finishedIcon = getThemeImage("alarm-count-handled.png");

type HiddenDangerTypeItem = {
  name: string;
  value: number;
  color: string;
};

type HiddenDangerStatItem = {
  label: string;
  value: number;
  status: string;
  className: string;
  icon: string;
};

export const HiddenDangerStatistics = defineComponent({
  name: "HiddenDangerStatistics",
  props: {
    title: {
      type: String,
      default: "隐患统计",
    },
  },
  setup(props) {
    const eventTime = ref({
      timeType: "THIS_YEAR",
      dateRange: [moment().startOf("year").format("YYYY-MM-DD 00:00:00"), moment().endOf("year").format("YYYY-MM-DD HH:mm:ss")],
    });

    const hiddenSummary = reactive({
      total: 0,
      finished: 0,
      inHand: 0,
    });

    const detectionData = ref<HiddenDangerTypeItem[]>([]);
    const showModal = ref(false);
    const parameter = reactive({
      type: "",
      status: "",
      submitTime: "",
    });
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const statItems = computed<HiddenDangerStatItem[]>(() => [
      { label: "隐患总数", value: hiddenSummary.total, status: "", className: "is-total", icon: totalIcon },
      { label: "处理中", value: hiddenSummary.inHand, status: "ACTIVE", className: "is-processing", icon: processingIcon },
      { label: "已完成", value: hiddenSummary.finished, status: "FINISHED", className: "is-finished", icon: finishedIcon },
    ]);

    const hasTypeData = computed(() => detectionData.value.length > 0);

    const resolvePeriod = (): string => {
      const range = eventTime.value.dateRange;
      if (range?.[0] && range?.[1]) return `${range[0]},${range[1]}`;
      return `${moment().startOf("year").format("YYYY-MM-DD 00:00:00")},${moment().endOf("year").format("YYYY-MM-DD HH:mm:ss")}`;
    };

    const alarmEventTop = async (): Promise<void> => {
      try {
        const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
        const period = resolvePeriod();
        const res = await hiddenNumStatistics({ period });
        const data = await hiddenTypeStatistics({ period });
        hiddenSummary.total = Number(res?.total || 0);
        hiddenSummary.finished = Number(res?.finished || 0);
        hiddenSummary.inHand = Number(res?.inHand || 0);
        const list = Array.isArray(data?.typeStatisticsList) ? data.typeStatisticsList : [];
        detectionData.value = list.map((item: { name?: string; num?: number }, index: number) => ({
          name: item.name || "--",
          value: Number(item.num || 0),
          color: colors[index % colors.length],
        }));
      } catch {
        hiddenSummary.total = 0;
        hiddenSummary.finished = 0;
        hiddenSummary.inHand = 0;
        detectionData.value = [];
      } finally {
        loaded.value = true;
      }
    };

    const openHiddenDangerModal = (status = "", type = "ALL"): void => {
      parameter.type = type;
      parameter.status = status;
      parameter.submitTime = resolvePeriod();
      showModal.value = true;
    };

    const stopPanelPointerEvent = (event: Event): void => {
      event.stopPropagation();
    };

    const handleKeyboardOpen = (event: KeyboardEvent, open: () => void): void => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      event.stopPropagation();
      open();
    };

    onMounted(() => {
      void alarmEventTop();
    });

    const renderStats = (): JSX.Element => (
      <div class="hidden-danger-v2-stats" data-no-zoom>
        {statItems.value.map((item) => (
          <div
            role="button"
            tabindex={0}
            data-no-zoom
            class={["hidden-danger-stat-card", item.className]}
            key={item.label}
            onPointerdown={stopPanelPointerEvent}
            onClick={(event) => {
              event.stopPropagation();
              openHiddenDangerModal(item.status);
            }}
            onKeydown={(event) => {
              handleKeyboardOpen(event, () => openHiddenDangerModal(item.status));
            }}
          >
            <span class="hidden-danger-stat-icon" aria-hidden="true">
              <img src={item.icon} alt="" />
            </span>
            <span class="hidden-danger-stat-content">
              <span class="hidden-danger-stat-label">{item.label}</span>
              <span class="hidden-danger-stat-value">
                <CountTo startVal={0} endVal={item.value} separator="" duration={1200} />
              </span>
            </span>
          </div>
        ))}
      </div>
    );

    const renderLegend = (isZoom: boolean): JSX.Element => (
      <div class={["hidden-danger-v2-legend", isZoom ? "is-zoom" : ""]}>
        {detectionData.value.map((item) => (
          <div data-no-zoom class="hidden-danger-v2-legend-item" key={item.name}>
            <span class="hidden-danger-v2-legend-left">
              <i class="hidden-danger-v2-dot" style={{ backgroundColor: item.color }} />
              <span class="hidden-danger-v2-name" title={item.name}>
                {item.name}
              </span>
            </span>
            <span class="hidden-danger-v2-value">{item.value}</span>
          </div>
        ))}
      </div>
    );

    const renderChart = (isZoom: boolean): JSX.Element => (
      <div class={["hidden-danger-v2-chart-row", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : hasTypeData.value ? (
          <>
            <div class={["hidden-danger-v2-pie-wrap", isZoom ? "is-zoom" : ""]}>
              <ElevatorAnalysisPie class="hidden-danger-v2-pie" pie-class="hidden-danger-v2-pie-chart" pieData={detectionData.value}>
                <div class="hidden-danger-v2-pie-center">
                  <div class="hidden-danger-v2-pie-value">
                    <CountTo startVal={0} endVal={hiddenSummary.total} separator="" duration={1200} />
                  </div>
                  <div class="hidden-danger-v2-pie-label">隐患总数</div>
                </div>
              </ElevatorAnalysisPie>
            </div>
            {renderLegend(isZoom)}
          </>
        ) : (
          <div class={["hidden-danger-v2-empty", isZoom ? "is-zoom" : ""]}>
            <NoData />
          </div>
        )}
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["hidden-danger-v2-body", isZoom ? "is-zoom" : ""]}>
        {renderStats()}
        {renderChart(isZoom)}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root hidden-danger-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme hidden-danger-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={720}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-hidden-danger" />,
            extra: () => (
              <div class="access-control-header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={eventTime.value}
                  onUpdate:modelValue={(value) => {
                    eventTime.value = value;
                  }}
                  onSearch={alarmEventTop}
                />
              </div>
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
        <HiddenDangerTable
          showModal={showModal.value}
          onClose={() => {
            showModal.value = false;
          }}
          parameter={{ ...parameter }}
        />
      </div>
    );
  },
});

export default HiddenDangerStatistics;
