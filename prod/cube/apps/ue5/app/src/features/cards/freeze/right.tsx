import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-tableNew";
import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmStatisticsList, statisticsDeviceTop } from "@/infrastructure/api/alarm";
import { AlarmAreaTop } from "@/infrastructure/api/models/alarm";
import pieGuidance from "@/shared-ui/panel/charts/pie/pie-guidance";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const deviceTotal = ref(0);
    const deviceStatistic = ref([]);
    const deviceModal = ref<boolean>(false);
    const areaAlarmRank = ref<AlarmAreaTop[]>([]);
    const handleTime = ref<ModelValueItf>();
    const deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    const colorList = ["#2F8DFF", "#19F8F7", "#7786a3", "#FFAB10"];
    const alarmParameter = ref<Record<string, any>>({});
    const yData = ref([
      { name: "正常", value: 0, itemStyle: { color: "#2F8DFF" } },
      { name: "离线", value: 0, itemStyle: { color: "#2AE8BD" } },
      { name: "故障", value: 0, itemStyle: { color: "#7786a3" } },
      { name: "告警", value: 0, itemStyle: { color: "#f7c741" } },
    ]);
    const { globalState } = useStateStore();

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
    const areaAlarmStatistic = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: handleTime.value.dateRange.join(","),
        type: handleTime.value.timeType,
      };
      const res = await statisticsDeviceTop(params);
      areaAlarmRank.value = res;
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
          <SubPanelTemplate title="设备报警明细" style="maxHeight: 250px;" class="product-table">
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
          <SubPanelTemplate title="设备报警Top5" class="alarm-event">
            <template>
              {" "}
              <DateInlineForm
                modelValue={handleTime.value}
                onUpdate:modelValue={(v) => {
                  handleTime.value = v;
                }}
                onSearch={areaAlarmStatistic}
              ></DateInlineForm>
            </template>
            <div class="body" style="min-height: 200px">
              {areaAlarmRank.map((item, index) => (
                <EventAlarmItem
                  sort={index + 1}
                  name={item.name}
                  linkRatio={item.chainRatio}
                  count={item.alarmNum}
                  ratio={item.ratio + "%"}
                />
              ))}
            </div>
            <div class="body" style="min-height: 200px">
              {" "}
              <noData></noData>
            </div>
          </SubPanelTemplate>
        </div>
        <modal-alarm-table show-modal={deviceModal.value} onClose={closeModal} parameter={alarmParameter}></modal-alarm-table>
      </>
    );
  },
});

export default Right;
