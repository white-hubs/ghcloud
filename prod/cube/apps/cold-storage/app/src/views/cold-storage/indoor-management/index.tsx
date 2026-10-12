import { computed, defineComponent, onMounted, shallowRef, watch } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type {
  ColdStoreInsideDoorStatus,
  ColdStoreInsideTemperatureAbnormalRecord,
  ColdStoreInsideTemperatureMonitorRow,
  ColdStoreInsideTemperatureOverview,
  ColdStoreInsideTemperaturePointValue,
} from "@ghcloud/cube-service-interface/cold-storage";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getColdStoreInsideDoorStatuses, getColdStoreInsideTemperatureOverview } from "@ghcloud/cube-services-client/cold-storage.client";
import { Button, Empty, Table, Tag } from "@ghcloud/cube-ui";

import { AiCard, PrototypeTabs, StatGrid } from "../shared/components";
import { pushByHistory } from "../shared/page";
import { formatDateTime } from "../shared/time";

import "./index.less";

const emptyTemperatureOverview = (): ColdStoreInsideTemperatureOverview => ({
  analysisCards: [],
  monitorRows: [],
  trendCharts: [],
  abnormalRecords: [],
});

export const IndoorManagementPage = defineComponent({
  name: "IndoorManagementPage",
  setup: () => {
    const router = useRouter();
    const activeTab = shallowRef("door");
    const doorRows = shallowRef<ColdStoreInsideDoorStatus[]>([]);
    const doorLoading = shallowRef(false);
    const temperatureOverview = shallowRef<ColdStoreInsideTemperatureOverview>(emptyTemperatureOverview());
    const temperatureLoading = shallowRef(false);
    const temperatureLoaded = shallowRef(false);

    const loadDoorRows = async (): Promise<void> => {
      doorLoading.value = true;
      try {
        doorRows.value = await useAuthRequest(() => getColdStoreInsideDoorStatuses());
      } finally {
        doorLoading.value = false;
      }
    };

    const loadTemperatureOverview = async (): Promise<void> => {
      temperatureLoading.value = true;
      try {
        temperatureOverview.value = await useAuthRequest(() => getColdStoreInsideTemperatureOverview());
        temperatureLoaded.value = true;
      } finally {
        temperatureLoading.value = false;
      }
    };

    onMounted(() => {
      void loadDoorRows();
    });

    watch(activeTab, (key) => {
      if (key === "temp" && !temperatureLoaded.value) {
        void loadTemperatureOverview();
      }
    });

    const openDetail = (storeId: string): void => {
      pushByHistory(router, {
        name: "indoor-management-detail",
        query: {
          type: activeTab.value,
          id: storeId,
        },
      });
    };

    const displayText = (value?: string | number | null): string => {
      if (value == null || value === "") {
        return "--";
      }
      return String(value);
    };

    const doorStatusColor = (status?: string): string => {
      const text = status ?? "";
      if (text.includes("开") || text.toUpperCase() === "OPEN") {
        return "red";
      }
      if (text.includes("关") || text.toUpperCase() === "CLOSE") {
        return "green";
      }
      return "blue";
    };

    const tempOverviewCards = computed(() =>
      temperatureOverview.value.analysisCards.map((item) => ({
        label: `${displayText(item.storeName)} 平均温度`,
        value: displayText(item.averageTemperature),
      })),
    );

    const isWarningText = (value?: string): boolean => {
      const text = value ?? "";
      return /异常|过高|偏高|波动|告警|超|高|\+/.test(text);
    };

    const isTemperatureRowWarning = (record: ColdStoreInsideTemperatureMonitorRow): boolean => {
      return (
        isWarningText(record.aiJudgement) ||
        isWarningText(record.maxDeviation) ||
        record.points.some((point) => isWarningText(point.deviation))
      );
    };

    const abnormalRecordLevel = (record: ColdStoreInsideTemperatureAbnormalRecord): "red" | "orange" => {
      return /过高|严重|红|超/.test(record.abnormalType ?? "") ? "red" : "orange";
    };

    const temperaturePointTitle = (index: number): string => {
      const row = temperatureOverview.value.monitorRows.find((item) => item.points[index]);
      const point = row?.points[index];
      return point?.name ? `测点${index + 1}（${point.name}）` : `测点${index + 1}`;
    };

    const temperaturePointValue = (point?: ColdStoreInsideTemperaturePointValue): JSX.Element => {
      return tempValue(displayText(point?.temperature), isWarningText(point?.deviation) ? "warn" : "normal");
    };

    const tempValue = (value: string, tone: "normal" | "warn" | "danger" = "normal"): JSX.Element => (
      <span class={`temp-value temp-value--${tone}`}>{value}</span>
    );

    const content = (): JSX.Element => (
      <div class="cs-page">
        <PrototypeTabs
          tabs={[
            { key: "door", label: "库门状态监控" },
            { key: "temp", label: "库温监控" },
          ]}
          activeKey={activeTab.value}
          onUpdate:activeKey={(key: string) => {
            activeTab.value = key;
          }}
        />
        {activeTab.value === "door" ? (
          <div class="panel-stack">
            <AiCard title="AI行为分析" text="通过摄像头识别库门开关行为，自动区分正常装卸货和忘记关门，仅对后者进行告警。" />
            <Table
              pagination={false}
              loading={doorLoading.value}
              rowKey="storeId"
              dataSource={doorRows.value}
              locale={{ emptyText: <Empty description="暂无库门状态数据" /> }}
              columns={[
                {
                  title: "冷库",
                  dataIndex: "storeName",
                  align: "center",
                  customRender: ({ record }: { record: ColdStoreInsideDoorStatus }) => displayText(record.storeName),
                },
                {
                  title: "库门状态",
                  dataIndex: "doorStatus",
                  align: "center",
                  customRender: ({ record }: { record: ColdStoreInsideDoorStatus }) => (
                    <Tag color={doorStatusColor(record.doorStatus)}>{displayText(record.doorStatus)}</Tag>
                  ),
                },
                {
                  title: "已开启时长",
                  dataIndex: "openedDuration",
                  align: "center",
                  customRender: ({ record }: { record: ColdStoreInsideDoorStatus }) => displayText(record.openedDuration),
                },
                {
                  title: "AI行为判定",
                  dataIndex: "aiBehavior",
                  align: "center",
                  customRender: ({ record }: { record: ColdStoreInsideDoorStatus }) => displayText(record.aiBehavior),
                },
                {
                  title: "库温变化",
                  dataIndex: "temperatureChange",
                  align: "center",
                  customRender: ({ record }: { record: ColdStoreInsideDoorStatus }) => displayText(record.temperatureChange),
                },
                {
                  title: "操作",
                  align: "center",
                  customRender: ({ record }: { record: ColdStoreInsideDoorStatus }) => (
                    <Button type="link" onClick={() => openDetail(record.storeId)}>
                      详情
                    </Button>
                  ),
                },
              ]}
            />
          </div>
        ) : (
          <div class="panel-stack">
            <AiCard title="AI温度场分析" text="基于多测点温湿度传感器数据，自动识别温度死角和高低温异常区域。" />
            {tempOverviewCards.value.length ? <StatGrid items={tempOverviewCards.value} /> : <Empty description="暂无库温总览数据" />}
            <section class="cs-card temp-section">
              <div class="cs-card-hd">
                <h3>各冷库温度监控详情</h3>
              </div>
              <Table
                pagination={false}
                loading={temperatureLoading.value}
                rowKey="storeId"
                dataSource={temperatureOverview.value.monitorRows}
                locale={{ emptyText: <Empty description="暂无库温监控数据" /> }}
                rowClassName={(record: ColdStoreInsideTemperatureMonitorRow) => (isTemperatureRowWarning(record) ? "temp-row-warning" : "")}
                columns={[
                  {
                    title: "冷库",
                    dataIndex: "storeName",
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreInsideTemperatureMonitorRow }) => displayText(record.storeName),
                  },
                  {
                    title: "设定温度",
                    dataIndex: "setTemperature",
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreInsideTemperatureMonitorRow }) => displayText(record.setTemperature),
                  },
                  {
                    title: "当前平均",
                    dataIndex: "currentAverageTemperature",
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreInsideTemperatureMonitorRow }) =>
                      displayText(record.currentAverageTemperature),
                  },
                  {
                    title: temperaturePointTitle(0),
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreInsideTemperatureMonitorRow }) => temperaturePointValue(record.points[0]),
                  },
                  {
                    title: temperaturePointTitle(1),
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreInsideTemperatureMonitorRow }) => temperaturePointValue(record.points[1]),
                  },
                  {
                    title: temperaturePointTitle(2),
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreInsideTemperatureMonitorRow }) => temperaturePointValue(record.points[2]),
                  },
                  {
                    title: "最大偏差",
                    dataIndex: "maxDeviation",
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreInsideTemperatureMonitorRow }) =>
                      tempValue(displayText(record.maxDeviation), isWarningText(record.maxDeviation) ? "warn" : "normal"),
                  },
                  {
                    title: "AI判定",
                    dataIndex: "aiJudgement",
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreInsideTemperatureMonitorRow }) => (
                      <Tag color={isTemperatureRowWarning(record) ? "orange" : "green"}>{displayText(record.aiJudgement)}</Tag>
                    ),
                  },
                  {
                    title: "详情",
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreInsideTemperatureMonitorRow }) => (
                      <Button type="link" onClick={() => openDetail(record.storeId)}>
                        趋势
                      </Button>
                    ),
                  },
                ]}
              />
            </section>
            <section class="cs-card temp-section">
              <div class="cs-card-hd">
                <h3>温度异常记录</h3>
                <Tag color="orange">近7天</Tag>
              </div>
              <Table
                pagination={false}
                loading={temperatureLoading.value}
                rowKey={(record: ColdStoreInsideTemperatureAbnormalRecord) =>
                  `${record.time ?? ""}-${record.storeId ?? ""}-${record.pointName ?? ""}`
                }
                dataSource={temperatureOverview.value.abnormalRecords}
                locale={{ emptyText: <Empty description="暂无温度异常记录" /> }}
                rowClassName={(record: ColdStoreInsideTemperatureAbnormalRecord) =>
                  `temp-anomaly-row temp-anomaly-row--${abnormalRecordLevel(record)}`
                }
                columns={[
                  {
                    title: "时间",
                    dataIndex: "time",
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreInsideTemperatureAbnormalRecord }) => formatDateTime(record.time),
                  },
                  {
                    title: "冷库",
                    dataIndex: "storeName",
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreInsideTemperatureAbnormalRecord }) => displayText(record.storeName),
                  },
                  {
                    title: "测点",
                    dataIndex: "pointName",
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreInsideTemperatureAbnormalRecord }) => displayText(record.pointName),
                  },
                  {
                    title: "异常类型",
                    dataIndex: "abnormalType",
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreInsideTemperatureAbnormalRecord }) => (
                      <span class={`temp-anomaly-type temp-anomaly-type--${abnormalRecordLevel(record)}`}>
                        {displayText(record.abnormalType)}
                      </span>
                    ),
                  },
                  {
                    title: "实际温度",
                    dataIndex: "actualTemperature",
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreInsideTemperatureAbnormalRecord }) =>
                      displayText(record.actualTemperature),
                  },
                  {
                    title: "偏差",
                    dataIndex: "deviation",
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreInsideTemperatureAbnormalRecord }) => displayText(record.deviation),
                  },
                  {
                    title: "AI原因分析",
                    dataIndex: "aiReason",
                    align: "center",
                    customRender: ({ record }: { record: ColdStoreInsideTemperatureAbnormalRecord }) => displayText(record.aiReason),
                  },
                ]}
              />
            </section>
          </div>
        )}
      </div>
    );

    return () => (
      <CubeLayout
        title="库内管理"
        showFooter={false}
        v-slots={{
          "layout-content": content,
        }}
      />
    );
  },
});
