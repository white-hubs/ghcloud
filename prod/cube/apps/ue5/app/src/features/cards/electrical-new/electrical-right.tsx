import moment from "moment";
import { defineComponent } from "vue";
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";

import DeviceStatistics from "../security-monitoring-safty/device-statistics";
import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-table";
import modalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmrecords, recordStatus, statisticsAreaTop } from "@/infrastructure/api/alarm";
import { getDeviceBuyArea, getDeviceNumber } from "@/infrastructure/api/device";
import { AlarmAreaTop } from "@/infrastructure/api/models/alarm";
import bus from "@/infrastructure/utils/bus";
import { setDeviceData } from "@/infrastructure/utils/common";
import { buildVisualMenuTagCode, buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import elevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./electrical-right.module.less";

export const ElectricalRight = defineComponent({
  name: "ElectricalRight",
  setup(_props, ctx) {
    interface AlarmHandlType {
      list: AlarmAreaTop[];
    }

    const alarmModalShow = ref<boolean>(false);
    let timer: any = reactive(null);
    const { globalState } = useStateStore();
    const alarmRecordTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const parameter = reactive({
      areaIds: "",
      alarmStatus: "",
      filterAlarmStatus: "",
      dateRange: [],
    });
    const deviceParameter = reactive({
      areaId: "",
      anyAreaId: "",
      tagCodes: [] as string[],
      dateRange: [],
      filterAreaIds: [],
      deviceState: undefined as boolean | undefined,
    });
    const pieData = ref([]);
    const listData = ref([]);
    const alarmRank = reactive<AlarmHandlType>({ list: [] });
    const deviceModalShow = ref<boolean>(false);
    const column = reactive([
      {
        title: "报警时间",
        dataIndex: "alarmTime",
        width: 120,
      },
      {
        title: "报警级别",
        dataIndex: "alarmLevelName",
      },
      {
        title: "报警事件",
        dataIndex: "alarmEventName",
        width: 140,
      },
      {
        title: "状态",
        dataIndex: "alarmStatus",
        slots: {
          customRender: "alarmStatus",
        },
      },
    ]);

    const deviceStatisticsData = reactive({
      title: "设备数",
      total: 48,
      itemize: [
        {
          name: "离线",
          label: "在线",
          value: 23,
          offline: 15,
          key: "OFFLINE1",
        },
      ],
    });
    const deviceStatisticsRecordData = reactive({
      title: "报警总数",
      total: 48,
      itemize: [
        {
          name: "已处理数",
          label: "未处理数",
          value: 23,
          offline: 15,
          key: "OFFLINE",
        },
      ],
    });
    let handleTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    // 报警处理排名
    function changeHandleTime() {
      getAlarmHandlTop();
    }
    const alarmRegion = (value) => {
      deviceParameter.tagCodes = buildVisualMenuTagCodes(globalState.business.currentMenu);
      deviceParameter.deviceState = undefined;
      deviceParameter.areaId = undefined;
      if (value.name === "其他") {
        deviceParameter.anyAreaId = undefined;
        deviceParameter.filterAreaIds = pieData.value.map((e) => e.areaId).filter((e) => e);
        deviceModalShow.value = true;
      } else {
        deviceParameter.filterAreaIds = [];
        deviceParameter.anyAreaId = value.areaId;
        deviceModalShow.value = true;
      }
    };
    const closeModal = () => {
      alarmModalShow.value = false;
    };
    const handelClickItemize = (value) => {
      if (value === "未处理数") {
        parameter.alarmStatus = undefined;
        parameter.filterAlarmStatus = ["ALARM_HANDLER"].toString();
      } else if (value === "已处理数") {
        parameter.alarmStatus = "ALARM_HANDLER";
      } else {
        parameter.alarmStatus = undefined;
      }
      parameter.dateRange = handleTime.value.dateRange;
      alarmModalShow.value = true;
    };
    const handelOpenDevice = (value) => {
      deviceParameter.tagCodes = buildVisualMenuTagCodes(globalState.business.currentMenu);
      deviceParameter.filterAreaIds = [];
      deviceParameter.anyAreaId = globalState.business.currentAreaId;
      deviceParameter.areaId = undefined;
      if (value === "在线") {
        deviceParameter.deviceState = true;
      } else if (value === "离线") {
        deviceParameter.deviceState = false;
      } else {
        deviceParameter.deviceState = undefined;
      }
      deviceModalShow.value = true;
    };
    async function getAlarmHandlTop() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: handleTime.value.dateRange.join(","),
        type: handleTime.value.timeType,
      };
      alarmRank.list = await statisticsAreaTop(params);
    }

    const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
    const changeEventTimetj = async () => {
      const res = await getDeviceNumber({
        tagCodes: buildVisualMenuTagCode(globalState.business.currentMenu),
        areaId: globalState.business.currentAreaId,
      });
      deviceStatisticsData.total = res.totalNumber;
      deviceStatisticsData.itemize[0].offline = res.offlineNumber;
      deviceStatisticsData.itemize[0].value = res.normalNumber;
      const data = await getDeviceBuyArea({
        tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
        areaLevel: globalState.business.currentAreaLeave,
      });
      pieData.value = setDeviceData(data, colors);
    };
    const getAlarmRecords = async () => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: alarmRecordTime.value.dateRange.join(","),
        type: alarmRecordTime.value.timeType,
        pageSize: 50,
        pageNumber: 1,
      };
      const data = await alarmrecords(params);
      listData.value = data.records.map((item) => {
        return {
          ...item,
          alarmTime: moment(item.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
        };
      });
    };
    const getAlarmStatus = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: alarmRecordTime.value.dateRange.join(","),
        type: alarmRecordTime.value.timeType,
        pageSize: 50,
        pageNumber: 1,
      };
      const res = await recordStatus(params);
      deviceStatisticsRecordData.total = res.alarmNum;
      deviceStatisticsRecordData.itemize[0].offline = res.alarmHandlerNum;
      deviceStatisticsRecordData.itemize[0].value = res.alarmUnresolvedHandlerNum;
    };
    const changeAlarmRecordDate = () => {
      getAlarmRecords();
      getAlarmStatus();
    };
    const handelClickRow = (record) => {
      if (window.config.entry === "views") {
        bus.emit("setOpenAlarmModal", { ...record, hidePanel: true });
      } else {
        bus.emit("openAlarmModal", record);
      }
    };
    function init() {
      changeEventTimetj();
    }
    onMounted(() => {
      init();
      timer = setInterval(
        () => {
          init();
        },
        (window as any).config.pageLoopRequestTime,
      );
    });
    onBeforeUnmount(() => {
      clearInterval(timer);
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="电气设备" class="alarm-event">
            <DeviceStatistics
              imgPath="business-icon/triage-queue/6.png"
              statistic={deviceStatisticsData}
              onHandelClickItemize={handelOpenDevice}
            ></DeviceStatistics>
            <div class="chart flex-start">
              <elevator-analysis-pie style="width: 50%" pieData={pieData.value} radius={"75"}>
                <div style="color: #fff; text-align: center; font-size: calc(var(--font-size-scale) * 0.082rem)">
                  {" "}
                  {deviceStatisticsData.total}
                </div>
                <div style="color: #fff; text-align: center; font-size: calc(var(--font-size-scale) * 0.072rem)"> 设备总数</div>
              </elevator-analysis-pie>
              <elevatorAnalysisList onHandlecurrent={alarmRegion} contentList={pieData.value} style="width: 50%;"></elevatorAnalysisList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警区域TOP5">
            <template>
              {" "}
              <DateInlineForm
                modelValue={handleTime.value}
                onUpdate:modelValue={(v) => {
                  handleTime.value = v;
                }}
                onSearch={changeHandleTime}
              ></DateInlineForm>
            </template>
            <div class="body" style="min-height: 250px;">
              {alarmRank.list.map((item, index) => (
                <EventAlarmItem
                  key={item.id}
                  sort={index + 1}
                  name={item.name}
                  linkRatio={item.chainRatio}
                  count={item.alarmNum}
                  ratio={item.ratio + "%"}
                />
              ))}
            </div>
            <div class="body" style="min-height: 150px;">
              {" "}
              <noData></noData>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="电气报警记录" class="alarm-event">
            <template>
              {" "}
              <DateInlineForm
                modelValue={alarmRecordTime.value}
                onUpdate:modelValue={(v) => {
                  alarmRecordTime.value = v;
                }}
                onSearch={changeAlarmRecordDate}
              ></DateInlineForm>
            </template>
            <DeviceStatistics
              onHandelClickItemize={handelClickItemize}
              imgPath="business-icon/triage-queue/10.png"
              statistic={deviceStatisticsRecordData}
            ></DeviceStatistics>
            <div class="footer">
              <RollTable column={column} data={listData.value} onClickRow={handelClickRow}>
                <template>
                  {record.alarmStatus === "ALARM_UN_CONFIRMED" && <span style="color: #f14545"> 待处理</span>}
                  {record.alarmStatus === "ALARM_PROGRESS_CONFIRMED" ? <span style="color: #ffab10"> 处理中</span> : null}
                  <span style="color: #00f27b"> 已处理</span>
                </template>
              </RollTable>
            </div>
          </SubPanelTemplate>
          <modal-equipmentAll-table
            show-modal={deviceModalShow.value}
            onClose={() => {
              deviceModalShow.value = false;
            }}
            parameter={deviceParameter}
          ></modal-equipmentAll-table>
          <modal-alarm-table show-modal={alarmModalShow.value} onClose={closeModal} parameter={parameter}></modal-alarm-table>
        </div>
      </>
    );
  },
});

export default ElectricalRight;
