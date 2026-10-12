import moment from "moment";
import { defineComponent } from "vue";
import { ref, reactive, onMounted, computed } from "vue";

import FailedEquipmentModal from "@/features/cards/surgical-demonstration/components/failed-equipment-modal";
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
import { storeMenu } from "@/visualization-core/stores/menu";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const deviceModal = ref<boolean>(false);
    const alarmCon = ref(0);
    const levelStatistic = ref([]);
    const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
    const pieData = ref([]);
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
    const xData = ref<string[]>([]);
    const yData = ref<number[]>([]);
    const deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    const colorList = ["#2F8DFF", "#D0DEEE", "#FFAB10", "#F14545"];
    const topTimeFrame = ref<ModelValueItf>();
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
    // 异常设备清单
    const abnormalEquipment = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
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
          <SubPanelTemplate title="异常设备清单">
            <template>
              {" "}
              <div
                class="details"
                onClick={() => {
                  deviceModal.value = true;
                }}
              >
                {" "}
                全部
              </div>
            </template>
            <RollTable column={alarmColumn} data={listData.value} limitScrollNum={4}></RollTable>
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
          <SubPanelTemplate title="医用气体设备分类">
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
        </div>
        {deviceModal && (
          <FailedEquipmentModal
            title="异常设备清单"
            modelValue={deviceModal.value}
            onUpdate:modelValue={(v) => {
              deviceModal.value = v;
            }}
            onClose={() => {
              deviceModal.value = false;
            }}
            footer={null}
          />
        )}
      </>
    );
  },
});

export default Left;
