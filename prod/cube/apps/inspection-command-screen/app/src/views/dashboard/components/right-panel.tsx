import { AlertOutlined, ApartmentOutlined, BarChartOutlined } from "@ant-design/icons-vue";
import * as echarts from "echarts";
import { defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { Empty } from "@ghcloud/cube-ui";

import { TimeFilterBar } from "./time-filter-bar";
import type { DepartmentStat, TimeFilter } from "@/types/dashboard";

import "./right-panel.less";

export const RightPanel = defineComponent({
  name: "RightPanel",
  props: {
    abnormalFilter: { type: Object as () => TimeFilter, required: true },
    typeFilter: { type: Object as () => TimeFilter, required: true },
    deptFilter: { type: Object as () => TimeFilter, required: true },
    abnormal: {
      type: Object as () => { abnormalTask: number; abnormalTaskTrend: number; abnormalPoint: number; abnormalPointTrend: number },
      required: true,
    },
    taskType: { type: Array as () => Array<{ name: string; value: number }>, required: true },
    depts: { type: Array as () => DepartmentStat[], required: true },
    expandedDept: { type: Array as () => string[], required: true },
    onAbnormalFilter: { type: Function as unknown as () => (v: TimeFilter) => void, required: true },
    onTypeFilter: { type: Function as unknown as () => (v: TimeFilter) => void, required: true },
    onDeptFilter: { type: Function as unknown as () => (v: TimeFilter) => void, required: true },
    onToggleDept: { type: Function as unknown as () => (id: string) => void, required: true },
  },
  setup(props) {
    const typeChartRef = ref<HTMLDivElement | null>(null);
    const deptChartRefs = ref<Record<string, HTMLDivElement | null>>({});
    let typeChart: echarts.ECharts | null = null;
    const deptCharts = new Map<string, echarts.ECharts>();

    const isTaskTypeEmpty = (): boolean => {
      return props.taskType.length === 0 || props.taskType.every((item) => item.value === 0);
    };

    const renderTypeChart = (): void => {
      if (!typeChartRef.value || isTaskTypeEmpty()) {
        typeChart?.dispose();
        typeChart = null;
        return;
      }
      const sortedTaskType = [...props.taskType].filter((item) => item.value > 0).sort((a, b) => b.value - a.value);
      const maxValue = Math.max(...sortedTaskType.map((item) => item.value), 0);
      const axisMax = Math.max(5, Math.ceil(maxValue / 5) * 5);
      const palette = [
        ["#25b7e8", "#3ed0f5"],
        ["#d45be1", "#ee73f3"],
        ["#38c879", "#53df91"],
        ["#d85d9e", "#ef75b7"],
        ["#f6a23f", "#ffbf6a"],
        ["#78a9dd", "#9bc6ef"],
      ];
      typeChart ??= echarts.init(typeChartRef.value);
      typeChart.setOption({
        animationDuration: 500,
        grid: { left: 8, right: 18, top: 8, bottom: 20, containLabel: true },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "none" },
          backgroundColor: "rgba(8, 18, 45, 0.94)",
          borderColor: "rgba(82, 127, 196, 0.28)",
          borderWidth: 1,
          padding: [10, 12],
          textStyle: { color: "#dce9ff", fontSize: 13 },
          formatter: (params: unknown) => {
            const item = Array.isArray(params) ? (params[0] as any) : (params as any);
            const color = item?.color?.colorStops?.[0]?.color || item?.color || "#8eb8ff";
            return `
              <div class="type-tooltip">
                <div class="type-tooltip-title">${item?.name || ""}</div>
                <div><span style="display:inline-block;width:12px;height:12px;border-radius:2px;background:${color};margin-right:8px;"></span>${item?.value ?? 0} 项</div>
              </div>
            `;
          },
        },
        xAxis: {
          type: "value",
          min: 0,
          max: axisMax,
          interval: Math.max(1, axisMax / 5),
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: "rgba(207, 221, 246, 0.58)", fontSize: 11, margin: 10 },
          splitLine: { show: true, lineStyle: { color: "rgba(122, 149, 191, 0.16)", width: 1 } },
        },
        yAxis: {
          type: "category",
          inverse: true,
          data: sortedTaskType.map((item) => item.name),
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: { color: "#d5e6ff", fontSize: 12, margin: 12 },
        },
        series: [
          {
            type: "bar",
            data: sortedTaskType.map((item) => item.value),
            barWidth: 14,
            barMinHeight: 3,
            showBackground: false,
            itemStyle: {
              borderRadius: [0, 4, 4, 0],
              shadowBlur: 6,
              shadowColor: "rgba(65, 170, 255, 0.18)",
              color: (params: { dataIndex: number }) => {
                const colors = palette[params.dataIndex % palette.length];
                return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: colors[0] },
                  { offset: 1, color: colors[1] },
                ]);
              },
            },
          },
        ],
      });
    };

    const renderDeptCharts = (): void => {
      props.depts.forEach((dept) => {
        const el = deptChartRefs.value[dept.id];
        if (!el) return;
        const percent = dept.total > 0 ? Math.floor((dept.done / dept.total) * 100) : 0;
        const chart = deptCharts.get(dept.id) ?? echarts.getInstanceByDom(el) ?? echarts.init(el);
        deptCharts.set(dept.id, chart);
        chart.setOption({
          animationDuration: 450,
          grid: { left: 0, right: 0, top: 0, bottom: 0 },
          xAxis: { type: "value", max: 100, show: false },
          yAxis: { type: "category", data: [""], show: false },
          series: [
            {
              type: "bar",
              data: [percent],
              barWidth: 4,
              showBackground: true,
              backgroundStyle: { color: "rgba(255,255,255,0.12)" },
              itemStyle: { color: "#6ea3ff", borderRadius: [3, 3, 3, 3] },
            },
          ],
        });
      });
    };

    const syncCharts = (): void => {
      nextTick(() => {
        renderTypeChart();
        renderDeptCharts();
      }).catch(() => undefined);
    };

    onMounted(() => {
      syncCharts();
      window.addEventListener("resize", syncCharts);
    });

    watch(() => props.taskType, syncCharts, { deep: true });
    watch(() => props.depts, syncCharts, { deep: true });
    watch(() => props.expandedDept, syncCharts, { deep: true });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", syncCharts);
      typeChart?.dispose();
      deptCharts.forEach((chart) => chart.dispose());
      deptCharts.clear();
      typeChart = null;
    });

    return () => (
      <div class="right-panel card-panel">
        <section class="card module-card">
          <div class="card-title">
            <AlertOutlined />
            异常概览
          </div>
          <TimeFilterBar value={props.abnormalFilter} onChange={props.onAbnormalFilter} />
          <div class="abnormal-row">
            <span>异常任务数</span>
            <strong>{props.abnormal.abnormalTask}</strong>
            <em class={props.abnormal.abnormalTaskTrend >= 0 ? "up" : "down"}>
              {props.abnormal.abnormalTaskTrend >= 0
                ? `↑${props.abnormal.abnormalTaskTrend}%`
                : `↓${Math.abs(props.abnormal.abnormalTaskTrend)}%`}
            </em>
          </div>
          <div class="abnormal-row">
            <span>异常巡检点</span>
            <strong>{props.abnormal.abnormalPoint}</strong>
            <em class={props.abnormal.abnormalPointTrend >= 0 ? "up" : "down"}>
              {props.abnormal.abnormalPointTrend >= 0
                ? `↑${props.abnormal.abnormalPointTrend}%`
                : `↓${Math.abs(props.abnormal.abnormalPointTrend)}%`}
            </em>
          </div>
        </section>

        <section class="card module-card">
          <div class="card-title">
            <BarChartOutlined />
            巡检类型分布
          </div>
          <TimeFilterBar value={props.typeFilter} onChange={props.onTypeFilter} />
          {isTaskTypeEmpty() ? (
            <Empty class="screen-empty chart-empty" description="暂无巡检类型数据" />
          ) : (
            <div ref={typeChartRef} class="echart-box chart-scroll-wrap" />
          )}
        </section>

        <section class="card dept-card module-card">
          <div class="card-title">
            <ApartmentOutlined />
            部门统计
          </div>
          <TimeFilterBar value={props.deptFilter} onChange={props.onDeptFilter} />
          {props.depts.length === 0 ? (
            <Empty class="screen-empty dept-empty" description="暂无部门统计数据" />
          ) : (
            props.depts.map((dept) => {
              const open = props.expandedDept.includes(dept.id);
              return (
                <div class="dept-item">
                  <div class="dept-head" onClick={() => props.onToggleDept(dept.id)}>
                    <span>
                      {open ? "›" : "›"} {dept.name}
                    </span>
                    <span>
                      {dept.done} / {dept.total}
                    </span>
                  </div>
                  <div
                    class="dept-echart-row"
                    ref={(el) => {
                      deptChartRefs.value[dept.id] = el as HTMLDivElement | null;
                    }}
                  />
                  {open && (
                    <div class="dept-members">
                      {dept.members.map((member) => (
                        <div class="dept-member">
                          <span>{member.name}</span>
                          <span>
                            {member.done}/{member.total} ({Math.floor((member.done / member.total) * 100)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      </div>
    );
  },
});
