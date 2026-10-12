import moment from "moment";
import { defineComponent } from "vue";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsStatus, alarmStatisticsList } from "@/infrastructure/api/alarm";
import { getDeviceInfo } from "@/infrastructure/api/equipment";
import { AlarmLevelType } from "@/infrastructure/api/models/alarm";
import { VideoType } from "@/infrastructure/api/models/vmonitor";
import bus from "@/infrastructure/utils/bus";
import Pie3D from "@/shared-ui/panel/charts/pie3D/pie3D";
import equipmentInfo from "@/shared-ui/panel/equipmentInfo";
import H5Video from "@/shared-ui/panel/H5Video";
import pieList from "@/shared-ui/panel/pieList";
import useCommon from "@/visualization-core/hooks/useCommon";
import { storeMenu } from "@/visualization-core/stores/menu";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./security.module.less";

export const Security = defineComponent({
  name: "Security",
  setup(_props, ctx) {
    const roundPieData = ref([]);
    let timer: any = reactive(null);

    const equipmentInfoData: any = ref({
      id: "0",
      name: "",
      modelName: "",
      areaName: "",
      deviceStatus: "",
      communicationStatus: "",
      images: [],
    });
    const { piniaStoreArea, getAssociatedVideo } = useCommon();
    const { globalState } = useStateStore();

    const cameraData = ref<VideoType[]>([]);
    const colorList = ["#FFC700", "#74AEE7", "#29C2FF", "#00F27B"];
    const dataValue = ref();
    const column = reactive([
      {
        title: "报警时间",
        dataIndex: "alarmTime",
        width: 120,
      },
      {
        title: "报警设备",
        dataIndex: "alarmTargetTypeName",
      },
      {
        title: "设备事件",
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
    const data = ref();
    let falg = ref<number>(0);
    watch(
      () => globalState.business.currentAreaId,
      () => {
        clearInterval(timer);
        timer = setInterval(
          () => {
            init();
          },
          (window as any).config.pageLoopRequestTime,
        );
        init();
      },
    );
    // 获取设备报警状态
    const getEquipmentStatus = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        pageSize: 50,
        pageNumber: 1,
      };
      let status = await statisticsStatus(params);
      let res = await alarmStatisticsList(params);
      roundPieData.value = status.alarmStatusStatistics.map((item, index) => {
        return {
          label: item.alarmStatusName,
          color: colorList[index],
          value: item.alarmNum,
        };
      });
      dataValue.value = status.alarmStatusStatistics.map((item, index) => {
        return {
          name: item.alarmStatusName,
          value: item.alarmNum,
        };
      });
      data.value = res.records.map((item) => {
        item.alarmTime = moment(item.alarmTime).format("YYYY-MM-DD");
        return item;
      });
      falg.value++;
    };
    const getEquipmentInfo = async () => {
      let res = await getDeviceInfo(piniaStoreArea.equipmentId as any);
      equipmentInfoData.value = res.detail;
    };
    const clickCamera = (item) => {
      bus.emit("switchCamera", item);
    };
    async function getVideo() {
      cameraData.value = await getAssociatedVideo(piniaStoreArea.equipmentId);
    }
    const handelClickRow = (record) => {
      if (record.alarmTargetCode) {
        bus.emit("equipmentPosition", record);
      }
    };
    const init = () => {
      getEquipmentStatus();
      getEquipmentInfo();
      getVideo();
    };
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
          <SubPanelTemplate title="监控画面">
            <div class="videoBox">
              {cameraData.map((item) => (
                <H5Video class="camera" key={item.token} cameraItem={item} idStr={item.token} onClick={clickCamera(item)}></H5Video>
              ))}
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备信息">
            {" "}
            <equipmentInfo equipment-info={equipmentInfoData}></equipmentInfo>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备报警">
            <div class="body">
              <div class="chart">
                <Pie3D style="width: 140px" dataValue={dataValue.value} internalDiameterRatio={0} autoRotate={true} />
                <pieList roundPieData={roundPieData.value}></pieList>
              </div>
              <div class="footer">
                <RollTable key={falg.value} column={column} data={data.value} onClickRow={handelClickRow}>
                  <template>
                    {record.alarmStatus === "ALARM_UN_CONFIRMED" && <span style="color: #f14545"> 待处理</span>}
                    {record.alarmStatus === "ALARM_PROGRESS_CONFIRMED" ? <span style="color: #ffab10"> 处理中</span> : null}
                    <span style="color: #00f27b"> 已处理</span>
                  </template>
                </RollTable>
              </div>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Security;
