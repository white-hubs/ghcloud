import moment from "moment";
import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import DeviceStatistics from "../security-monitoring-safty/device-statistics";
import hiddenDangerTable from "./components/hidden-danger-table";
import monitorPanel from "./components/monitor-panel";
import smallEngineeringTable from "./components/small-engineering-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsSituation } from "@/infrastructure/api/alarm";
import {
  completionRate,
  finishedRatio,
  handleRatio,
  hiddenNumStatistics,
  hiddenTypeStatistics,
  projectNumStatistics,
  projectTrendStatistics,
} from "@/infrastructure/api/maintain";
import elevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import displayPanel from "@/shared-ui/panel/display-panelsafty";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import LineChart from "@/shared-ui/panel/lineChart";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const { globalState } = useStateStore();

    //报警情况统计==================================================================================================
    let alarmtimeType = ref({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const contentList = ref([
      {
        name: "报警处理率",
        field: "handlerRatio",
        value: 0,
      },
      {
        name: "隐患处理率",
        field: "ratio",
        value: 0,
      },
      {
        name: "巡检任务完成率",
        field: "confirmedRatio",
        value: 0,
      },
      {
        name: "巡更任务完成率",
        field: "actualRatio",
        value: 0,
      },
      {
        name: "小散工程异常率",
        field: "timeoutRatio",
        value: 0,
      },
    ]);
    const changeDate = async () => {
      const { ratio } = await completionRate({ period: alarmtimeType.value.dateRange.join(",") });
      const res = await projectNumStatistics({ period: alarmtimeType.value.dateRange.join(",") });
      contentList.value[2].value = await finishedRatio({ period: alarmtimeType.value.dateRange.join(",") });
      contentList.value[1].value = await handleRatio({ period: alarmtimeType.value.dateRange.join(",") });
      contentList.value[3].value = ratio;
      contentList.value[4].value = res.total ? (res.abnormal / res.total) * 100 : 0;
      const data = await statisticsSituation({
        areaId: globalState.business.currentAreaId,
        period: alarmtimeType.value.dateRange.join(","),
        deviceTags: [globalState.business.currentMenu],
      });
      contentList.value[0].value = Number(data.handlerRatio);
    };
    const showModal = ref(false);
    const parameterSmall = reactive({
      type: "",
      status: "",
      period: "",
      submitTime: "",
    });
    const showModalSmall = ref(false);
    const parameter = reactive({
      type: "",
      status: "",
      submitTime: "",
    });
    //隐患统计==================================================================================================
    const eventTime = ref({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const equipmentStatisticsData = reactive({
      title: "隐患总数",
      total: 48,
      itemize: [
        {
          name: "已完成隐患数",
          label: "处理中隐患数",
          value: 23,
          offline: 15,
          key: "OFFLINE1",
        },
      ],
    });
    const detectionData = ref([]);
    const alarmEventTop = async () => {
      const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
      const res = await hiddenNumStatistics({ period: eventTime.value.dateRange.join(",") });
      const data = await hiddenTypeStatistics({ period: eventTime.value.dateRange.join(",") });
      equipmentStatisticsData.total = res.total;
      equipmentStatisticsData.itemize[0].offline = res.finished;
      equipmentStatisticsData.itemize[0].value = res.inHand;
      detectionData.value = data.typeStatisticsList.map((item, index) => {
        return {
          name: item.name,
          value: item.num,
          color: colors[index],
        };
      });
    };

    //小散工程记录==================================================================================================
    const monitorPanelData = ref([
      {
        imgPath: "overView5.png",
        value: 0,
        name: "小散工程总数",
        color: "rgba(41, 137, 255, 1)",
      },
      {
        imgPath: "overView87.png",
        value: 0,
        name: "小散工程异常数",
        color: "rgba(255, 171, 16, 1)",
      },
    ]);
    const series = reactive([
      {
        data: [10, 12, 34, 5, 12],
        linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
        smooth: false,
      },
    ]);
    const xData = reactive({
      arr: ["1时", "2时", "3时", "4时", "5时"],
    });
    const deviceModalShow = ref<boolean>(false);

    const handelClickItemize = (value) => {
      parameter.type = "ALL";
      if (value === "已完成隐患数") {
        parameter.status = "FINISHED";
      } else if (value === "处理中隐患数") {
        parameter.status = "ACTIVE";
      } else {
        parameter.status = "";
      }
      parameter.submitTime = eventTime.value.dateRange.join(",");
      showModal.value = true;
    };
    const getSmallEngineeringData = async () => {
      const res = await projectNumStatistics({
        period: moment().startOf("year").format("YYYY-MM-DD 00:00:00") + "," + moment().endOf("year").format("YYYY-MM-DD HH:mm:ss"),
      });
      const data = await projectTrendStatistics();
      monitorPanelData.value[0].value = res.total;
      monitorPanelData.value[1].value = res.abnormal;
      xData.arr = [];
      series[0].data = [];
      data.forEach((item) => {
        xData.arr.push(item.month + "月");
        series[0].data.push(item.num);
      });
    };
    const handelClickDevice = (item?: any) => {
      if (item === 0) {
        parameterSmall.status = "";
      } else {
        parameterSmall.status = "ABNORMAL";
      }
      parameterSmall.period =
        moment().startOf("year").format("YYYY-MM-DD 00:00:00") + "," + moment().endOf("year").format("YYYY-MM-DD HH:mm:ss");
      showModalSmall.value = true;
    };

    onMounted(() => {
      getSmallEngineeringData();
    });

    return (): JSX.Element => (
      <>
        <div>
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
          <SubPanelTemplate title="隐患统计" class="alarm-event">
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
            <DeviceStatistics
              onHandelClickItemize={handelClickItemize}
              imgPath="overView90.png"
              statistic={equipmentStatisticsData}
            ></DeviceStatistics>
            <div class="elevator-analysis">
              <div class="chart">
                <elevator-analysis-pie pieData={detectionData.value}>
                  <div style="color: #fff;text-align: center;font-size: 14px;"> {equipmentStatisticsData.total}</div>
                  <div style="color: #fff;text-align: center;font-size: 14px;"> 隐患总数</div>
                </elevator-analysis-pie>
              </div>
              <elevatorAnalysisList contentList={detectionData.value} class="pie_list"></elevatorAnalysisList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="小散工程记录">
            <div class="monitorPanelBox">
              {monitorPanelData.map((item, index) => (
                <monitorPanel key={item.name} monitorPanelData={item} onHandelClickItemize={handelClickDevice(index)}></monitorPanel>
              ))}
            </div>
            <div class="elevator-analysis">
              {" "}
              <LineChart class="line_char" x-data={xData.arr} series={series}></LineChart>
            </div>
          </SubPanelTemplate>
        </div>
        <hidden-danger-table
          showModal={showModal.value}
          onClose={() => {
            showModal.value = false;
          }}
          parameter={parameter}
        ></hidden-danger-table>
        <small-engineering-table
          showModal={showModalSmall.value}
          onClose={() => {
            showModalSmall.value = false;
          }}
          parameter={parameterSmall}
        ></small-engineering-table>
      </>
    );
  },
});

export default Left;
