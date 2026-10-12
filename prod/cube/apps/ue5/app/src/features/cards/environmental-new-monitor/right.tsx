import { defineComponent } from "vue";
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import DeviceStatistics from "../security-monitoring-safty/device-statistics";
import WorkSituation from "./components/work-situation";
import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-table";
import modalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsAreaTop } from "@/infrastructure/api/alarm";
import { byTagProperties, getDeviceBuyArea, getDeviceNumber } from "@/infrastructure/api/device";
import { AlarmAreaTop } from "@/infrastructure/api/models/alarm";
import { cubeDeviceCenterService } from "@/infrastructure/api/service";
import { setDeviceData } from "@/infrastructure/utils/common";
import { buildVisualMenuTagCode, buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import elevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { setSpecialCamera } from "@/visualization-core/scene/scene-actions";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    interface AlarmHandlType {
      list: AlarmAreaTop[];
    }
    const alarmTotal = ref(0);
    const upsData = ref([]);
    const parameter = reactive({
      areaIds: "",
      dateRange: [],
    });
    const deviceParameter = reactive({
      areaId: "",
      status: "",
      filterAreaIds: [],
      tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
      dateRange: [],
    });
    const deviceStatisticsData = reactive({
      title: "设备总数",
      total: 48,
      itemize: [
        {
          name: "在线设备数",
          label: "离线设备数",
          value: 23,
          offline: 15,
          key: "OFFLINE1",
        },
      ],
    });
    let timer: any = ref(null);
    const alarmModalShow = ref<boolean>(false);
    const deviceModalShow = ref<boolean>(false);
    const detectionData = ref([]);
    const closeModal = () => {
      alarmModalShow.value = false;
    };
    let handleTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    let colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];

    const twoUpsData = ref([]);
    const carousel = ref(0);
    const getUpsData = async () => {
      const res = await byTagProperties({ tagCode: "builtin.usage::ups", iotPropertyCodes: ["bat_time"] });
      upsData.value = [];
      res.forEach((item) => {
        item.iotProperties.forEach((iot) => {
          upsData.value.push({
            name: item.deviceName,
            value: iot.name + ":" + (iot.originalValue ? (iot.originalValue / 3600).toFixed(2) : 0) + "时",
            id: item.id,
          });
        });
      });
      twoUpsData.value = [];
      //  数据切割为4个的二维数组
      const chunkSize = 4;
      for (let i = 0; i < upsData.value.length; i += chunkSize) {
        const chunk = upsData.value.slice(i, i + chunkSize);
        while (chunk.length < chunkSize) {
          const remaining = chunkSize - chunk.length;
          const additionalElements = upsData.value.slice(0, remaining);
          chunk.push(...additionalElements);
        }
        twoUpsData.value.push(chunk);
      }
      timer.value = setInterval(() => {
        if (carousel.value == twoUpsData.value.length - 1) {
          carousel.value = 0;
        } else {
          carousel.value++;
        }
      }, 1000 * 60);
    };
    const alarmRank = reactive<AlarmHandlType>({
      list: [],
    });

    watch(
      () => globalState.business.currentAreaId,
      () => {
        init();
      },
    );

    // 报警处理排名
    const changeHandleTime = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: handleTime.value.dateRange.join(","),
        type: handleTime.value.timeType,
        areaLevel: globalState.business.currentAreaLeave,
      };
      alarmRank.list = await statisticsAreaTop(params);
    };
    const alarmOpen = (value) => {
      parameter.areaIds = value.id;
      parameter.dateRange = handleTime.value.dateRange;
      alarmModalShow.value = true;
    };
    const deviceOpen = (value) => {
      if (value === "离线设备数") {
        deviceParameter.status = "OFFLINE";
      } else if (value === "在线设备数") {
        deviceParameter.status = "ONLINE";
      } else {
        deviceParameter.status = "";
      }
      deviceParameter.areaId = globalState.business.currentAreaId;
      deviceModalShow.value = true;
    };
    const alarmEventTop = async () => {
      const data = await getDeviceNumber({
        tagCodes: buildVisualMenuTagCode(globalState.business.currentMenu),
        areaId: globalState.business.currentAreaId,
      });
      deviceStatisticsData.total = data.totalNumber;
      deviceStatisticsData.itemize[0].value = data.offlineNumber;
      deviceStatisticsData.itemize[0].offline = data.normalNumber;
      const res = await getDeviceBuyArea({
        tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
        areaLevel: globalState.business.currentAreaLeave + 1,
      });
      alarmTotal.value = 0;
      detectionData.value = setDeviceData(res, colorList);
      detectionData.value.forEach((item) => {
        alarmTotal.value += item.value;
      });
    };
    const alarmRegion = (value) => {
      deviceParameter.status = "";
      if (value.name === "其他") {
        deviceParameter.areaId = undefined;
        deviceParameter.filterAreaIds = detectionData.value.map((e) => e.areaId);
      } else {
        deviceParameter.areaId = detectionData.value.find((e) => e.name === value.name).areaId;
        deviceParameter.filterAreaIds = [];
      }
      deviceModalShow.value = true;
    };
    const handlecurrentUps = async (value) => {
      const res = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: value.id });
      setSpecialCamera(res.productInfo.productCategory.name, res.baseArchivesInfo.code);
    };
    function init() {
      getUpsData();
      alarmEventTop();
    }
    onMounted(() => {
      init();
    });
    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="报警区域TOP5">
            <template>
              {" "}
              <DateInlineForm
                modelValue={handleTime}
                onUpdate:modelValue={(v) => {
                  handleTime.value = v;
                }}
                onSearch={changeHandleTime}
              ></DateInlineForm>
            </template>
            <div class="body" style="min-height: 250px;cursor: pointer;">
              {alarmRank.list.map((item, index) => (
                <EventAlarmItem
                  onClick={alarmOpen(item)}
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
          <SubPanelTemplate title="UPS工作情况" class="alarm-event">
            <work-situation onHandlecurrent={handlecurrentUps} contentList={twoUpsData[carousel]}></work-situation>
            <noData></noData>
          </SubPanelTemplate>
          <SubPanelTemplate title="动环设备" class="alarm-event">
            <DeviceStatistics
              onHandelClickItemize={deviceOpen}
              imgPath="overView16.png"
              statistic={deviceStatisticsData}
            ></DeviceStatistics>
            <div class="elevator-analysis">
              <div class="chart">
                <elevator-analysis-pie onClickbar={alarmRegion} pieData={detectionData}>
                  <div style="color: #fff;text-align: center;font-size: calc(var(--font-size-scale) * 0.082rem)"> {alarmTotal}</div>
                  <div style="color: #fff;text-align: center;font-size: calc(var(--font-size-scale) * 0.087rem)"> 设备总数</div>
                </elevator-analysis-pie>
              </div>
              <elevatorAnalysisList
                onHandlecurrent={alarmRegion}
                showRatio={false}
                contentList={detectionData}
                class="pie_list"
              ></elevatorAnalysisList>
            </div>
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
      </>
    );
  },
});

export default Right;
