import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import modalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { collectConfigList, dcStatTrend, projectStatCategory } from "@/infrastructure/api/energy";
import { statCategoryAll } from "@/infrastructure/api/energy";
import { equipmentTotal } from "@/infrastructure/api/equipment";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import { buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import PieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { storeMenu } from "@/visualization-core/stores/menu";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./rightNew.module.less";

export const RightNew = defineComponent({
  name: "RightNew",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const pieData = ref([]);
    const deviceParameter = reactive({
      areaId: globalState.business.currentAreaId,
      tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
      deviceState: true,
    });
    const deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    const workOrderTime = ref<ModelValueItf>();
    const energyUsageTime = ref<ModelValueItf>();
    const energyCarbonTime = ref<ModelValueItf>();
    const colorList = ["#FFAB10", "#2F8DFF", "#F14545", "#19F8F7"];
    const alarmTotal = ref(0);
    const state = ref("electricity_meter");
    const deviceStateList = ref([]);
    const deviceModalShow = ref<boolean>(false);
    const energyAnalysis = ref([
      {
        data: [],
        title: "电力",
      },
      {
        data: [],
        title: "水",
      },
      {
        data: [],
        title: "燃气",
      },
    ]);
    const visitingData = ref([]);
    const receptionTrendsChartData = reactive({
      xData: ["4", "8", "12", "16", "20", "24h"],
      yData: [
        { data: [], linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"], lineColor: "rgba(120, 252, 252, 1)" },
      ],
    });
    const changeHandleworkOrderTime = async () => {
      const params = {
        period: workOrderTime.value.dateRange.join(","),
        type: workOrderTime.value.timeType,
      };
      let res = await statCategoryAll(params);
      res = res.filter((item) => item.instrumentType !== "zh" && item.instrumentType !== "carbon");
      visitingData.value = res.map((item) => {
        return {
          img: getAssetsImage("overView12.png"),
          ratio: item.qoqValueRate || 0,
          value: item.value,
          title: item.instrumentTypeName,
        };
      });
    };
    const handelClickItemize = (value) => {
      if (value.label === "正常") {
        deviceParameter.deviceState = true;
      } else {
        deviceParameter.deviceState = false;
      }
      deviceModalShow.value = true;
    };
    const changeEnergyCarbonTime = async () => {
      const params = {
        type: energyCarbonTime.value.timeType,
        period: energyCarbonTime.value.dateRange.join(","),
        instrumentType: state.value,
      };
      const res = await dcStatTrend(params);

      receptionTrendsChartData.xData = res.map((item) => item.time);
      receptionTrendsChartData.yData[0].data = res.map((item) => item.value);
    };
    // 用能分析
    const changeAppointmentTime = async (): Promise<void> => {
      const params = {
        period: energyUsageTime.value.dateRange.join(","),
        type: energyUsageTime.value.timeType,
        projectCategory: "ITEM",
      };
      //   // 电表
      let electricity: any = await projectStatCategory(Object.assign(params, { instrumentType: "electricity_meter" }));
      energyAnalysis.value[0].data = electricity.map((item: any, index) => {
        return {
          label: item.name,
          value: item.value,
          color: colorList[index],
        };
      });
      // 水表
      let water: any = await projectStatCategory(Object.assign(params, { instrumentType: "water_meter" }));
      energyAnalysis.value[1].data = water.map((item: any, index) => {
        return {
          label: item.name,
          value: item.value,
          color: colorList[index],
        };
      });
      // 水表
      let gas_meter: any = await projectStatCategory(Object.assign(params, { instrumentType: "gas_meter" }));
      energyAnalysis.value[2].data = gas_meter.map((item: any, index) => {
        return {
          label: item.name,
          value: item.value,
          color: colorList[index],
        };
      });
    };
    // 能耗分类配置
    const getCollectConfigList = async () => {
      const res = await collectConfigList();
      deviceStateList.value = res.map((e) => {
        return {
          label: e.categoryName,
          value: e.categoryCode,
        };
      });
      state.value = deviceStateList.value[0].value;
    };
    // 设备实时数据
    const deviceDataInfo = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
      };
      let res: any = await equipmentTotal(params);
      if (!res.deviceNum) {
        return;
      }
      pieData.value.length = 0;
      alarmTotal.value = 0;
      res.deviceStatusNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
          label: deviceStatusType[item.name],
          color: colorList[index],
          value: item.num,
        };
        pieData.value.push(obj);
      });
    };
    onMounted(() => {
      deviceDataInfo();
      getCollectConfigList();
    });

    return (): JSX.Element => (
      <>
        <div>
          <div class="visiting-data">
            <SubPanelTemplate title="能耗用能统计" zoomable zoom-title="能耗用能统计详情" zoom-width={600}>
              <template>
                {" "}
                <DateInlineForm
                  modelValue={workOrderTime.value}
                  onUpdate:modelValue={(v) => {
                    workOrderTime.value = v;
                  }}
                  onSearch={changeHandleworkOrderTime}
                  data-no-zoom
                ></DateInlineForm>
              </template>
              <div class="statistics-box" data-no-zoom>
                {visitingData.map((item) => (
                  <div class="item" key={item.title}>
                    <a-statistic title={item.title}>
                      <template>
                        <count-to startVal={0} endVal={item.value} duration={2000} separator></count-to>
                        <div class="ringRatio">
                          <span> 环比</span>
                          <div class={["downtriangle", item.ratio > 0 && "uptriangle"]}></div>
                          <div class={[item.ratio > 0 ? "up" : "down"]}> {item.ratio + "%"}</div>
                        </div>
                      </template>
                    </a-statistic>
                  </div>
                ))}
              </div>
              <template>
                <div class="zoom-visiting-data">
                  <div class="statistics-box">
                    {visitingData.map((item) => (
                      <div class="zoom-item item" key={item.title}>
                        <a-statistic title={item.title}>
                          <template>
                            <count-to startVal={0} endVal={item.value} duration={2000} separator></count-to>
                            <div class="zoom-ringRatio">
                              <span> 环比</span>
                              <div class={["zoom-downtriangle", item.ratio > 0 && "zoom-uptriangle"]}></div>
                              <div class={[item.ratio > 0 ? "zoom-up" : "zoom-down"]}> {item.ratio + "%"}</div>
                            </div>
                          </template>
                        </a-statistic>
                      </div>
                    ))}
                  </div>
                </div>
              </template>
            </SubPanelTemplate>
          </div>
          <div class="visiting-data">
            <SubPanelTemplate title="能耗用能趋势图" zoomable zoom-title="能耗用能趋势图详情">
              <template>
                {" "}
                <DateInlineForm
                  modelValue={energyCarbonTime.value}
                  onUpdate:modelValue={(v) => {
                    energyCarbonTime.value = v;
                  }}
                  onSearch={changeEnergyCarbonTime}
                  data-no-zoom
                ></DateInlineForm>
              </template>
              <div class="radioBar" data-no-zoom>
                <a-radio-group
                  onChange={changeEnergyCarbonTime}
                  value={state.value}
                  onUpdate:value={(v) => {
                    state.value = v;
                  }}
                >
                  {deviceStateList.map((item) => (
                    <a-radio-button key={item.value} value={item.value}>
                      {" "}
                      {item.label}
                    </a-radio-button>
                  ))}
                </a-radio-group>
              </div>
              <div class="chart" data-no-zoom>
                {" "}
                <LineChart
                  x-data={receptionTrendsChartData.xData}
                  series={receptionTrendsChartData.yData}
                  showLegend={false}
                  gridTop="4"
                  unit={{ x: "", y: "" }}
                />
              </div>
              <template>
                <div class="zoom-trend-panel">
                  <div class="zoom-radioBar" data-no-zoom>
                    <a-radio-group
                      onChange={changeEnergyCarbonTime}
                      value={state.value}
                      onUpdate:value={(v) => {
                        state.value = v;
                      }}
                    >
                      {deviceStateList.map((item) => (
                        <a-radio-button key={item.value} value={item.value}>
                          {" "}
                          {item.label}
                        </a-radio-button>
                      ))}
                    </a-radio-group>
                  </div>
                  <div class="zoom-chart-container" data-no-zoom>
                    {" "}
                    <LineChart
                      x-data={receptionTrendsChartData.xData}
                      series={receptionTrendsChartData.yData}
                      showLegend={false}
                      gridTop="10"
                      unit={{ x: "", y: "" }}
                      height={380}
                    />
                  </div>
                </div>
              </template>
            </SubPanelTemplate>
          </div>
          <SubPanelTemplate title="用能分析" zoomable zoom-title="用能分析详情" zoom-width={600}>
            <template>
              {" "}
              <DateInlineForm
                modelValue={energyUsageTime.value}
                onUpdate:modelValue={(v) => {
                  energyUsageTime.value = v;
                }}
                onSearch={changeAppointmentTime}
                data-no-zoom
              ></DateInlineForm>
            </template>
            {energyAnalysis.map((item) => (
              <div class="flex-between analysis" key={item.title} data-no-zoom>
                <PlanPie pieData={item.data}>
                  {" "}
                  <div class="content">
                    {" "}
                    <div> {item.title}</div>
                  </div>
                </PlanPie>
                <PieList class="pieList" roundPieData={item.data}></PieList>
              </div>
            ))}
            <template>
              <div class="zoom-analysis-panel">
                {energyAnalysis.map((item) => (
                  <div class="flex-between zoom-analysis" key={item.title} data-no-zoom>
                    <PlanPie pieData={item.data} class="zoom-plan-pie">
                      {" "}
                      <div class="content">
                        {" "}
                        <div> {item.title}</div>
                      </div>
                    </PlanPie>
                    <PieList class="zoom-pieList" roundPieData={item.data}></PieList>
                  </div>
                ))}
              </div>
            </template>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备状态分布" zoomable zoom-title="设备状态分布详情" zoom-width={600}>
            <div class="flex-between" data-no-zoom>
              <PlanPie pieData={pieData.value}>
                <div class="content">
                  <div class="total-num"> {alarmTotal.value}</div>
                  <div style="font-size: 12px"> 设备总数</div>
                </div>
              </PlanPie>
              <PieList roundPieData={pieData.value} onHandelClickItemize={handelClickItemize}></PieList>
            </div>
            <template>
              <div class="zoom-device-status flex-between" data-no-zoom>
                <PlanPie pieData={pieData.value} class="zoom-plan-pie">
                  <div class="content">
                    <div class="total-num zoom-total-num"> {alarmTotal.value}</div>
                    <div style="font-size: 16px"> 设备总数</div>
                  </div>
                </PlanPie>
                <PieList class="zoom-pieList" roundPieData={pieData.value} onHandelClickItemize={handelClickItemize}></PieList>
              </div>
            </template>
          </SubPanelTemplate>
          <modal-equipmentAll-table
            show-modal={deviceModalShow.value}
            onClose={() => {
              deviceModalShow.value = false;
            }}
            parameter={deviceParameter}
          ></modal-equipmentAll-table>
        </div>
      </>
    );
  },
});

export default RightNew;
