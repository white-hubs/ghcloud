import { defineComponent } from "vue";
import { ref, onMounted } from "vue";

import liftModal from "./lift-modal";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsLevel, statisticsStatus, statisticsTrend } from "@/infrastructure/api/alarm";
import { liftFiveCallLogPage } from "@/infrastructure/api/securitymanagement";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import pieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
    const showModal = ref(false);
    const roundPieData = ref([]);
    const devicesNum = ref(0);
    const topTimeFrame = ref<ModelValueItf>();
    let timeFrame = ref<ModelValueItf>();
    const { globalState } = useStateStore();
    const xData = ref<string[]>([]);
    const yData = ref<number[]>([]);
    const alarmCon = ref({
      count: 0,
      ratio: 0,
    });
    const columns = ref([
      {
        title: "电梯编号",
        dataIndex: "liftNumber",
        width: 120,
      },
      {
        title: "处理内容",
        dataIndex: "callContent",
      },
      {
        title: "处理状态",
        dataIndex: "handlingSituation",
      },
    ]);
    const tableData = ref([]);
    // 报警状态统计&报警趋势折线图统计
    async function getAlarmsNumber() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: topTimeFrame.value.dateRange.join(","),
        type: topTimeFrame.value.timeType,
      };
      xData.value.length = 0;
      yData.value.length = 0;
      let Status = await statisticsStatus(params);
      let Trend = await statisticsTrend(params);
      alarmCon.value = {
        count: Status.alarmNum,
        ratio: Status.chainRatio,
      };
      Trend.forEach((item) => {
        let time = "";
        if (params.type === "TODAY") {
          time = "时";
        } else if (params.type === "THIS_YEAR") {
          time = "月";
        } else {
          time = "号";
        }
        xData.value.push(item.period + time);
        yData.value.push(item.alarmNum);
      });
    }
    const handleAll = () => {
      showModal.value = true;
    };
    // 获取报警级别分布数据
    async function getAlarmLevel() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: timeFrame.value.dateRange.join(","),
        type: timeFrame.value.timeType,
      };
      let res = await statisticsLevel(params);
      devicesNum.value = 0;
      roundPieData.value = res.map((item, index) => {
        devicesNum.value += item.alarmNum;
        return {
          label: (item.name += "报警"),
          color: colorList[index],
          value: item.alarmNum,
        };
      });
    }
    // 获取五方通话数据
    const getLiftFiveCallLogPage = async () => {
      const res = await liftFiveCallLogPage({
        pageNumber: 1,
        pageSize: 10,
      });
      tableData.value = res.records.map((e) => {
        return {
          liftNumber: e.liftNumber,
          callContent: e.handlingSituation ? e.callContent : "--",
          handlingSituation: e.handlingSituation ? "已处理" : "未处理",
        };
      });
    };
    onMounted(() => {
      getLiftFiveCallLogPage();
      getAlarmLevel();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="报警等级统计">
            <template>
              {" "}
              <DateInlineForm
                modelValue={timeFrame.value}
                onUpdate:modelValue={(v) => {
                  timeFrame.value = v;
                }}
                onSearch={getAlarmLevel}
              ></DateInlineForm>
            </template>
            <div class="equipmentAlarm">
              <RoundPie data={roundPieData.value} eventNum={devicesNum.value}>
                <div class="content">
                  <span> {devicesNum.value}</span>
                  <br />
                  报警总数
                </div>
              </RoundPie>
              <pieList roundPieData={roundPieData.value}></pieList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备报警趋势">
            <template>
              {" "}
              <DateInlineForm
                modelValue={topTimeFrame.value}
                onUpdate:modelValue={(v) => {
                  topTimeFrame.value = v;
                }}
                onSearch={getAlarmsNumber}
              ></DateInlineForm>
            </template>
            <div class="body">
              <OperateDays title="报警数" value={alarmCon.value.count} class="body-num">
                <div class="extra flex-start">
                  <div class="mode"> 环比</div>
                  <div class={["downtriangle", alarmCon.value.ratio > 0 && "uptriangle"]}></div>
                  <div class={[alarmCon.value.ratio < 0 ? "down" : "up"]}>{alarmCon.value.ratio}%</div>
                </div>
              </OperateDays>
              <div class="chart">
                <LineChart
                  x-data={xData.value}
                  series={[
                    {
                      data: yData,
                      linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
                    },
                  ]}
                />
              </div>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="最新五方通话">
            <template>
              {" "}
              <div class="dataTitle">
                {" "}
                <div class="dataTitle-right" style="color: #5EA6FF;" onClick={handleAll}>
                  {" "}
                  查看更多{">>"}
                </div>
              </div>
            </template>
            <RollTable column={columns.value} data={tableData.value} showLength={8}></RollTable>
          </SubPanelTemplate>
        </div>
        <liftModal
          showModal={showModal.value}
          onClose={() => {
            showModal.value = false;
          }}
        ></liftModal>
      </>
    );
  },
});

export default Right;
