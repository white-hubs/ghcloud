import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import VisitingDataPic from "@/features/cards/triage-queue/components/visiting-data-pic";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { dcStatTrend, statCategoryAll, statTimeCategory } from "@/infrastructure/api/energy";
import bus from "@/infrastructure/utils/bus";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import Pie from "@/shared-ui/panel/pie";
import TipsCount from "@/shared-ui/panel/tipsCount";
import { ModelValueItf } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./leftNew.module.less";

export const LeftNew = defineComponent({
  name: "LeftNew",
  setup(_props, ctx) {
    const workOrderTime = ref<ModelValueItf>();
    const energyConsumption = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: [""],
    });
    const carbonTime = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: [""],
    });
    let alarmsNumber = ref<number>(0);
    const timeList = [
      { label: "本周", value: "THIS_WEEK" },
      { label: "本月", value: "THIS_MONTH" },
      { label: "今年", value: "THIS_YEAR" },
    ];
    const pieData = ref([]);
    const listData = ref([]);
    const alarmCon = ref({
      count: 0,
      ratio: 10,
    });
    const column = reactive([
      {
        title: "报警时间",
        dataIndex: "alarmTime",
        width: 120,
      },
      {
        title: "报警级别",
        dataIndex: "alarmLevelName",
      },
      {
        title: "报警事件",
        dataIndex: "alarmEventName",
      },
      {
        title: "状态",
        dataIndex: "alarmStatus",
        slots: {
          customRender: "alarmStatus",
        },
      },
    ]);
    const { takeNotes, getAlarmTakeNotes, getAlarmsNumber } = useCommon();
    const { globalState } = useStateStore();

    // 群控组实时数据
    const visitingData = ref([
      { title: "综合能耗tce", value: 0, img: getAssetsImage("overView43.png"), ratio: 0 },
      { title: "碳排量kg CO₂e", value: 0, img: getAssetsImage("overView12.png"), ratio: 0 },
    ]);
    const carbonEmissionsData = reactive({
      xData: [],
      yData: [
        { data: [], linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"], lineColor: "rgba(120, 252, 252, 1)" },
      ],
    });
    const receptionTrendsChartData = reactive({
      xData: [],
      yData: [
        { data: [], linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"], lineColor: "rgba(120, 252, 252, 1)" },
      ],
    });
    // 综合能耗趋势
    const changeHandleEnergyConsumptionTime = async () => {
      const params = {
        period: energyConsumption.value.dateRange.join(","),
        type: energyConsumption.value.timeType,
      };
      let res = await dcStatTrend(params);
      receptionTrendsChartData.xData = res.map((item) => item.time);
      receptionTrendsChartData.yData[0].data = res.map((item) => item.value);
    };
    const changeCarbonTime = async () => {
      const params = {
        period: carbonTime.value.dateRange.join(","),
        type: carbonTime.value.timeType,
        instrumentType: "electricity_meter",
      };
      const res = await statTimeCategory(params);
      carbonEmissionsData.xData = res.map((item) => item.time);
      carbonEmissionsData.yData[0].data = res.map((item) => item.value);
    };
    // 能碳概览
    const changeHandleworkOrderTime = async () => {
      const params = {
        period: workOrderTime.value.dateRange.join(","),
        type: workOrderTime.value.timeType,
      };
      let res = await statCategoryAll(params);
      res.forEach((item) => {
        if (item.instrumentType === "carbon") {
          visitingData.value[1].value = item.value;
          visitingData.value[1].ratio = item.qoqValueRate || 0;
        } else if (item.instrumentType === "zh") {
          visitingData.value[0].value = item.value;
          visitingData.value[0].ratio = item.qoqValueRate || 0;
        }
      });
    };

    // 报警记录
    async function changeTakeNotes() {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: takeNotes.value.dateRange.join(","),
        type: takeNotes.value.timeType,
        pageSize: 50,
        pageNumber: 1,
      };
      let data = await getAlarmTakeNotes(param);
      alarmCon.value = await getAlarmsNumber(param);
      listData.value = data.listData;
      alarmsNumber.value = data.alarmsNumber;
      pieData.value = data.pieData?.filter((item) => !item.name.includes("超时"));
    }
    const handelClickRow = (record) => {
      if (record.alarmTargetCode) {
        bus.emit("equipmentPosition", record);
      }
    };

    return (): JSX.Element => (
      <>
        <div>
          <div class="visiting-data">
            <SubPanelTemplate title="能碳概览" zoomable zoom-title="能碳概览详情" zoom-width={600}>
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
              {visitingData.map((item) => (
                <div class="item" key={item.title} data-no-zoom>
                  <a-statistic title={item.title}>
                    <template>
                      <count-to startVal={0} endVal={item.value} duration={1000} separator></count-to>
                      <div class="ringRatio">
                        <span> 环比</span>
                        <div class={["downtriangle", item.ratio > 0 && "uptriangle"]}></div>
                        <div class={[item.ratio > 0 ? "up" : "down"]}> {item.ratio + "%"}</div>
                      </div>
                    </template>
                  </a-statistic>
                </div>
              ))}
              <template>
                <div class="zoom-visiting-data">
                  {visitingData.map((item) => (
                    <div class="zoom-item" key={item.title}>
                      <a-statistic title={item.title}>
                        <template>
                          <count-to startVal={0} endVal={item.value} duration={1000} separator></count-to>
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
              </template>
            </SubPanelTemplate>
          </div>
          <SubPanelTemplate title="综合能耗趋势" zoomable zoom-title="综合能耗趋势详情">
            <template>
              {" "}
              <DateInlineForm
                timeList={timeList}
                modelValue={energyConsumption.value}
                onUpdate:modelValue={(v) => {
                  energyConsumption.value = v;
                }}
                onSearch={changeHandleEnergyConsumptionTime}
                data-no-zoom
              ></DateInlineForm>
            </template>
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
              {" "}
              <div class="zoom-chart-container">
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
            </template>
          </SubPanelTemplate>
          <SubPanelTemplate title="碳排量趋势图" zoomable zoom-title="碳排量趋势图详情">
            <template>
              {" "}
              <DateInlineForm
                timeList={timeList}
                modelValue={carbonTime.value}
                onUpdate:modelValue={(v) => {
                  carbonTime.value = v;
                }}
                onSearch={changeCarbonTime}
                data-no-zoom
              ></DateInlineForm>
            </template>
            <div class="chart" data-no-zoom>
              {" "}
              <LineChart
                x-data={carbonEmissionsData.xData}
                series={carbonEmissionsData.yData}
                showLegend={false}
                gridTop="4"
                unit={{ x: "", y: "" }}
              />
            </div>
            <template>
              {" "}
              <div class="zoom-chart-container">
                {" "}
                <LineChart
                  x-data={carbonEmissionsData.xData}
                  series={carbonEmissionsData.yData}
                  showLegend={false}
                  gridTop="10"
                  unit={{ x: "", y: "" }}
                  height={380}
                />
              </div>
            </template>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警记录" zoomable zoom-title="报警记录详情">
            <template>
              {" "}
              <DateInlineForm
                modelValue={takeNotes}
                onUpdate:modelValue={(v) => {
                  takeNotes.value = v;
                }}
                onSearch={changeTakeNotes}
                data-no-zoom
              ></DateInlineForm>
            </template>
            <div class="body" data-no-zoom>
              <OperateDays title="报警总数" value={alarmCon.value.count} class="body-num"></OperateDays>
              <div class="pie-chart">
                <Pie data={alarmsNumber.value} x-data={pieData.value} />
                {pieData.map((item, index) => (
                  <TipsCount status={String(index)} count={item.value} />
                ))}
              </div>
              <div class="footer">
                <RollTable column={column} data={listData.value} onClickRow={handelClickRow}>
                  <template>
                    {record.alarmStatus === "ALARM_UN_CONFIRMED" && <span style="color: #f14545"> 待处理</span>}
                    {record.alarmStatus === "ALARM_PROGRESS_CONFIRMED" ? <span style="color: #ffab10"> 处理中</span> : null}
                    <span style="color: #00f27b"> 已处理</span>
                  </template>
                </RollTable>
              </div>
            </div>
            <template>
              <div class="zoom-alarm-body">
                <OperateDays title="报警总数" value={alarmCon.value.count} class="zoom-body-num"></OperateDays>
                <div class="zoom-pie-chart">
                  <Pie data={alarmsNumber.value} x-data={pieData.value} class="zoom-pie" />
                  <div class="zoom-tips-wrapper">
                    {pieData.map((item, index) => (
                      <TipsCount status={String(index)} count={item.value} class="zoom-tips" />
                    ))}
                  </div>
                </div>
                <div class="zoom-footer">
                  <RollTable column={column} data={listData.value} onClickRow={handelClickRow} class="zoom-roll-table">
                    <template>
                      {record.alarmStatus === "ALARM_UN_CONFIRMED" && <span style="color: #f14545"> 待处理</span>}
                      {record.alarmStatus === "ALARM_PROGRESS_CONFIRMED" ? <span style="color: #ffab10"> 处理中</span> : null}
                      <span style="color: #00f27b"> 已处理</span>
                    </template>
                  </RollTable>
                </div>
              </div>
            </template>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default LeftNew;
