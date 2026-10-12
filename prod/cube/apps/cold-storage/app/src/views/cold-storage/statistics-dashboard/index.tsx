import { computed, defineComponent, onMounted, shallowRef } from "vue";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type {
  ColdStoreStatisticsAlarmDistribution,
  ColdStoreStatisticsDoorTimeoutRank,
  ColdStoreStatisticsPreview,
  ColdStoreStatisticsResponseTimelinessRank,
  ColdStoreStatisticsTrendSeries,
} from "@ghcloud/cube-service-interface/cold-storage";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getColdStoreStatisticsPreview } from "@ghcloud/cube-services-client/cold-storage.client";
import { Empty, Spin, Table, Tag } from "@ghcloud/cube-ui";

import { StatGrid } from "../shared/components";
import { formatDate } from "../shared/time";

import "./index.less";

const displayText = (value?: string | number | null): string => {
  if (value == null || value === "") {
    return "--";
  }
  return String(value);
};

const minuteText = (value?: number): string => (value == null ? "--" : `${value}min`);

const trendSymbol = (trend?: string): string => {
  if (trend === "UP") {
    return "↑";
  }
  if (trend === "DOWN") {
    return "↓";
  }
  return "→";
};

const trendTone = (trend?: string): "red" | "orange" | "green" => {
  if (trend === "UP") {
    return "red";
  }
  if (trend === "DOWN") {
    return "green";
  }
  return "orange";
};

const evaluationColor = (evaluation?: string): string => {
  if (evaluation === "EXCELLENT" || evaluation === "GOOD") {
    return "green";
  }
  if (evaluation === "NORMAL") {
    return "orange";
  }
  return "red";
};

const seriesValues = (series: ColdStoreStatisticsTrendSeries[]): number[] =>
  series.flatMap((item) => item.points.map((point) => Number(point.value))).filter((value) => Number.isFinite(value));

const toPolyline = (series: ColdStoreStatisticsTrendSeries, min: number, max: number): string => {
  const span = max - min || 1;
  const points = series.points;
  return points
    .map((point, index) => {
      const value = Number(point.value);
      const x = points.length === 1 ? 318 : 76 + (index / Math.max(points.length - 1, 1)) * 484;
      const y = 150 - ((Number.isFinite(value) ? value - min : 0) / span) * 116;
      return `${Math.round(x)},${Math.round(y)}`;
    })
    .join(" ");
};

export const StatisticsDashboardPage = defineComponent({
  name: "StatisticsDashboardPage",
  setup: () => {
    const loading = shallowRef(false);
    const preview = shallowRef<ColdStoreStatisticsPreview | null>(null);

    const loadPreview = async (): Promise<void> => {
      loading.value = true;
      try {
        preview.value = await useAuthRequest(() => getColdStoreStatisticsPreview());
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      void loadPreview();
    });

    const overviewItems = computed(() => {
      const overview = preview.value?.overview;
      return [
        { label: "在线冷库", value: `${overview?.onlineStoreCount ?? "--"}/${overview?.totalStoreCount ?? "--"}`, tone: "green" as const },
        { label: "总体健康度", value: displayText(overview?.overallHealthScore), tone: "green" as const },
        { label: "本月告警", value: displayText(overview?.monthlyAlarmCount), tone: "orange" as const },
        { label: "处置时效达标率", value: overview?.timelinessRate == null ? "--" : `${overview.timelinessRate}%`, tone: "green" as const },
      ];
    });

    const concentrationTrend = (): JSX.Element => {
      const trend = preview.value?.ammoniaTrend;
      const series = trend?.series ?? [];
      if (!series.length) {
        return <Empty description="暂无氨浓度趋势" />;
      }
      const values = seriesValues(series);
      const lowThreshold = Number(trend?.lowThreshold ?? 0);
      const highThreshold = Number(trend?.highThreshold ?? 0);
      const max = Math.max(...values, lowThreshold, highThreshold, 1);
      const min = Math.min(0, ...values);
      const thresholdY = (value: number): number => 150 - ((value - min) / (max - min || 1)) * 116;
      return (
        <div class="dashboard-trend">
          <svg class="dashboard-trend-chart" viewBox="0 0 620 180" role="img" aria-label="氨浓度趋势总览">
            <line
              x1="76"
              y1={thresholdY(highThreshold)}
              x2="560"
              y2={thresholdY(highThreshold)}
              class="dashboard-threshold dashboard-threshold--high"
            />
            <line
              x1="76"
              y1={thresholdY(lowThreshold)}
              x2="560"
              y2={thresholdY(lowThreshold)}
              class="dashboard-threshold dashboard-threshold--low"
            />
            <text x="78" y={Math.max(16, thresholdY(highThreshold) - 6)} class="dashboard-threshold-text dashboard-threshold-text--high">
              {highThreshold}ppm高报线
            </text>
            <text x="78" y={Math.max(16, thresholdY(lowThreshold) - 6)} class="dashboard-threshold-text dashboard-threshold-text--low">
              {lowThreshold}ppm低报线
            </text>
            {series.map((item, index) => {
              const color = item.color || ["#d94c4c", "#2eaf52", "#f28c28", "#2f5df4"][index % 4];
              const line = toPolyline(item, min, max);
              const lastPoint = item.points.at(-1);
              const lastValue = Number(lastPoint?.value);
              const cx = item.points.length === 1 ? 318 : 560;
              const cy = 150 - ((Number.isFinite(lastValue) ? lastValue - min : 0) / (max - min || 1)) * 116;
              return (
                <g key={item.storeId || item.storeName || index}>
                  <polyline class="dashboard-line" points={line} style={{ stroke: color }} />
                  <circle cx={cx} cy={cy} r="5" class="dashboard-dot" style={{ fill: color }} />
                </g>
              );
            })}
          </svg>
          <div class="dashboard-trend-legend">
            {series.map((item, index) => {
              const color = item.color || ["#d94c4c", "#2eaf52", "#f28c28", "#2f5df4"][index % 4];
              return (
                <span key={item.storeId || item.storeName || index}>
                  <i style={{ backgroundColor: color }} />
                  {displayText(item.storeName)}
                </span>
              );
            })}
          </div>
        </div>
      );
    };

    const alarmSourceChart = (): JSX.Element => {
      const rows = preview.value?.alarmDistributions ?? [];
      if (!rows.length) {
        return <Empty description="暂无告警分布" />;
      }
      const total = rows.reduce((sum, item) => sum + (item.count ?? 0), 0);
      const max = Math.max(...rows.map((item) => item.count ?? 0), 1);
      return (
        <div class="alarm-source-chart">
          {rows.map((item: ColdStoreStatisticsAlarmDistribution) => {
            const color = item.color || "#2f5df4";
            return (
              <div class="alarm-source-row" key={item.source || item.sourceName}>
                <span style={{ backgroundColor: color }}>{displayText(item.sourceName || item.source)}</span>
                <i style={{ width: `${((item.count ?? 0) / max) * 100}%`, backgroundColor: color }} />
                <b>{item.count ?? 0}</b>
              </div>
            );
          })}
          <div class="alarm-source-legend">
            {rows.map((item) => {
              const color = item.color || "#2f5df4";
              const percent = item.percent ?? (total ? Math.round(((item.count ?? 0) / total) * 100) : 0);
              return (
                <span key={item.source || item.sourceName}>
                  <i style={{ backgroundColor: color }} />
                  {displayText(item.sourceName || item.source)} {item.count ?? 0}条({percent}%)
                </span>
              );
            })}
          </div>
          <p>
            数据来源：告警中心全量告警（{formatDate(preview.value?.periodStartTime)} 至 {formatDate(preview.value?.periodEndTime)}），共
            {total}条
          </p>
        </div>
      );
    };

    const content = (): JSX.Element => (
      <div class="cs-page">
        <Spin spinning={loading.value}>
          <div class="panel-stack statistics-overview">
            <StatGrid items={overviewItems.value} />
            <div class="cs-grid-2">
              <section class="cs-card dashboard-card">
                <div class="cs-card-hd">
                  <h3>氨浓度趋势总览（近7天）</h3>
                  <span class="dashboard-updated">更新：{formatDate(preview.value?.lastUpdatedTime)}</span>
                </div>
                {concentrationTrend()}
              </section>
              <section class="cs-card dashboard-card">
                <div class="cs-card-hd">
                  <h3>本月告警分布（按来源）</h3>
                </div>
                {alarmSourceChart()}
              </section>
            </div>
            <section class="cs-card dashboard-card">
              <div class="cs-card-hd">
                <h3>库门超时排行 TOP5</h3>
              </div>
              <Table
                pagination={false}
                rowKey={(record: ColdStoreStatisticsDoorTimeoutRank) => `${record.rank ?? ""}-${record.storeId ?? ""}`}
                dataSource={preview.value?.doorTimeoutRanks ?? []}
                locale={{ emptyText: <Empty description="暂无库门超时排行" /> }}
                columns={[
                  { title: "排名", dataIndex: "rank", align: "center" },
                  { title: "冷库", dataIndex: "storeName", align: "center" },
                  {
                    title: "超时次数",
                    dataIndex: "timeoutCount",
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreStatisticsDoorTimeoutRank }) => `${record.timeoutCount ?? 0}次`,
                  },
                  {
                    title: "累计时长",
                    dataIndex: "totalDurationMinutes",
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreStatisticsDoorTimeoutRank }) => minuteText(record.totalDurationMinutes),
                  },
                  {
                    title: "最长单次",
                    dataIndex: "longestDurationMinutes",
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreStatisticsDoorTimeoutRank }) => minuteText(record.longestDurationMinutes),
                  },
                  {
                    title: "趋势",
                    dataIndex: "trend",
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreStatisticsDoorTimeoutRank }) => (
                      <span class={`dashboard-trend-text tone-${trendTone(record.trend)}`}>
                        {trendSymbol(record.trend)} {displayText(record.trendName)}
                      </span>
                    ),
                  },
                ]}
              />
            </section>
            <section class="cs-card dashboard-card">
              <div class="cs-card-hd">
                <h3>处置时效排行（本周）</h3>
              </div>
              <Table
                pagination={false}
                rowKey={(record: ColdStoreStatisticsResponseTimelinessRank) => `${record.rank ?? ""}-${record.handlerName ?? ""}`}
                dataSource={preview.value?.responseTimelinessRanks ?? []}
                locale={{ emptyText: <Empty description="暂无处置时效排行" /> }}
                columns={[
                  { title: "排名", dataIndex: "rank", align: "center" },
                  { title: "值班人员", dataIndex: "handlerName", align: "center" },
                  {
                    title: "接警次数",
                    dataIndex: "receivedCount",
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreStatisticsResponseTimelinessRank }) => `${record.receivedCount ?? 0}次`,
                  },
                  {
                    title: "平均接单",
                    dataIndex: "averageAcceptMinutes",
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreStatisticsResponseTimelinessRank }) =>
                      minuteText(record.averageAcceptMinutes),
                  },
                  {
                    title: "平均处置",
                    dataIndex: "averageHandleMinutes",
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreStatisticsResponseTimelinessRank }) =>
                      minuteText(record.averageHandleMinutes),
                  },
                  {
                    title: "总耗时",
                    dataIndex: "totalDurationMinutes",
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreStatisticsResponseTimelinessRank }) =>
                      minuteText(record.totalDurationMinutes),
                  },
                  {
                    title: "评价",
                    dataIndex: "evaluationName",
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreStatisticsResponseTimelinessRank }) => (
                      <Tag color={evaluationColor(record.evaluation)}>{displayText(record.evaluationName || record.evaluation)}</Tag>
                    ),
                  },
                ]}
              />
            </section>
          </div>
        </Spin>
      </div>
    );

    return () => (
      <CubeLayout
        title="统计看板"
        v-slots={{
          "layout-content": content,
        }}
      />
    );
  },
});
