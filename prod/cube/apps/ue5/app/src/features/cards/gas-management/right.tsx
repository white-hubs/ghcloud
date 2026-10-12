import moment from "moment";
import { defineComponent } from "vue";
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import DeviceStatistics from "../security-monitoring-safty/device-statistics";
import securityDeviceCount from "@/features/cards/security-overview/cards/public-security-device-count";
import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-table";
import modalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsAreaTop } from "@/infrastructure/api/alarm";
import { alarmrecords, recordStatus } from "@/infrastructure/api/alarm";
import { getDeviceBuyArea, getDeviceNumber, byTagProperties } from "@/infrastructure/api/device";
import { AlarmAreaTop } from "@/infrastructure/api/models/alarm";
import { cubeDeviceCenterService } from "@/infrastructure/api/service";
import bus from "@/infrastructure/utils/bus";
import { setDeviceData } from "@/infrastructure/utils/common";
import { buildVisualMenuTagCode, buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const ueClient = UeClient.getInstance();

    let timer: any = ref(null);
    interface AlarmHandlType {
      list: AlarmAreaTop[];
    }
    const { globalState } = useStateStore();
    const twoCardList = ref([]);
    const carousel = ref(0);
    const parameter = reactive({
      areaIds: "",
      filterAlarmStatus: "",
      alarmStatus: "",
      dateRange: [],
    });
    let timeTypes = ref({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const deviceParameter = reactive({
      areaId: "",
      tagCodes: [],
      deviceState: undefined,
      dateRange: [],
    });
    const deviceAllParameter = reactive({
      areaId: "",
      tagCodes: [],
      filterAreaIds: [],
      deviceState: undefined,
      dateRange: [],
    });
    //燃气浓度监测=================================================================================================
    const alarmModalShow = ref<boolean>(false);
    const cardList = ref([]);
    const deviceModalShow = ref<boolean>(false);
    const deviceAllModalShow = ref<boolean>(false);
    const listData = ref([]);
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
    const deviceStatisticsRecord = reactive({
      title: "报警数",
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
    const alarmEventTop = async () => {
      const res = await byTagProperties({ tagCode: "builtin.usage::combustible_gas_monitoring.device", iotPropertyCodes: ["ppm"] });
      cardList.value = [];
      res.forEach((item) => {
        item.iotProperties.forEach((iot) => {
          cardList.value.push({ label: item.deviceName, value: iot.originalValue, unit: "v%", id: item.id });
        });
      });
      twoCardList.value = [];
      //  数据切割为4个的二维数组
      const chunkSize = 4;
      for (let i = 0; i < cardList.value.length; i += chunkSize) {
        const chunk = cardList.value.slice(i, i + chunkSize);
        while (chunk.length < chunkSize) {
          const remaining = chunkSize - chunk.length;
          const additionalElements = cardList.value.slice(0, remaining);
          chunk.push(...additionalElements);
        }
        twoCardList.value.push(chunk);
      }
      timer.value = setInterval(() => {
        if (carousel.value == twoCardList.value.length - 1) {
          carousel.value = 0;
        } else {
          carousel.value++;
        }
      }, 1000 * 60);
    };
    //报警区域TOP5=================================================================================================
    let handleTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const alarmRank = reactive<AlarmHandlType>({
      list: [],
    });
    const clickRow = async (value) => {
      const res = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: value.id });
      ueClient.send("focusActor", { id: res.baseArchivesInfo.code });
      ueClient.send("showShell", { id: res.baseArchivesInfo.code });
    };
    // 报警处理排名
    function changeHandleTime() {
      getAlarmHandlTop();
    }
    const closeModal = () => {
      alarmModalShow.value = false;
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
    const changeEventTime = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: timeTypes.value.dateRange.join(","),
        type: timeTypes.value.timeType,
        pageSize: 50,
        pageNumber: 1,
      };
      let res: any = await alarmrecords(params);
      let data = await recordStatus(params);
      deviceStatisticsRecord.total = data.alarmNum;
      deviceStatisticsRecord.itemize = [
        {
          name: "未处理数",
          label: "已处理数",
          value: data.alarmHandlerNum,
          offline: data.alarmUnresolvedHandlerNum,
          key: "OFFLINE",
        },
      ];

      listData.value = res.records.map((item) => {
        return {
          ...item,
          alarmTime: moment(item.alarmTime).format("YYYY-MM-DD"),
        };
      });
    };
    const handelClickItemize = (value) => {
      parameter.areaIds = "";
      if (value === "未处理数") {
        parameter.alarmStatus = undefined;
        parameter.filterAlarmStatus = ["ALARM_HANDLER"].toString();
      } else if (value === "已处理数") {
        parameter.alarmStatus = "ALARM_HANDLER";
      } else {
        parameter.alarmStatus = undefined;
      }
      parameter.dateRange = timeTypes.value.dateRange;
      alarmModalShow.value = true;
    };
    const openAlarmModal = (item) => {
      if (window.config.entry === "views") {
        bus.emit("setOpenAlarmModal", { ...item, hidePanel: true });
      } else {
        bus.emit("openAlarmModal", item);
      }
    };
    onMounted(() => {
      getAlarmHandlTop();
      deviceByArea();
      getDeviceNum();
      alarmEventTop();
    });
    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });
    //用气设备=================================================================================================
    const alarmTotal = ref(0);
    const equipmentStatisticsData = reactive({
      title: "设备总数",
      total: 48,
      itemize: [
        {
          name: "离线设备数",
          label: "在线设备数",
          value: 23,
          offline: 15,
          key: "OFFLINE1",
        },
      ],
    });
    const detectionData = ref([]);
    const colorList = ["#2AE8BD", "#FFC700", "#3590FF", "#19F8F7", "#EF424A", "#c4ceda", "#8c8f96"];
    const handleClickItem = (item: AlarmAreaTop) => {
      parameter.areaIds = item.id;
      parameter.filterAlarmStatus = "";
      parameter.dateRange = [];
      parameter.alarmStatus = "";
      alarmModalShow.value = true;
    };
    const deviceByArea = async () => {
      let data = await getDeviceBuyArea({
        tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
        areaLevel: globalState.business.currentAreaLeave + 1,
      });
      detectionData.value = setDeviceData(data, colorList);
    };
    const getDeviceNum = async () => {
      const data = await getDeviceNumber({ tagCodes: buildVisualMenuTagCode(globalState.business.currentMenu) });
      alarmTotal.value = data.totalNumber;
      equipmentStatisticsData.total = data.totalNumber;
      equipmentStatisticsData.itemize[0].value = data.normalNumber;
      equipmentStatisticsData.itemize[0].offline = data.offlineNumber;
    };
    const handleClickPie = async (value) => {
      const { name } = value;
      if (name === "其他") {
        deviceParameter.areaId = undefined;
        deviceAllParameter.filterAreaIds = detectionData.value.map((e) => e.areaId);
        deviceModalShow.value = true;
      } else {
        deviceAllParameter.filterAreaIds = [];
        const findItem = detectionData.value.find((res) => res.name === name);
        if (findItem) {
          deviceParameter.areaId = findItem.id;
          deviceModalShow.value = true;
        }
      }
    };
    const deviceClickItemize = (value) => {
      if (value === "在线设备数") {
        deviceAllParameter.deviceState = true;
      } else if (value === "离线设备数") {
        deviceAllParameter.deviceState = false;
      } else {
        deviceAllParameter.deviceState = undefined;
      }
      deviceAllParameter.tagCodes = buildVisualMenuTagCodes(globalState.business.currentMenu);
      deviceAllParameter.areaId = globalState.business.currentAreaId;
      deviceAllModalShow.value = true;
    };

    return (): JSX.Element => (
      <>
        <div>
          <securityDeviceCount></securityDeviceCount>
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
                  onClick={handleClickItem(item)}
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
          <SubPanelTemplate title="报警记录">
            <template>
              {" "}
              <DateInlineForm
                modelValue={timeTypes.value}
                onUpdate:modelValue={(v) => {
                  timeTypes.value = v;
                }}
                onSearch={changeEventTime}
              ></DateInlineForm>
            </template>
            <DeviceStatistics
              onHandelClickItemize={handelClickItemize}
              imgPath="overView21.png"
              statistic={deviceStatisticsRecord}
            ></DeviceStatistics>
            <RollTable onClickRow={openAlarmModal} column={column} data={listData.value} limitScrollNum={4}>
              <template>
                {record.alarmStatus === "ALARM_UN_CONFIRMED" && <span style="color: #f14545"> 待处理</span>}
                {record.alarmStatus === "ALARM_PROGRESS_CONFIRMED" ? <span style="color: #ffab10"> 处理中</span> : null}
                <span style="color: #00f27b"> 已处理</span>
              </template>
            </RollTable>
          </SubPanelTemplate>
          <modal-alarm-table show-modal={alarmModalShow.value} onClose={closeModal} parameter={parameter}></modal-alarm-table>
          <modal-equipmentAll-table
            show-modal={deviceAllModalShow.value}
            onClose={() => {
              deviceAllModalShow.value = false;
            }}
            parameter={deviceAllParameter}
          ></modal-equipmentAll-table>
        </div>
      </>
    );
  },
});

export default Right;
