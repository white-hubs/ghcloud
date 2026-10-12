import { computed, defineComponent, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import ModalWorkTable from "@/features/cards/security-overview/components/modal-work-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeMaintainStatisticsService } from "@/infrastructure/api/service";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";

import "./work-order-statistics.module.less";

type WorkOrderTypeItem = {
  name: string;
  value: number;
  ratio: number;
  color: string;
  application: string;
};

type WorkOrderSummaryItem = {
  label: string;
  value: number;
  className: string;
  application: string;
};

export const OperationWorkOrderStatistics = defineComponent({
  name: "OperationWorkOrderStatistics",
  setup() {
    const timeRange = ref({
      timeType: "THIS_MONTH",
      dateRange: [] as string[],
    });

    const orderData = ref<WorkOrderTypeItem[]>([]);
    const totalReservations = ref(0);
    const workModalShow = ref(false);
    const workParameter = ref<Record<string, any>>({});

    const hasData = computed(() => orderData.value.some((item) => Number(item.value) > 0));

    const summaryItems = computed<WorkOrderSummaryItem[]>(() => [
      { label: "工单总数", value: totalReservations.value, className: "is-total", application: "" },
      { label: "故障工单", value: orderData.value[0]?.value ?? 0, className: "is-fault", application: "FAULT" },
      { label: "维保作业", value: orderData.value[1]?.value ?? 0, className: "is-maintenance", application: "MAINTENANCE" },
      { label: "日常巡检", value: orderData.value[2]?.value ?? 0, className: "is-inspection", application: "INSPECTION" },
    ]);

    const formatRatio = (ratio: number): string => {
      const normalizedRatio = Number(ratio || 0);
      return `${normalizedRatio > 1 ? normalizedRatio.toFixed(1) : (normalizedRatio * 100).toFixed(1)}%`;
    };

    const updateStatistics = async (): Promise<void> => {
      const colors = ["#F59E0B", "#10B981", "#3B82F6"];
      const result = await cubeMaintainStatisticsService.getTicketStatistics({
        type: timeRange.value.timeType,
        period: timeRange.value.dateRange.join(","),
      });
      totalReservations.value = Number(result?.total || 0);
      orderData.value = [
        {
          name: "故障工单",
          value: Number(result?.faultNum || 0),
          ratio: Number(result?.faultRate || 0),
          color: colors[0],
          application: "FAULT",
        },
        {
          name: "维保作业",
          value: Number(result?.maintenanceNum || 0),
          ratio: Number(result?.maintenanceRate || 0),
          color: colors[1],
          application: "MAINTENANCE",
        },
        {
          name: "日常巡检",
          value: Number(result?.inspectNum || 0),
          ratio: Number(result?.inspectRate || 0),
          color: colors[2],
          application: "INSPECTION",
        },
      ];
    };

    const openWorkModal = (item?: Pick<WorkOrderSummaryItem, "application">): void => {
      workParameter.value = {
        application: item?.application ?? "",
        period: timeRange.value.dateRange?.join(",") ?? "",
      };
      workModalShow.value = true;
    };

    const renderSummary = (): JSX.Element => (
      <div class="shanghai-work-order-v2-summary-grid" data-no-zoom>
        {summaryItems.value.map((item) => (
          <button
            type="button"
            class={["shanghai-work-order-v2-summary-card", item.className]}
            key={item.label}
            onClick={(event) => {
              event.stopPropagation();
              openWorkModal(item);
            }}
          >
            <span class="shanghai-work-order-v2-summary-label">{item.label}</span>
            <span class="shanghai-work-order-v2-summary-value">
              <CountTo startVal={0} endVal={item.value} separator="" duration={1200} />
            </span>
          </button>
        ))}
      </div>
    );

    const renderLegend = (isZoom: boolean): JSX.Element => (
      <div class={["shanghai-work-order-v2-legend", isZoom ? "is-zoom" : ""]}>
        {orderData.value.map((item) => (
          <button
            type="button"
            class="shanghai-work-order-v2-legend-item"
            key={item.name}
            onClick={(event) => {
              event.stopPropagation();
              openWorkModal(item);
            }}
          >
            <span class="shanghai-work-order-v2-legend-left">
              <i class="shanghai-work-order-v2-dot" style={{ backgroundColor: item.color }} />
              <span class="shanghai-work-order-v2-name" title={item.name}>
                {item.name}
              </span>
            </span>
            <span class="shanghai-work-order-v2-legend-right">
              <strong>{item.value}</strong>
              <em>{formatRatio(item.ratio)}</em>
            </span>
          </button>
        ))}
      </div>
    );

    const renderChart = (isZoom: boolean): JSX.Element => (
      <div class={["shanghai-work-order-v2-chart-row", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {hasData.value ? (
          <>
            <div class={["shanghai-work-order-v2-pie-wrap", isZoom ? "is-zoom" : ""]}>
              <ElevatorAnalysisPie
                class="shanghai-work-order-v2-pie"
                pie-class="shanghai-work-order-v2-pie-chart"
                pieData={orderData.value}
              >
                <div class="shanghai-work-order-v2-pie-center">
                  <div class="shanghai-work-order-v2-pie-value">
                    <CountTo startVal={0} endVal={totalReservations.value} separator="" duration={1200} />
                  </div>
                  <div class="shanghai-work-order-v2-pie-label">工单总数</div>
                </div>
              </ElevatorAnalysisPie>
            </div>
            {renderLegend(isZoom)}
          </>
        ) : (
          <div class={["shanghai-work-order-v2-empty", isZoom ? "is-zoom" : ""]}>
            <NoData />
          </div>
        )}
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["shanghai-work-order-v2-body", isZoom ? "is-zoom" : ""]}>
        {renderSummary()}
        {renderChart(isZoom)}
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root shanghai-work-order-v2-root">
          <SubPanelTemplate
            title="运维工单统计"
            class="visual-v2-sub-panel v2-panel-card shanghai-work-order-v2-panel"
            zoomable
            zoom-title="运维工单统计详情"
            zoom-width={720}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="overview-work-order" />,
              extra: () => (
                <DateInlineForm
                  modelValue={timeRange.value}
                  onUpdate:modelValue={(value) => {
                    timeRange.value = value;
                  }}
                  onSearch={updateStatistics}
                  timeList={[
                    { label: "本周", value: "THIS_WEEK" },
                    { label: "本月", value: "THIS_MONTH" },
                    { label: "今年", value: "THIS_YEAR" },
                  ]}
                  data-no-zoom
                />
              ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalWorkTable
          showModal={workModalShow.value}
          parameter={workParameter.value}
          onClose={() => {
            workModalShow.value = false;
          }}
        />
      </>
    );
  },
});

export default OperationWorkOrderStatistics;
