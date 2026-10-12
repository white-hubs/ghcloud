import { defineComponent } from "vue";
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";

import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { abnormalStatistics } from "@/infrastructure/api/alarm";
import { alarmTrend, equipmentNumber } from "@/infrastructure/utils/requestData/alarm";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import deviceModule from "@/shared-ui/panel/deviceModule";
import LineChart from "@/shared-ui/panel/lineChart";
import pieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    interface RoundPie {
      label: string;
      value: number;
      color: string;
    }
    const { getEquipmentNumber } = useCommon();
    const alarmColumn = [
      {
        title: "日期",
        dataIndex: "timeFlag",
        width: 120,
      },
      {
        title: "异常设备数量",
        dataIndex: "equipmentNum",
      },
      {
        title: "报警次数",
        dataIndex: "alarmNum",
        width: 140,
      },
    ];
    const listData = ref([]);
    const receptionTrendsTime = ref<ModelValueItf>();
    const trend = ref<ModelValueItf>();
    const colors = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A"];
    const series = reactive([
      {
        data: [0],
        linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
      },
    ]);
    const roundPieData = ref<RoundPie[]>([]);
    const alarmNum = ref<number>(0);
    const eventNum = ref<number>(0);
    const chainRatio = ref<number>(0);
    let alarmStatusData = reactive([]);
    let alarmAbnormal = reactive([
      {
        title: "异常设备数量",
        value: 0,
      },
      {
        title: "报警次数",
        value: 0,
      },
    ]);
    const timer = ref<any>(null);
    const xData = reactive({
      arr: ["1时", "2时", "3时", "4时", "5时"],
    });
    // 设备报警趋势
    const alarmTrendInfo = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: trend.value.dateRange.join(","),
        type: trend.value.timeType,
      };
      let res: any = await alarmTrend(param);
      let data: any = await equipmentNumber(param);
      alarmStatusData = data.alarmStatusStatistics;
      alarmNum.value = data.alarmNum;
      chainRatio.value = data.chainRatio;
      xData.arr = res.xdata;
      series[0].data = res.ydata;
    };
    /**
     * 设备类型分布
     */
    const equipmentStatistic = async () => {
      const res = await getEquipmentNumber();
      if (JSON.stringify(res) === "{}") {
        return;
      }
      eventNum.value = res.deviceNum;
      roundPieData.value.length = 0;
      res.deviceGenreNums.forEach((item, index) => {
        let obj = {
          label: `${item.genreName}(${Math.round((item.num / res.deviceNum) * 10000) / 100.0}%)`,
          color: colors[index],
          value: item.num,
        };
        roundPieData.value.push(obj);
      });
    };
    const getAbnormalStatistics = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: receptionTrendsTime.value.dateRange.join(","),
        type: receptionTrendsTime.value.timeType,
      };
      const res = await abnormalStatistics(param);
      alarmAbnormal[0].value = res.equipmentDeviceTotal;
      alarmAbnormal[1].value = res.equipmentTotal;
      listData.value = res.equipmentList;
      if (receptionTrendsTime.value.timeType === "THIS_YEAR") {
        listData.value.forEach((x) => {
          x.timeFlag = x.timeFlag + "月";
        });
      }
      if (receptionTrendsTime.value.timeType === "TODAY") {
        res.equipmentList.forEach((x) => {
          x.timeFlag = x.timeFlag + "时";
        });
      }
    };
    const init = () => {
      equipmentStatistic();
    };
    onMounted(() => {
      init();
      timer.value = setInterval(
        () => {
          init();
        },
        (window as any).config.pageLoopRequestTime,
      );
    });
    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="设备报警趋势" class="alarm-event">
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
            <OperateDays value={alarmNum.value} title="报警总数">
              <div class="ringRatio">
                <span> 环比</span>
                <div class={["downtriangle", chainRatio > 0 && "uptriangle"]}></div>
                <div class={[chainRatio > 0 ? "up" : "down"]}> {chainRatio + "%"}</div>
              </div>
            </OperateDays>
            <GridContainer style="margin-top: 12px" data={alarmStatusData}></GridContainer>
            <LineChart x-data={xData.arr} series={series} title={"次"}></LineChart>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备类型分布">
            <div class="equipmentAlarm">
              <RoundPie data={roundPieData.value} eventNum={eventNum.value}>
                <div class="content">
                  <span> {eventNum.value}</span>
                  <br />
                  设备总数
                </div>
              </RoundPie>
              <pieList roundPieData={roundPieData.value}></pieList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备异常统计">
            <template>
              {" "}
              <DateInlineForm
                modelValue={receptionTrendsTime.value}
                onUpdate:modelValue={(v) => {
                  receptionTrendsTime.value = v;
                }}
                onSearch={getAbnormalStatistics}
              ></DateInlineForm>
            </template>
            <div class="alarmInfo">
              {" "}
              <deviceModule data-list={alarmAbnormal}></deviceModule>
            </div>
            <RollTable column={alarmColumn} data={listData.value}>
              <template>
                {record.situation === "ALARM_UN_CONFIRMED" && <span style="color: #f14545"> 待处理</span>}
                {record.situation === "ALARM_PROGRESS_CONFIRMED" ? <span style="color: #ffab10"> 处理中</span> : null}
                <span style="color: #00f27b"> 已处理</span>
              </template>
            </RollTable>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;
