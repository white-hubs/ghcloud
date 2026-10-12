import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-tableNew";
import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmStatisticsList } from "@/infrastructure/api/alarm";
import { alarmTrend, equipmentNumber } from "@/infrastructure/utils/requestData/alarm";
import pieGuidance from "@/shared-ui/panel/charts/pie/pie-guidance";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const trend = ref<ModelValueItf>();
    const alarmNum = ref<number>(0);
    const deviceModal = ref<boolean>(false);
    const alarmParameter = ref<Record<string, any>>({});
    const deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    const colorList = ["#2F8DFF", "#19F8F7", "#7786a3", "#FFAB10"];
    const { globalState } = useStateStore();
    const xData = reactive({
      arr: ["1时", "2时", "3时", "4时", "5时"],
    });
    const series = reactive([
      {
        data: [0],
        linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
      },
    ]);
    const chainRatio = ref<number>(0);
    let alarmStatusData = reactive([]);
    const alarmListData = ref([]);
    const alarmColumn = [
      {
        title: "设备名称",
        dataIndex: "alarmTargetName",
        width: 120,
      },
      {
        title: "所属区域",
        dataIndex: "areaName",
      },
      {
        title: "报警事件",
        dataIndex: "alarmEventName",
      },
      {
        title: "当前状态",
        dataIndex: "status",
        width: 140,
        slots: {
          customRender: "alarmStatus",
        },
      },
    ];
    const deviceTotal = ref(0);
    const deviceStatistic = ref([]);
    const yData = ref([
      { name: "正常", value: 0, itemStyle: { color: "#2F8DFF" } },
      { name: "离线", value: 0, itemStyle: { color: "#2AE8BD" } },
      { name: "故障", value: 0, itemStyle: { color: "#7786a3" } },
      { name: "告警", value: 0, itemStyle: { color: "#f7c741" } },
    ]);

    const { getEquipmentNumber } = useCommon();
    const getEquipmentInfo = async () => {
      yData.value.length = 0;
      let res: any = await getEquipmentNumber();
      if (!res.deviceNum) {
        return;
      }
      deviceTotal.value = res.deviceNum;
      deviceStatistic.value.length = 0;
      res.deviceStatusNums.forEach((item, index) => {
        yData.value.push({
          name: deviceStatusType[item.name],
          value: item.num,
          itemStyle: { color: colorList[index] },
        });
        deviceStatistic.value.push({
          alarmStatusName: deviceStatusType[item.name],
          color: colorList[index],
          alarmNum: item.num,
        });
      });
    };
    // 获取报警列表
    async function getAlarmTakeNotes() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        pageSize: 50,
        pageNumber: 1,
      };
      let res: any = await alarmStatisticsList(params);
      alarmListData.value = res.records.map((item) => {
        return {
          ...item,
        };
      });
    }
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
    const handleAll = () => {
      deviceModal.value = true;
    };
    const closeModal = () => {
      deviceModal.value = false;
    };
    onMounted(() => {
      getEquipmentInfo();
      getAlarmTakeNotes();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="设备状态总览">
            <OperateDays title="设备总数" value={deviceTotal.value}></OperateDays>
            <GridContainer data={deviceStatistic.value} class="body-bum"></GridContainer>
            <div class="chart">
              {" "}
              <pieGuidance chartPosition={"0"} height={"180px"} y-data={yData.value}></pieGuidance>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备报警明细" style="maxHeight: 200px;" class="product-table">
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
            <RollTable column={alarmColumn} data={alarmListData.value} showLength={4}>
              <template>
                {record.alarmStatus === "ALARM_UN_CONFIRMED" && <span style="color: #f14545"> 待接收</span>}
                {record.alarmStatus === "ALARM_PROGRESS_CONFIRMED" ? <span style="color: #ffab10"> 处理中</span> : null}
                <span style="color: #00f27b"> 已处理</span>
              </template>
            </RollTable>
          </SubPanelTemplate>
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
        </div>
        {deviceModal && (
          <modal-alarm-table show-modal={deviceModal.value} onClose={closeModal} parameter={alarmParameter}></modal-alarm-table>
        )}
      </>
    );
  },
});

export default Left;
