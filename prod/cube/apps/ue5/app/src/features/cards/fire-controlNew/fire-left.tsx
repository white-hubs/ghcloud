import { defineComponent } from "vue";
import { ref, reactive } from "vue";

import overviewChartBar from "../hospital/overview-chartBar";
import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmEventTypeStatisticsc, statisticsSituation } from "@/infrastructure/api/alarm";
import { alarmTrend } from "@/infrastructure/utils/requestData/alarm";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import displayPanel from "@/shared-ui/panel/display-panelsafty";
import LineChart from "@/shared-ui/panel/lineChart";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./fire-left.module.less";

export const FireLeft = defineComponent({
  name: "FireLeft",
  setup(_props, ctx) {
    const { globalState } = useStateStore();

    let eventDataList = [];

    const alarmModalShow = ref<boolean>(false);

    const parameter = reactive({
      alarmEventTypeId: "",

      dateRange: [],
    });

    let alarmtimeType = ref<ModelValueItf>({
      timeType: "THIS_YEAR",

      dateRange: [],
    });

    const contentList = ref([
      {
        name: "消防报警占比",

        field: "ratio",

        value: 0,
      },

      {
        name: "报警处理率",

        field: "handlerRatio",

        value: 0,
      },

      {
        name: "报警正确率",

        field: "actualRatio",

        value: 0,
      },

      {
        name: "报警超时率",

        field: "timeoutRatio",

        value: 0,
      },
    ]);

    let trend = reactive<ModelValueItf>({
      timeType: "THIS_YEAR",

      dateRange: [],
    });

    const barData = reactive({
      xData: ["安防报警", "消防报警", "电气报警", "入侵报警"],

      yData: [
        {
          data: [10, 20, 30, 40],

          name: "",

          color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
        },
      ],
    });

    const xData = reactive({ arr: [] });

    const series = reactive([
      {
        data: [],

        linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
      },
    ]);

    const alarmClickBar = (value) => {
      const { name } = value;

      const findItem = eventDataList.find((item) => item.name === name);

      if (findItem) {
        parameter.alarmEventTypeId = findItem.id;

        parameter.dateRange = overviewTime.value.dateRange;

        alarmModalShow.value = true;
      }
    };

    const closeModal = () => {
      alarmModalShow.value = false;
    };

    const overviewTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",

      dateRange: [],
    });

    const changeDate = async () => {
      getAlarmSituation();
    };

    const getAlarmSituation = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,

        areaId: globalState.business.currentAreaId,

        period: alarmtimeType.value.dateRange.join(","),

        type: alarmtimeType.value.timeType,
      };

      let res = await statisticsSituation(params);

      contentList.value = contentList.value.map((item) => {
        return {
          ...item,

          value: +res[item.field],
        };
      });
    };

    const changeHandleOverviewTime = async () => {
      getAlarmEvent();
    };

    const getAlarmEvent = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,

        areaId: globalState.business.currentAreaId,

        period: overviewTime.value.dateRange.join(","),

        type: overviewTime.value.timeType,
      };

      const result = await alarmEventTypeStatisticsc(params);

      barData.xData = result.map((item) => item.name);

      barData.yData[0].data = result.map((item) => item.totalNum);

      eventDataList = result;
    };

    const getAlarmTrend = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,

        areaId: globalState.business.currentAreaId,

        period: trend.dateRange.join(","),

        type: trend.timeType,
      };

      let data: any = await alarmTrend(param);

      xData.arr = data.xdata;

      series[0].data = data.ydata;
    };

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="报警情况统计" zoomable zoom-title="报警情况统计详情" zoom-width={600}>
            <template>
              {" "}
              <DateInlineForm
                modelValue={alarmtimeType.value}
                onUpdate:modelValue={(v) => {
                  alarmtimeType.value = v;
                }}
                onSearch={changeDate}
                data-no-zoom
              ></DateInlineForm>
            </template>
            <displayPanel bg-img={"overView16.png"} content-list={contentList.value} showimg={false} data-no-zoom></displayPanel>
            <template>
              {" "}
              <div class="zoom-display-panel">
                {" "}
                <displayPanel bg-img={"overView16.png"} content-list={contentList.value} showimg={false}></displayPanel>
              </div>
            </template>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警事件统计" zoomable zoom-title="报警事件统计详情">
            <template>
              {" "}
              <DateInlineForm
                modelValue={overviewTime.value}
                onUpdate:modelValue={(v) => {
                  overviewTime.value = v;
                }}
                onSearch={changeHandleOverviewTime}
                data-no-zoom
              ></DateInlineForm>
            </template>
            <div class="chart" data-no-zoom>
              {barData.xData.length && (
                <overviewChartBar onClickbar={alarmClickBar} xData={barData.xData} yData={barData.yData}></overviewChartBar>
              )}
              <noData></noData>
            </div>
            <template>
              <div class="zoom-alarm-content">
                <div class="zoom-barChart" data-no-zoom>
                  {barData.xData.length && (
                    <overviewChartBar
                      onClickbar={alarmClickBar}
                      xData={barData.xData}
                      yData={barData.yData}
                      height={360}
                    ></overviewChartBar>
                  )}
                  <noData></noData>
                </div>
              </div>
            </template>
          </SubPanelTemplate>
          <div class="alarm-event">
            <SubPanelTemplate title="设备报警趋势" zoomable zoom-title="设备报警趋势详情">
              <template>
                {" "}
                <DateInlineForm
                  modelValue={trend}
                  onUpdate:modelValue={(v) => {
                    Object.assign(trend, v);
                  }}
                  onSearch={getAlarmTrend}
                  data-no-zoom
                ></DateInlineForm>
              </template>
              <div class="trend-chart" data-no-zoom>
                {!series[0].data.every((value) => value === 0) && <LineChart x-data={xData.arr} series={series}></LineChart>}
                <div class="body" style="min-height: 150px">
                  {" "}
                  <noData></noData>
                </div>
              </div>
              <template>
                <div class="zoom-trend-chart">
                  {!series[0].data.every((value) => value === 0) && <LineChart x-data={xData.arr} series={series} height={380}></LineChart>}
                  <div class="zoom-no-data">
                    {" "}
                    <noData></noData>
                  </div>
                </div>
              </template>
            </SubPanelTemplate>
          </div>
          <modal-alarm-table show-modal={alarmModalShow.value} onClose={closeModal} parameter={parameter}></modal-alarm-table>
        </div>
      </>
    );
  },
});

export default FireLeft;
