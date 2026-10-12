import { defineComponent } from "vue";
import { ref, reactive, toRefs, onMounted, onUnmounted } from "vue";

import monitoringContent from "./components/monitoring-content";
import modalTable from "@/features/equipment/modal-table/modal";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsDeviceTop, statisticsLevel } from "@/infrastructure/api/alarm";
import { equipmentTotal } from "@/infrastructure/api/equipment";
import { AlarmAreaTop, AlarmLevelType } from "@/infrastructure/api/models/alarm";
import AlarmStatisticsItem from "@/shared-ui/panel/alarmStatisticsItem";
import Pie3D from "@/shared-ui/panel/charts/pie/pie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { storeArea } from "@/visualization-core/stores/area";
import { storeMenu } from "@/visualization-core/stores/menu";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const handleTime = ref<ModelValueItf>();
    let topTimeFrame = ref<ModelValueItf>();
    let showModal = ref(false);
    const { globalState } = useStateStore();
    const areaAlarmRank = ref<AlarmAreaTop[]>([]);
    const infoData = reactive({
      deviceNum: 0,
      devices: [],
    });
    const fakeData = ref<AlarmLevelType[]>([
      {
        alarmNum: 0,
        name: "一级报警",
        chainRatio: 0,
        isGrow: false,
      },
    ]);
    const column = reactive([
      {
        title: "设备名称",
        dataIndex: "deviceName",
      },
      {
        title: "所属区域",
        dataIndex: "areaName",
      },
      {
        title: "设备状态",
        dataIndex: "deviceStatus",
      },
    ]);

    // 设备实时数据
    const deviceDataInfo = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
      };
      let res: any = await equipmentTotal(params);
      Object.assign(infoData, res);
      if (!res.deviceNum) {
        return;
      }
    };
    // 报警级别分布
    function changeTopTimeFrame() {
      getAlarmLevel();
    }
    // 获取报警级别分布数据
    async function getAlarmLevel() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: topTimeFrame.value?.dateRange.join(","),
        type: topTimeFrame.value?.timeType,
      };
      let res = await statisticsLevel(params);
      fakeData.value = res.map((item) => {
        item.chainRatio <= 0 ? (item.isGrow = false) : (item.isGrow = true);
        item.name += "报警";
        return item;
      });
    }
    /**
     * 区域报警Top5
     */
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
    // 发布信息总览
    const informationOverview = async () => {};
    const clickRow = () => {
      showModal.value = true;
    };
    onMounted(() => {
      informationOverview();
      deviceDataInfo();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="发布信息总览">
            <OperateDays title="全部信息数" value={infoData.value.deviceNum} class="body-num"></OperateDays>
            <div class="body">
              {" "}
              <RollTable onClickRow={clickRow} column={column} data={infoData.devices}></RollTable>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警级别统计" class="alarm-level">
            <template>
              {" "}
              <DateInlineForm
                modelValue={topTimeFrame.value}
                onUpdate:modelValue={(v) => {
                  topTimeFrame.value = v;
                }}
                onSearch={changeTopTimeFrame}
              ></DateInlineForm>
            </template>
            <div class="body">
              <div class="chart">
                {" "}
                <Pie3D data={fakeData.value} label-key="name" value-key="alarmNum" />
              </div>
              <div class="footer">
                {fakeData.map((item, index) => (
                  <AlarmStatisticsItem
                    key={item.name}
                    level={index + 1}
                    alarmNum={item.alarmNum}
                    chainRatio={item.chainRatio}
                    name={item.name}
                    is-grow={item.isGrow}
                  />
                ))}
              </div>
            </div>
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
            <div class="body" style="min-height: 250px">
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
          </SubPanelTemplate>
        </div>
        <modal-table
          show={showModal.value}
          title="发布内容监控"
          onClose={() => {
            showModal.value = false;
          }}
        >
          {" "}
          <monitoringContent></monitoringContent>
        </modal-table>
      </>
    );
  },
});

export default Right;
