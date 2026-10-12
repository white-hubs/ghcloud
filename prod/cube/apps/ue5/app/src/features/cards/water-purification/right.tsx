import moment from "moment";
import { defineComponent } from "vue";
import { ref, reactive, onMounted, computed } from "vue";

import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmStatisticsList, statisticsTrend } from "@/infrastructure/api/alarm";
import { equipmentTotal } from "@/infrastructure/api/equipment";
import RingChart from "@/shared-ui/panel/charts/ring/ring";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
    const { globalState } = useStateStore();
    const topTimeFrame = ref<ModelValueItf>();
    const xData = ref<string[]>([]);
    const yData = ref<number[]>([]);
    const alarmCon = ref(0);
    const alarmColumn = [
      {
        title: "设备名称",
        dataIndex: "alarmTargetName",
        width: 120,
      },
      {
        title: "异常情况",
        dataIndex: "alarmTargetTypeName",
      },
      {
        title: "上报时间",
        dataIndex: "alarmTime",
        width: 140,
      },
    ];
    const listData = ref([]);
    const levelStatistic = ref([]);
    const statisticStyle = computed(() => {
      return {
        fontSize: "16px",
        color: "#FFFFFF",
        paddingLeft: "16px",
      };
    });
    const statisticValueStyle = computed(() => (index) => {
      return {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: colors[index % colors.length],
      };
    });
    const deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    const colorList = ["#FFAB10", "#2F8DFF", "#F14545", "#19F8F7"];
    const pieData = ref([]);
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
      levelStatistic.value.length = 0;
      pieData.value.length = 0;
      res.deviceStatusNums.forEach((item, index) => {
        alarmCon.value += item.num;
        levelStatistic.value.push({
          alarmStatusName: deviceStatusType[item.name],
          color: colorList[index],
          alarmNum: item.num,
        });
      });
      res.deviceGenreNums.forEach((item, index) => {
        pieData.value.push({
          name: item.genreName,
          color: colorList[index],
          value: item.num,
        });
      });
    };
    // 报警状态统计&报警趋势折线图统计
    const getAlarmsNumber = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: topTimeFrame.value.dateRange.join(","),
        type: topTimeFrame.value.timeType,
      };
      let Trend = await statisticsTrend(params);
      xData.value.length = 0;
      yData.value.length = 0;
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
    };
    // 异常设备清单
    const abnormalEquipment = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        // period:[moment().startOf("month").format('YYYY-MM-DD 00:00:00'), moment().format("YYYY-MM-DD HH:mm:ss")].join(','),
        pageSize: 10,
        pageNumber: 1,
      };
      let { records } = await alarmStatisticsList(params);
      listData.value = records.map((item) => {
        return {
          ...item,
          alarmTime: moment(item.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
        };
      });
    };
    onMounted(() => {
      deviceDataInfo();
      abnormalEquipment();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="设备状态总览">
            <OperateDays title="设备数" value={alarmCon.value} style="margin-bottom: 10px;" />
            <GridContainer data={levelStatistic.value}></GridContainer>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备分类">
            <div class="chart">
              {" "}
              <RingChart pieData={pieData.value} seriesName="设备类型统计" total={alarmCon.value}></RingChart>
            </div>
            <div class="statistic">
              {pieData.map((item, index) => (
                <div class="statistic-item">
                  <a-statistic value={item.value} valueStyle={statisticStyle.value}>
                    <template>
                      <div class="title flex-start">
                        <div class="box" style={statisticValueStyle(index)}></div>
                        <span> {item.name}</span>
                      </div>
                    </template>
                    <template>
                      {" "}
                      <span> {item.ratio}</span>
                    </template>
                  </a-statistic>
                </div>
              ))}
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备告警趋势">
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
          </SubPanelTemplate>
          <SubPanelTemplate title="异常设备清单">
            <template>
              {" "}
              <div class="details"> 全部</div>
            </template>
            <RollTable column={alarmColumn} data={listData.value} limitScrollNum={4}></RollTable>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Right;
