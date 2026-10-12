import moment from "moment";
import { defineComponent } from "vue";
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";

import DeviceStatistics from "../security-monitoring-safty/device-statistics";
import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-table";
import modalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmrecords, recordStatus } from "@/infrastructure/api/alarm";
import { byTagProperties, getDeviceBuyArea, getDeviceNumber } from "@/infrastructure/api/device";
import { cubeDeviceCenterService } from "@/infrastructure/api/service";
import bus from "@/infrastructure/utils/bus";
import { setDeviceData } from "@/infrastructure/utils/common";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import { buildVisualMenuTagCode, buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import elevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { setSpecialCamera } from "@/visualization-core/scene/scene-actions";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./fire-right.module.less";

export const FireRight = defineComponent({
  name: "FireRight",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const cardList = ref([]);
    const twoCardList = ref([]);
    const carousel = ref(0);
    const alarmRecordTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const equipmentStatistics = reactive({
      title: "监测数",
      total: 0,
    });
    const listData = ref([]);
    const pieData = ref([]);
    const alarmModalShow = ref<boolean>(false);
    const deviceModalShow = ref<boolean>(false);
    let timer: any = ref(null);
    const parameter = reactive({
      areaIds: "",
      alarmStatus: "",
      dateRange: [],
    });
    const deviceParameter = reactive({
      anyAreaId: "",
      deviceState: undefined,
      filterAreaIds: [],
      tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
      dateRange: [],
    });
    const deviceStatisticsData = reactive({
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

    const deviceStatusData = reactive({
      title: "设备数",
      total: 48,
      itemize: [
        {
          name: "离线",
          label: "在线",
          value: 23,
          offline: 15,
          key: "OFFLINE",
        },
      ],
    });
    const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
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
      },
      {
        title: "状态",
        dataIndex: "alarmStatus",
        slots: {
          customRender: "alarmStatus",
        },
      },
    ]);
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
      deviceStatisticsData.total = res.alarmNum;
      deviceStatisticsData.itemize[0].offline = res.alarmHandlerNum;
      deviceStatisticsData.itemize[0].value = res.alarmUnresolvedHandlerNum;
    };
    const changeAlarmRecordDate = () => {
      getAlarmRecords();
      getAlarmStatus();
    };
    const changeDate = async () => {
      const res1 = await byTagProperties({ tagCode: "builtin.usage::liquid.level.sensors", iotPropertyCodes: ["hydraulics"] });
      const res2 = await byTagProperties({ tagCode: "builtin.usage::fire.water_pressure.device", iotPropertyCodes: ["pressure"] });
      const res = [...res1, ...res2];
      equipmentStatistics.total = res.length ? res.length : 0;
      cardList.value = [];
      res.forEach((item) => {
        item.iotProperties.forEach((iot) => {
          cardList.value.push({ label: item.deviceName, value: iot.originalValue || 0, unit: "", id: item.id });
        });
      });
      twoCardList.value = [];
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
    const handlecurrentUps = async (value) => {
      const res = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: value.id });
      setSpecialCamera(res.productInfo.productCategory.name, res.baseArchivesInfo.code);
    };
    const alarmClickItemize = (value) => {
      if (value === "未处理数") {
        parameter.alarmStatus = "ALARM_UN_CONFIRMED";
      } else if (value === "已处理数") {
        parameter.alarmStatus = "ALARM_HANDLER";
      } else {
        parameter.alarmStatus = undefined;
      }
      parameter.dateRange = alarmRecordTime.value.dateRange;
      alarmModalShow.value = true;
    };
    const closeModal = () => {
      alarmModalShow.value = false;
    };
    const handelClickRow = (record) => {
      if (window.config.entry === "views") {
        bus.emit("setOpenAlarmModal", { ...record, hidePanel: true });
      } else {
        bus.emit("openAlarmModal", record);
      }
    };
    const getDeviceDistribution = async () => {
      const res = await getDeviceNumber({ tagCodes: buildVisualMenuTagCode(globalState.business.currentMenu) });
      deviceStatusData.total = res.totalNumber;
      deviceStatusData.itemize[0].value = res.normalNumber;
      deviceStatusData.itemize[0].offline = res.offlineNumber;
      const data = await getDeviceBuyArea({
        tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
        areaLevel: globalState.business.currentAreaLeave,
      });
      pieData.value = setDeviceData(data, colors);
    };
    const handelClickItemize = (value) => {
      if (value === "离线") {
        deviceParameter.deviceState = false;
      } else if (value === "在线") {
        deviceParameter.deviceState = true;
      } else {
        deviceParameter.deviceState = undefined;
      }
      deviceParameter.anyAreaId = globalState.business.currentAreaId;
      deviceModalShow.value = true;
    };
    const handleClickPie = async (value) => {
      const { name } = value;
      if (value.name === "其他") {
        deviceParameter.anyAreaId = undefined;
        deviceParameter.filterAreaIds = pieData.value.map((e) => e.areaId);
        deviceModalShow.value = true;
      } else {
        deviceParameter.filterAreaIds = [];
        const findItem = pieData.value.find((res) => res.name === name);
        if (findItem) {
          deviceParameter.anyAreaId = findItem.areaId;
          deviceModalShow.value = true;
        }
      }
    };
    onMounted(() => {
      getDeviceDistribution();
      changeDate();
    });
    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="消防管网监测" zoomable zoom-title="消防管网监测详情">
            <DeviceStatistics imgPath="93-icon.png" statistic={equipmentStatistics} data-no-zoom></DeviceStatistics>
            <div class="monitorCard" data-no-zoom>
              {twoCardList[carousel].map((item) => (
                <div class="cardItem" onClick={handlecurrentUps(item)} key={item.id}>
                  <img src={getAssetsImage("92-icon.png")} alt />
                  <div>
                    <div class="label"> {item.label}</div>
                    <div class="value">
                      <span> {item.value}</span>
                      <span class="unit"> {item.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <template>
              <div class="zoom-monitor-panel">
                <DeviceStatistics imgPath="93-icon.png" statistic={equipmentStatistics} data-no-zoom></DeviceStatistics>
                <div class="zoom-monitorCard" data-no-zoom>
                  {cardList.map((item) => (
                    <div class="zoom-cardItem" onClick={handlecurrentUps(item)} key={item.id}>
                      <img src={getAssetsImage("92-icon.png")} alt />
                      <div>
                        <div class="label"> {item.label}</div>
                        <div class="value">
                          <span> {item.value}</span>
                          <span class="unit"> {item.unit}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </template>
          </SubPanelTemplate>
          <div class="alarm-event">
            <SubPanelTemplate title="消防设备分布情况" zoomable zoom-title="消防设备分布情况详情" zoom-width={600}>
              <DeviceStatistics
                onHandelClickItemize={handelClickItemize}
                imgPath="business-icon/triage-queue/12.png"
                statistic={deviceStatusData}
                data-no-zoom
              ></DeviceStatistics>
              <div class="chart" data-no-zoom>
                <elevator-analysis-pie onClickbar={handleClickPie} style="width: 50%" pieData={pieData} radius={"75"}>
                  <div style="color: #fff; text-align: center; font-size: calc(var(--font-size-scale) * 0.072rem)">
                    {" "}
                    {deviceStatusData.total}
                  </div>
                  <div style="color: #fff; text-align: center; font-size: calc(var(--font-size-scale) * 0.0625rem)"> 设备总数</div>
                </elevator-analysis-pie>
                <elevatorAnalysisList onHandlecurrent={handleClickPie} contentList={pieData} style="width: 50%"></elevatorAnalysisList>
              </div>
              <template>
                <div class="zoom-device-content">
                  <DeviceStatistics
                    onHandelClickItemize={handelClickItemize}
                    imgPath="business-icon/triage-queue/12.png"
                    statistic={deviceStatusData}
                    data-no-zoom
                  ></DeviceStatistics>
                  <div class="zoom-device-chart" data-no-zoom>
                    <div class="zoom-chart">
                      <elevator-analysis-pie onClickbar={handleClickPie} class="zoom-elevator-analysis" radius={"120"} pieData={pieData}>
                        <div style="color: #fff; text-align: center; font-size: 18px"> {deviceStatusData.total}</div>
                        <div style="color: #fff; text-align: center; font-size: 16px"> 设备总数</div>
                      </elevator-analysis-pie>
                    </div>
                    <elevatorAnalysisList
                      class="zoom-analysis-list"
                      contentList={pieData}
                      style="margin-left: 20px; flex: 1"
                      onHandlecurrent={handleClickPie}
                    ></elevatorAnalysisList>
                  </div>
                </div>
              </template>
            </SubPanelTemplate>
          </div>
          <div class="alarm-event">
            <SubPanelTemplate title="报警列表" zoomable zoom-title="报警列表详情">
              <template>
                {" "}
                <DateInlineForm
                  modelValue={alarmRecordTime}
                  onUpdate:modelValue={(v) => {
                    alarmRecordTime.value = v;
                  }}
                  onSearch={changeAlarmRecordDate}
                  data-no-zoom
                ></DateInlineForm>
              </template>
              <div data-no-zoom>
                <DeviceStatistics
                  onHandelClickItemize={alarmClickItemize}
                  imgPath="business-icon/triage-queue/10.png"
                  statistic={deviceStatisticsData}
                ></DeviceStatistics>
                <div class="footer">
                  <RollTable column={column} data={listData} onClickRow={handelClickRow}>
                    <template>
                      {record.alarmStatus === "ALARM_UN_CONFIRMED" && <span style="color: #f14545"> 待处理</span>}
                      {record.alarmStatus === "ALARM_PROGRESS_CONFIRMED" ? <span style="color: #ffab10"> 处理中</span> : null}
                      <span style="color: #00f27b"> 已处理</span>
                    </template>
                  </RollTable>
                </div>
              </div>
              <div data-no-zoom>
                {" "}
                <noData></noData>
              </div>
              <template>
                <div class="zoom-alarm-list">
                  <div data-no-zoom>
                    <DeviceStatistics
                      onHandelClickItemize={alarmClickItemize}
                      imgPath="business-icon/triage-queue/10.png"
                      statistic={deviceStatisticsData}
                    ></DeviceStatistics>
                    <div class="zoom-footer">
                      <RollTable column={column} data={listData} onClickRow={handelClickRow} class="zoom-roll-table">
                        <template>
                          {record.alarmStatus === "ALARM_UN_CONFIRMED" && <span style="color: #f14545"> 待处理</span>}
                          {record.alarmStatus === "ALARM_PROGRESS_CONFIRMED" ? <span style="color: #ffab10"> 处理中</span> : null}
                          <span style="color: #00f27b"> 已处理</span>
                        </template>
                      </RollTable>
                    </div>
                  </div>
                  <div data-no-zoom>
                    {" "}
                    <noData></noData>
                  </div>
                </div>
              </template>
            </SubPanelTemplate>
          </div>
          <modal-alarm-table show-modal={alarmModalShow} onClose={closeModal} parameter={parameter}></modal-alarm-table>
          <modal-equipmentAll-table
            show-modal={deviceModalShow}
            onClose={() => {
              deviceModalShow.value = false;
            }}
            parameter={deviceParameter}
          ></modal-equipmentAll-table>
        </div>
      </>
    );
  },
});

export default FireRight;
