import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import DeviceStatistics from "../security-monitoring-safty/device-statistics";
import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getstatus, groupTotalSearch, statisticsSituation } from "@/infrastructure/api/alarm";
import { alarmTrend } from "@/infrastructure/utils/requestData/alarm";
import elevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import displayPanel from "@/shared-ui/panel/display-panelsafty";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import LineChart from "@/shared-ui/panel/lineChart";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const alarmModalShow = ref<boolean>(false);
    let alarmtimeType = ref({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const trend = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const parameter = reactive({
      alarmEventTypeId: "",
      dateRange: [],
      alarmStatus: "",
    });
    const eventTime = ref({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const detectionData = ref([
      {
        name: "报警",
        value: 0,
        color: "#FFC947", // 黄色
      },
    ]);
    const contentList = ref([
      {
        name: "报警超时率",
        value: 0,
      },
      {
        name: "报警正确率",
        value: 0,
      },
      {
        name: "动环报警占比",
        value: 0,
      },
      {
        name: "报警处理率",
        value: 0,
      },
    ]);
    const deviceStatisticsData = reactive({
      title: "报警总数",
      total: 48,
      itemize: [
        {
          name: "处理中",
          label: "已挂起",
          value: 23,
          offline: 15,
          key: "OFFLINE1",
        },
        {
          name: "已处理",
          label: "待确认",
          value: 23,
          offline: 15,
          key: "OFFLINE2",
        },
      ],
    });
    const xData = reactive({
      arr: ["1时", "2时", "3时", "4时", "5时"],
    });
    const series = reactive([
      {
        data: [0],
        linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
      },
    ]);
    const changeDate = async () => {
      const data = await statisticsSituation({
        areaId: globalState.business.currentAreaId,
        period: alarmtimeType.value.dateRange.join(","),
        sceneType: globalState.business.currentMenu,
      });
      contentList.value[0].value = Number(data.timeoutRatio);
      contentList.value[1].value = Number(data.actualRatio);
      contentList.value[2].value = Number(data.ratio);
      contentList.value[3].value = Number(data.handlerRatio);
    };
    const handelClickItemize = (value) => {
      const obj = {
        挂起: "ALARM_SUSPEND",
        处理中: "ALARM_PROGRESS_CONFIRMED",
        待确认: "ALARM_UN_CONFIRMED",
        已处理: "ALARM_HANDLER",
      };
      parameter.alarmStatus = obj[value];
      parameter.alarmEventTypeId = undefined;
      parameter.dateRange = eventTime.value.dateRange;
      alarmModalShow.value = true;
    };
    const alarmEventTop = async () => {
      const res = await getstatus({
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: eventTime.value.dateRange.join(","),
        type: eventTime.value.timeType,
      });
      deviceStatisticsData.total = res.alarmNum;
      deviceStatisticsData.itemize[0].value = res.alarmStatusStatistics.find((e) => e.alarmStatus === "ALARM_SUSPEND").alarmNum;
      deviceStatisticsData.itemize[0].offline = res.alarmStatusStatistics.find(
        (e) => e.alarmStatus === "ALARM_PROGRESS_CONFIRMED",
      ).alarmNum;
      deviceStatisticsData.itemize[1].value = res.alarmStatusStatistics.find((e) => e.alarmStatus === "ALARM_UN_CONFIRMED").alarmNum;
      deviceStatisticsData.itemize[1].offline = res.alarmStatusStatistics.find((e) => e.alarmStatus === "ALARM_HANDLER").alarmNum;
      const data = await groupTotalSearch({
        areaId: globalState.business.currentAreaId,
        period: eventTime.value.dateRange.join(","),
        sceneType: globalState.business.currentMenu,
      });
      const colors = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A", "#29C2FF", "#74AEE7", "#655DD1", "#B9D9FF", "#6EE3E1"];
      detectionData.value = data.map((item, index) => {
        return {
          id: item.id,
          name: item.name,
          value: item.totalNum,
          color: colors[index],
        };
      });
    };
    // 设备报警趋势
    const alarmTrendInfo = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: trend.value.dateRange.join(","),
        type: trend.value.timeType,
      };
      let res: any = await alarmTrend(param);
      xData.arr = res.xdata;
      series[0].data = res.ydata;
    };
    const closeModal = () => {
      alarmModalShow.value = false;
    };
    const alarmOpen = (value) => {
      //@ts-ignore
      parameter.alarmEventTypeId = detectionData.value.find((e) => e.name === value.data.name).id;
      parameter.alarmStatus = undefined;
      parameter.dateRange = eventTime.value.dateRange;
      alarmModalShow.value = true;
    };
    const clickRow = (value) => {
      parameter.alarmEventTypeId = value.id;
      parameter.dateRange = eventTime.value.dateRange;
      alarmModalShow.value = true;
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="报警情况统计">
          <template>
            {" "}
            <DateInlineForm
              modelValue={alarmtimeType.value}
              onUpdate:modelValue={(v) => {
                alarmtimeType.value = v;
              }}
              onSearch={changeDate}
            ></DateInlineForm>
          </template>
          <displayPanel bg-img={"overView16.png"} content-list={contentList.value} showimg={false}></displayPanel>
        </SubPanelTemplate>
        <SubPanelTemplate title="报警事件占比" class="alarm-event">
          <template>
            {" "}
            <DateInlineForm
              modelValue={eventTime.value}
              onUpdate:modelValue={(v) => {
                eventTime.value = v;
              }}
              onSearch={alarmEventTop}
            ></DateInlineForm>
          </template>
          {deviceStatisticsData.total !== 0 && (
            <div>
              <DeviceStatistics
                onHandelClickItemize={handelClickItemize}
                imgPath="business-icon/triage-queue/10.png"
                statistic={deviceStatisticsData}
              ></DeviceStatistics>
              <div class="elevator-analysis">
                <div class="chart">
                  <elevator-analysis-pie onClickbar={alarmOpen} pieData={detectionData.value}>
                    <div style="color: #fff;text-align: center;font-size: 14px;"> {deviceStatisticsData.total}</div>
                    <div style="color: #fff;text-align: center;font-size: 14px;"> 报警总量</div>
                  </elevator-analysis-pie>
                </div>
                <elevatorAnalysisList onHandlecurrent={clickRow} contentList={detectionData.value} class="pie_list"></elevatorAnalysisList>
              </div>
            </div>
          )}
          <div class="body" style="min-height: 150px;">
            {" "}
            <noData></noData>
          </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="报警趋势" class="alarm-event">
          <template>
            {" "}
            <DateInlineForm
              modelValue={trend.value}
              onUpdate:modelValue={(v) => {
                trend.value = v;
              }}
              onSearch={alarmTrendInfo}
            ></DateInlineForm>
          </template>
          {!series[0].data.every((value) => value === 0) && (
            <LineChart class="line_char" x-data={xData.arr} series={series} title={"次"}></LineChart>
          )}
          <div class="body" style="min-height: 150px;">
            {" "}
            <noData></noData>
          </div>
        </SubPanelTemplate>
        <modal-alarm-table show-modal={alarmModalShow.value} onClose={closeModal} parameter={parameter}></modal-alarm-table>
      </>
    );
  },
});

export default Left;
