import dayjs, { type Dayjs } from "dayjs";
import * as echarts from "echarts";
import { defineComponent, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";

import { useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { getDoorEventRecord, getToDayEventTrend, passedTodayNum } from "@ghcloud/cube-services-client/access-control.client";
import { Image, Page, PopOver } from "@ghcloud/cube-ui";

import "./room-log-page.less";

const textCell = (value: unknown) => <PopOver content={String(value || "")}>{String(value || "--")}</PopOver>;
const roomPng = "/resource/v1/accesscontrol-migrate/room.png";

export default defineComponent({
  name: "RoomLogPage",
  setup: () => {
    const chartRef = ref<HTMLDivElement>();
    let chart: echarts.ECharts | undefined;
    const state = reactive({
      todayCount: 0,
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      keyword: "",
      eventResult: "",
      startTime: "",
      endTime: "",
    });

    const [CubeTable, tableApi] = useCubeTable({
      rowKey: "id",
      tableCode: "ROOM_LOG",
      columns: [
        {
          title: "时间",
          dataIndex: "eventTime",
          ellipsis: true,
          customRender: ({ text }: { text: unknown }) => textCell(text ? dayjs(text as string).format("YYYY-MM-DD HH:mm:ss") : ""),
        },
        { title: "门禁名称", dataIndex: "doorName", ellipsis: true, customRender: ({ text }: { text: unknown }) => textCell(text) },
        { title: "通行人员", dataIndex: "personName", ellipsis: true, customRender: ({ text }: { text: unknown }) => textCell(text) },
        { title: "通行方式", dataIndex: "eventWay", ellipsis: true, customRender: ({ text }: { text: unknown }) => textCell(text) },
        { title: "通行事件", dataIndex: "eventName", ellipsis: true, customRender: ({ text }: { text: unknown }) => textCell(text) },
        {
          title: "通行结果",
          dataIndex: "eventResult",
          customRender: ({ text }: { text: unknown }) => textCell(text === "DO_PASS" ? "通过" : "拒绝"),
        },
      ],
      fetchApi: () =>
        getDoorEventRecord({
          pageNumber: state.pageNumber,
          pageSize: state.pageSize,
          keyword: state.keyword,
          eventResult: state.eventResult,
          startTime: state.startTime,
          endTime: state.endTime,
        }),
      fetchLoaded: (data) => {
        state.total = data.total;
      },
    });

    const [CubeForm] = useCubeForm({
      layout: "horizontal",
      schema: [
        {
          component: "Input",
          fieldName: "keyword",
          label: "门禁名称",
          defaultValue: "",
          componentProps: { placeholder: "请输入门禁名称", allowClear: true },
        },
        {
          component: "Select",
          fieldName: "eventResult",
          label: "通行结果",
          defaultValue: "",
          componentProps: {
            allowClear: true,
            options: [
              { value: "DO_PASS", label: "通过" },
              { value: "DO_REFUSE", label: "拒绝" },
            ],
          },
        },
        {
          component: "DateRangePicker",
          fieldName: "date",
          label: "时间范围",
          componentProps: { showTime: true },
        },
      ],
      handleSubmit: (values) => {
        const date = (values.date || []) as Dayjs[];
        state.keyword = String(values.keyword || "");
        state.eventResult = String(values.eventResult || "");
        state.startTime = date[0]?.format("YYYY-MM-DD HH:mm:ss") || "";
        state.endTime = date[1]?.format("YYYY-MM-DD HH:mm:ss") || "";
        state.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        Object.assign(state, { keyword: "", eventResult: "", startTime: "", endTime: "", pageNumber: 1 });
        tableApi.query();
      },
    });

    const loadSummary = async (): Promise<void> => {
      const [count, trend] = await Promise.all([passedTodayNum({}), getToDayEventTrend({})]);
      state.todayCount = Number(count || 0);
      await nextTick();
      if (!chartRef.value) {
        return;
      }
      chart?.dispose();
      chart = echarts.init(chartRef.value);
      chart.setOption({
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "none" },
          formatter(params: Array<{ marker: string; name: string; value: number }>) {
            return `人数<br/>${params[0].marker}${params[0].name} 时: ${params[0].value.toLocaleString()}人`;
          },
        },
        grid: { left: "1%", right: "1%", bottom: "3%", containLabel: true },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: trend.map((item) => String(item.timeValue || "")),
          axisLabel: {
            interval: 0,
            rotate: 40,
            formatter: (value: string) => `${value}时`,
          },
          axisTick: { show: false },
        },
        yAxis: {
          type: "value",
          minInterval: 1,
          axisLabel: { formatter: (value: number) => `${value}人` },
        },
        series: [
          {
            name: "人数",
            type: "line",
            smooth: true,
            lineStyle: { color: "#fa8c16" },
            color: "#fa8c16",
            data: trend.map((item) => Number(item.num || 0)),
          },
        ],
      });
    };
    const resizeChart = (): void => chart?.resize();

    onMounted(() => {
      void loadSummary();
      window.addEventListener("resize", resizeChart);
    });
    onBeforeUnmount(() => {
      window.removeEventListener("resize", resizeChart);
      chart?.dispose();
    });

    return () => (
      <div class="room-log-page">
        <div class="room-log-main">
          <span class="room-log-title">通行记录</span>
          <div class="room-log-separator" />
          <div class="room-log-top">
            <div class="room-log-top-left">
              <div class="room-log-top-left-box">
                <div class="room-log-icon">
                  <Image width={40} height={40} src={roomPng} preview={false} />
                </div>
                <div>今日通行</div>
                <div class="room-log-count">
                  {state.todayCount}
                  <span>次</span>
                </div>
              </div>
            </div>
            <div class="room-log-vertical-separator" />
            <div class="room-log-top-right">
              <div class="room-log-chart-title">人员通行统计</div>
              <div ref={chartRef} class="room-log-chart" />
            </div>
          </div>
          <div class="room-log-separator" />
          <div class="room-log-bottom">
            <span class="room-log-table-title">通行记录</span>
            <CubeForm />
            <div class="room-log-table">
              <CubeTable />
            </div>
            <div class="room-log-pagination">
              <Page
                current={state.pageNumber}
                pageSize={state.pageSize}
                total={state.total}
                showQuickJumper={false}
                showSizeChanger
                showTotal={(total: number) => `共 ${total} 条`}
                pageSizeOptions={["10", "20", "50", "100"]}
                onPageChange={(pageNumber: number, pageSize: number) => {
                  state.pageNumber = pageNumber;
                  state.pageSize = pageSize;
                  tableApi.query();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
});
