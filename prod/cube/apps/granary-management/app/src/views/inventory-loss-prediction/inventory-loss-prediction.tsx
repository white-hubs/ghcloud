import { Select } from "ant-design-vue";
import * as echarts from "echarts";
import { computed, defineComponent, onMounted, onUnmounted, ref, watch, type VNode } from "vue";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { Button } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { INVENTORY_LOSS_MOCK, type InventoryLossDetailRow, type InventoryLossRangeKey } from "./mock";

import "./inventory-loss-prediction.less";

type LossChartMode = "weight" | "rate";

const rangeOptions: Array<{ label: string; value: InventoryLossRangeKey }> = [
  { label: "近30天", value: "30d" },
  { label: "近90天", value: "90d" },
  { label: "近1年", value: "1y" },
  { label: "入库至今", value: "all" },
];

const chartModeOptions: Array<{ label: string; value: LossChartMode }> = [
  { label: "损耗重量", value: "weight" },
  { label: "损耗率", value: "rate" },
];

const riskClassMap: Record<InventoryLossDetailRow["risk"], string> = {
  high: "is-high",
  medium: "is-medium",
  low: "is-low",
};

const formatWeight = (value: number): string => {
  return Number.isInteger(value) ? `${value}吨` : `${value.toFixed(1)}吨`;
};

const formatLossWeight = (value: number): string => {
  return Number.isInteger(value) ? `${value}吨` : `${value.toFixed(1)}吨`;
};

export const InventoryLossPrediction = defineComponent({
  name: "InventoryLossPrediction",
  setup: () => {
    const { pageTitle } = usePageName();
    const selectedWarehouse = ref(INVENTORY_LOSS_MOCK.currentWarehouse);
    const selectedBatch = ref(INVENTORY_LOSS_MOCK.currentBatch);
    const selectedRange = ref<InventoryLossRangeKey>("90d");
    const chartMode = ref<LossChartMode>("weight");
    const trendChartRef = ref<HTMLDivElement | null>(null);
    const shareChartRef = ref<HTMLDivElement | null>(null);
    const trendChart = ref<echarts.ECharts | null>(null);
    const shareChart = ref<echarts.ECharts | null>(null);

    const trendPoints = computed(() => INVENTORY_LOSS_MOCK.trendPoints[selectedRange.value]);
    const mainLossType = computed(() => INVENTORY_LOSS_MOCK.typeShares[0]);

    const renderTrendChart = (): void => {
      if (trendChart.value == null) {
        return;
      }
      const points = trendPoints.value;
      const option: echarts.EChartsOption = {
        color: ["#64b5f6", "#f6a400", "#ff4d4f", "#1890ff"],
        grid: { top: 34, left: 46, right: 100, bottom: 44, containLabel: true },
        legend: {
          bottom: 0,
          left: 0,
          itemWidth: 12,
          itemHeight: 8,
          textStyle: { color: "#4e5969", fontSize: 12 },
          data: ["月度新增损耗（正常）", "月度新增损耗（接近上限）", "月度新增损耗（超标）", "累计损耗趋势", "国标允许上限（1.5%）"],
        },
        tooltip: {
          trigger: "axis",
          formatter: (params: unknown): string => {
            if (!Array.isArray(params) || params.length === 0) {
              return "";
            }
            const rows = params as Array<{ marker: string; seriesName: string; value: number | string; axisValueLabel: string }>;
            const title = rows[0]?.axisValueLabel ?? "";
            const content = rows
              .filter((row) => row.value !== "-")
              .map((row) => {
                const unit = row.seriesName.includes("率") || row.seriesName.includes("上限") ? "%" : "kg";
                return `${row.marker}${row.seriesName}：${row.value}${unit}`;
              })
              .join("<br/>");
            return `${title}<br/>${content}`;
          },
        },
        xAxis: {
          type: "category",
          data: points.map((item) => item.month),
          axisTick: { show: false },
          axisLine: { lineStyle: { color: "#e5e6eb" } },
          axisLabel: { color: "#86909c" },
        },
        yAxis: [
          {
            type: "value",
            name: "损耗重量（kg）",
            min: 0,
            max: 2000,
            interval: 400,
            axisLabel: { color: "#86909c" },
            splitLine: { lineStyle: { color: "#edf0f3" } },
          },
          {
            type: "value",
            min: 0,
            max: 4,
            interval: 1,
            axisLabel: { show: false },
            splitLine: { show: false },
          },
        ],
        series: [
          {
            name: "月度新增损耗（正常）",
            type: "bar",
            stack: "loss",
            barWidth: 48,
            itemStyle: { borderRadius: [4, 4, 0, 0], color: "#64b5f6" },
            data: points.map((item) => (item.status === "normal" ? item.monthlyLoss : "-")),
          },
          {
            name: "月度新增损耗（接近上限）",
            type: "bar",
            stack: "loss",
            barWidth: 48,
            itemStyle: { borderRadius: [4, 4, 0, 0], color: "#f6a400" },
            data: points.map((item) => (item.status === "warning" ? item.monthlyLoss : "-")),
          },
          {
            name: "月度新增损耗（超标）",
            type: "bar",
            stack: "loss",
            barWidth: 48,
            itemStyle: { borderRadius: [4, 4, 0, 0], color: "#ff4d4f" },
            data: points.map((item) => (item.status === "exceeded" ? item.monthlyLoss : "-")),
          },
          {
            name: "累计损耗趋势",
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: 7,
            itemStyle: { color: "#1890ff" },
            lineStyle: { color: "#1890ff", width: 2 },
            label: { show: selectedRange.value === "1y", position: "top", formatter: "{c}" },
            data: points.map((item) => item.cumulativeLoss),
          },
          {
            name: "国标允许上限（1.5%）",
            type: "line",
            yAxisIndex: 1,
            symbol: "none",
            lineStyle: { color: "#f6a400", type: "dashed", width: 1.5 },
            endLabel: { show: true, formatter: "国标上限1.5%", color: "#f6a400" },
            data: points.map((item) => item.targetRate),
          },
        ],
      };
      trendChart.value.setOption(option, true);
    };

    const renderShareChart = (): void => {
      if (shareChart.value == null) {
        return;
      }
      const option: echarts.EChartsOption = {
        color: INVENTORY_LOSS_MOCK.typeShares.map((item) => item.color),
        tooltip: { trigger: "item", formatter: "{b}: {c}%" },
        legend: {
          right: 0,
          top: "middle",
          orient: "vertical",
          itemWidth: 10,
          itemHeight: 10,
          textStyle: { color: "#4e5969" },
          formatter: (name: string): string => {
            const item = INVENTORY_LOSS_MOCK.typeShares.find((share) => share.name === name);
            return item == null ? name : `${name} ${item.value}%`;
          },
        },
        series: [
          {
            type: "pie",
            radius: ["42%", "68%"],
            center: ["38%", "50%"],
            label: { show: false },
            data: INVENTORY_LOSS_MOCK.typeShares.map((item) => ({ name: item.name, value: item.value })),
          },
        ],
      };
      shareChart.value.setOption(option, true);
    };

    const resizeCharts = (): void => {
      trendChart.value?.resize();
      shareChart.value?.resize();
    };

    onMounted(() => {
      if (trendChartRef.value != null) {
        trendChart.value = echarts.init(trendChartRef.value);
        renderTrendChart();
      }
      if (shareChartRef.value != null) {
        shareChart.value = echarts.init(shareChartRef.value);
        renderShareChart();
      }
      window.addEventListener("resize", resizeCharts);
    });

    watch([selectedRange, chartMode], () => {
      renderTrendChart();
      renderShareChart();
    });

    onUnmounted(() => {
      window.removeEventListener("resize", resizeCharts);
      trendChart.value?.dispose();
      shareChart.value?.dispose();
    });

    return (): VNode => (
      <CubeLayout title={pageTitle ?? "库存损耗预测"} showFooter={false}>
        {{
          "layout-content": () => (
            <div class="inventory-loss-root">
              <div class="inventory-loss-toolbar">
                <div class="inventory-loss-toolbar-left">
                  <Select
                    class="inventory-loss-warehouse-select"
                    value={selectedWarehouse.value}
                    options={INVENTORY_LOSS_MOCK.warehouseOptions}
                    onChange={(value: string) => {
                      selectedWarehouse.value = value;
                    }}
                  />
                  <Select
                    class="inventory-loss-batch-select"
                    value={selectedBatch.value}
                    options={INVENTORY_LOSS_MOCK.batchOptions}
                    onChange={(value: string) => {
                      selectedBatch.value = value;
                    }}
                  />
                  <div class="inventory-loss-range-buttons">
                    {rangeOptions.map((item) => (
                      <Button
                        key={item.value}
                        type={selectedRange.value === item.value ? "primary" : "default"}
                        onClick={() => {
                          selectedRange.value = item.value;
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <span class="inventory-loss-updated">数据更新：{INVENTORY_LOSS_MOCK.updatedAt}</span>
              </div>

              <section class="inventory-loss-summary">
                {INVENTORY_LOSS_MOCK.summaryCards.map((card) => (
                  <div key={card.label} class={["inventory-loss-summary-card", `is-${card.tone}`]}>
                    <div class="inventory-loss-summary-label">{card.label}</div>
                    <div class="inventory-loss-summary-value">
                      {card.value}
                      {card.unit != null ? <span>{card.unit}</span> : null}
                    </div>
                  </div>
                ))}
              </section>

              <section class="inventory-loss-panel inventory-loss-chart-panel">
                <div class="inventory-loss-panel-header">
                  <h3>损耗变化趋势</h3>
                  <div class="inventory-loss-mode-buttons">
                    {chartModeOptions.map((item) => (
                      <Button
                        key={item.value}
                        type={chartMode.value === item.value ? "primary" : "default"}
                        onClick={() => {
                          chartMode.value = item.value;
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div ref={trendChartRef} class="inventory-loss-chart"></div>
              </section>

              <section class="inventory-loss-bottom">
                <div class="inventory-loss-panel">
                  <div class="inventory-loss-panel-header">
                    <h3>仓房损耗明细</h3>
                    <Button type="primary">导出Excel</Button>
                  </div>
                  <table class="inventory-loss-detail-table">
                    <thead>
                      <tr>
                        <th>仓房</th>
                        <th>品种</th>
                        <th>入库时间</th>
                        <th>入库重量</th>
                        <th>当前重量</th>
                        <th>累计损耗</th>
                        <th>损耗率</th>
                        <th>超标</th>
                      </tr>
                    </thead>
                    <tbody>
                      {INVENTORY_LOSS_MOCK.detailRows.map((row) => (
                        <tr key={row.warehouse} class={riskClassMap[row.risk]}>
                          <td>{row.warehouse}</td>
                          <td>{row.grainType}</td>
                          <td>{row.inboundTime}</td>
                          <td>{formatWeight(row.inboundWeight)}</td>
                          <td>{formatWeight(row.currentWeight)}</td>
                          <td>{formatLossWeight(row.cumulativeLoss)}</td>
                          <td>{row.lossRate.toFixed(2)}%</td>
                          <td>
                            <span class={["inventory-loss-risk-dot", row.exceeded ? "is-high" : "is-low"]}></span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div class="inventory-loss-panel inventory-loss-share-panel">
                  <div class="inventory-loss-panel-header">
                    <h3>分项损耗占比</h3>
                  </div>
                  <div ref={shareChartRef} class="inventory-loss-share-chart"></div>
                  <div class="inventory-loss-share-note">
                    主要损耗类型：<strong>{mainLossType.value?.name ?? "--"}</strong>
                    <span>（占比{mainLossType.value?.value ?? 0}%）</span>
                  </div>
                </div>
              </section>
            </div>
          ),
        }}
      </CubeLayout>
    );
  },
});
