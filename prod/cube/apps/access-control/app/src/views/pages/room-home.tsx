import dayjs from "dayjs";
import * as echarts from "echarts";
import { defineComponent, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type { AccessControlRecord, DoorEventRecord, DoorRankingRecord } from "@ghcloud/cube-service-interface/access-control";
import { getDoorEvents, getDoorRanking, getDoorTend, passedTodayNum } from "@ghcloud/cube-services-client/access-control.client";
import { Card, Image, RadioGroup, Table } from "@ghcloud/cube-ui";

import "./room-home.less";

const roomPng = "/resource/v1/accesscontrol-migrate/room.png";
const text = (value: unknown): string => String(value || "--");
// cube-ui Table 的运行时 props 均有默认值，但当前声明仍将它们标成必填。
const DataTable = Table as any;

export default defineComponent({
  name: "RoomHome",
  setup: () => {
    const chartRef = ref<HTMLDivElement>();
    let chart: echarts.ECharts | undefined;
    const state = reactive({
      timeFlag: "timeDay",
      todayCount: 0,
      ranking: [] as DoorRankingRecord[],
      events: [] as DoorEventRecord[],
    });

    const rankingColumns = [
      {
        title: "排名",
        dataIndex: "rank",
        width: 80,
        customRender: ({ index }: { index: number }) => <span class={`rank-index rank-index-${index + 1}`}>{index + 1}</span>,
      },
      { title: "门禁名称", dataIndex: "doorName", ellipsis: true, customRender: ({ text: value }: { text: unknown }) => text(value) },
      { title: "使用次数", dataIndex: "num", width: 120, customRender: ({ text: value }: { text: unknown }) => text(value) },
    ];
    const eventColumns = [
      {
        title: "时间",
        dataIndex: "eventTime",
        width: 180,
        customRender: ({ text: value }: { text: unknown }) => (value ? dayjs(value as string).format("YYYY-MM-DD HH:mm:ss") : "--"),
      },
      { title: "门禁名称", dataIndex: "doorName", ellipsis: true, customRender: ({ text: value }: { text: unknown }) => text(value) },
      { title: "事件名称", dataIndex: "eventName", ellipsis: true, customRender: ({ text: value }: { text: unknown }) => text(value) },
    ];

    const renderChart = async (timeFlag: string): Promise<void> => {
      const trend = await getDoorTend({ timeFlag });
      await nextTick();
      if (!chartRef.value) {
        return;
      }
      chart?.dispose();
      chart = echarts.init(chartRef.value);
      chart.setOption({
        tooltip: { trigger: "axis" },
        grid: { left: 40, right: 24, top: 24, bottom: 32 },
        xAxis: { type: "category", data: trend.map((item: AccessControlRecord) => String(item.timeValue || "")) },
        yAxis: { type: "value", minInterval: 1 },
        series: [{ name: "人数", type: "line", smooth: true, color: "#fa8c16", data: trend.map((item) => Number(item.num || 0)) }],
      });
    };

    const loadOverview = async (): Promise<void> => {
      const [todayCount, ranking, events] = await Promise.all([passedTodayNum({}), getDoorRanking({}), getDoorEvents({})]);
      state.todayCount = Number(todayCount || 0);
      state.ranking = ranking || [];
      state.events = events || [];
    };
    const resizeChart = (): void => chart?.resize();

    onMounted(() => {
      void Promise.all([loadOverview(), renderChart(state.timeFlag)]);
      window.addEventListener("resize", resizeChart);
    });
    onBeforeUnmount(() => {
      window.removeEventListener("resize", resizeChart);
      chart?.dispose();
    });

    const slots = {
      "layout-content": () => (
        <div class="access-overview">
          <section class="access-overview-summary">
            <Card class="access-overview-count" bordered={false}>
              <Image width={48} height={48} src={roomPng} preview={false} />
              <span>今日通行记录</span>
              <strong>
                {state.todayCount}
                <small>次</small>
              </strong>
            </Card>
            <Card class="access-overview-chart-card" title="通行人数统计" bordered={false}>
              {{
                extra: () => (
                  <RadioGroup
                    buttonStyle="solid"
                    value={state.timeFlag}
                    options={[
                      { value: "timeDay", label: "日" },
                      { value: "timeMonth", label: "月" },
                      { value: "timeYear", label: "年" },
                    ]}
                    onUpdate:value={(value: string) => {
                      state.timeFlag = value;
                      void renderChart(value);
                    }}
                  />
                ),
                default: () => <div ref={chartRef} class="access-overview-chart" />,
              }}
            </Card>
          </section>
          <section class="access-overview-tables">
            <Card title="门禁使用排名 Top10" bordered={false}>
              <DataTable rowKey="id" columns={rankingColumns} dataSource={state.ranking} pagination={false} scrollY={360} />
            </Card>
            <Card title="门禁记录" bordered={false}>
              <DataTable rowKey="id" columns={eventColumns} dataSource={state.events} pagination={false} scrollY={360} />
            </Card>
          </section>
        </div>
      ),
    };

    return () => <CubeLayout title="门禁概览" v-slots={slots} showFooter={false} />;
  },
});
