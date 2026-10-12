import moment from "moment";
import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-tableNew";
import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmStatisticsList } from "@/infrastructure/api/alarm";
import { passengerFlowRegions } from "@/infrastructure/api/passenger-flow";
import barChart from "@/shared-ui/panel/charts/bar/barChart";
import pieGuidance from "@/shared-ui/panel/charts/pie/pie-guidance";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const { getEquipmentNumber } = useCommon();
    //设备状态=============================================================================================
    const deviceModal = ref<boolean>(false);
    let colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
    const yData = ref([]);
    let deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    const handleAll = () => {
      deviceModal.value = true;
    };
    const closeModal = () => {
      deviceModal.value = false;
    };
    const alarmParameter = ref<Record<string, any>>({});
    const deviceStatistic = ref([]);
    //设备告警===============================================================================================
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
    const alarmListData = ref([]);
    //获取设备状态
    const getEquipmentInfo = async () => {
      yData.value.length = 0;
      let res: any = await getEquipmentNumber();
      if (!res.deviceNum) {
        return;
      }
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
    //各个区域客流量==================================================================================
    const areaChart = reactive({
      xData: [],
      yData: [],
    });
    const getPassengerFlowRegions = async () => {
      const date = [moment().format("YYYY-MM-DD 00:00:00"), moment().format("YYYY-MM-DD HH:mm:ss")].join(",");
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: date,
      };
      const res = await passengerFlowRegions(params);
      areaChart.xData = [];
      res.forEach((item) => {
        areaChart.xData.push(item.areaName);
        areaChart.yData.push(item.num);
      });
    };

    onMounted(() => {
      getEquipmentInfo();
      getAlarmTakeNotes();
      getPassengerFlowRegions();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="设备状态">
            <div>
              <GridContainer data={deviceStatistic.value} class="body-bum"></GridContainer>
              <div class="pie-chart">
                {" "}
                <pieGuidance y-data={yData.value} height="80%"></pieGuidance>
              </div>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备告警" style="maxHeight: 200px;" class="product-table">
            <template>
              {" "}
              <div class="dataTitle">
                {" "}
                <div class="dataTitle-right" style="color: #5EA6FF;" onClick={handleAll}>
                  {" "}
                  查看详情{">>"}
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
          <SubPanelTemplate title="各个区域客流量">
            {" "}
            <div class="chart">
              {" "}
              <barChart
                title={"人次"}
                unit={"人"}
                x-data={areaChart.xData}
                data={[{ color: "#1890FF", name: "", data: areaChart.yData }]}
                class="columnBox"
              />
            </div>
          </SubPanelTemplate>
        </div>
        <modal-alarm-table show-modal={deviceModal.value} onClose={closeModal} parameter={alarmParameter}></modal-alarm-table>
      </>
    );
  },
});

export default Right;
