import moment from "moment";
import { defineComponent } from "vue";
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsStatus, alarmStatisticsList } from "@/infrastructure/api/alarm";
import { healthProblemsLatest } from "@/infrastructure/api/equipment";
import { VideoType } from "@/infrastructure/api/models/vmonitor";
import bus from "@/infrastructure/utils/bus";
import enumeratie from "@/infrastructure/utils/enumeratie";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import equipmentStatusList from "@/shared-ui/panel/equipmentStatusList";
import H5Video from "@/shared-ui/panel/H5Video";
import scanningChart from "@/shared-ui/panel/scanningChart";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./dispatch.module.less";

export const Dispatch = defineComponent({
  name: "Dispatch",
  setup(_props, ctx) {
    const cameraData = ref<VideoType[]>([]);
    const { alarmStatusOptions } = enumeratie();
    const { getAssociatedVideo, piniaStoreArea } = useCommon();
    const { globalState } = useStateStore();

    let timer: any = reactive(null);
    interface info {
      testItemNumber: number;
      createTime: string;
      healthValue: number;
      problemItemNumber: number;
      problems: any;
    }
    const equipmentHealthData = ref<info>({
      testItemNumber: 0,
      createTime: "",
      healthValue: 0,
      problemItemNumber: 0,
      problems: [],
    });
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
    const roundPieData = ref([]);
    const colorList = ["#FFC700", "#74AEE7", "#29C2FF", "#00F27B"];
    const eventNum = ref<number>(0);
    const column = ref([
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
    const data = ref();
    // 获取设备报警状态
    const getEquipmentStatus = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: "2023-01-01 00:00:00,2023-12-31 23:59:59",
        type: "THIS_YEAR",
        pageSize: 50,
        pageNumber: 1,
      };
      let status = await statisticsStatus(params);
      let res: any = await alarmStatisticsList(params);
      roundPieData.value = status.alarmStatusStatistics.map((item, index) => {
        return {
          label: item.alarmStatusName,
          color: colorList[index],
          value: item.alarmNum,
        };
      });
      eventNum.value = status.alarmNum;
      data.value = res.records.map((item) => {
        item.alarmTime = moment(item.alarmTime).format("YYYY-MM-DD");
        return item;
      });
    };
    const clickCamera = (item) => {
      bus.emit("switchCamera", item);
    };
    const statusStyle = computed(() => (key: string) => {
      let option = alarmStatusOptions.value.find((item) => {
        return item.value === key;
      });
      return option;
    });
    async function getVideo() {
      cameraData.value = await getAssociatedVideo(piniaStoreArea.equipmentId);
    }
    const equipmentHealth = async () => {
      equipmentHealthData.value = await healthProblemsLatest(piniaStoreArea.equipmentId as any);
      equipmentHealthData.value.createTime = equipmentHealthData.value.createTime
        ? moment(equipmentHealthData.value.createTime).format("YYYY-MM-DD")
        : "";
    };
    const handelClickRow = (record) => {
      if (record.alarmTargetCode) {
        bus.emit("equipmentPosition", record);
      }
    };
    const init = () => {
      getEquipmentStatus();
      getVideo();
      equipmentHealth();
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
          <SubPanelTemplate title="设备状态">
            <div class="equipmentStatus">
              <div class="left-radar">
                <scanningChart result={equipmentHealthData.healthValue}></scanningChart>
                <div class="checkQuery" onClick={equipmentHealth}>
                  {" "}
                  重新检测
                </div>
              </div>
              <div class="status-list">
                {" "}
                <equipmentStatusList
                  check={equipmentHealthData.testItemNumber}
                  question={equipmentHealthData.problemItemNumber}
                  detectionTime={equipmentHealthData.createTime}
                  statusList={equipmentHealthData.problems}
                ></equipmentStatusList>
              </div>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备报警">
            <div class="equipmentAlarm">
              <RoundPie eventNum={eventNum.value} data={roundPieData.value}>
                <div class="content">
                  <span> {eventNum.value}</span>
                  <br />
                  报警事件
                </div>
              </RoundPie>
              <div class="policeList">
                {roundPieData.map((item) => (
                  <div class="thePolice" key={item.color}>
                    <div>
                      <span style={{ background: item.color }}></span>
                      {item.label}
                    </div>
                    <span> {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </SubPanelTemplate>
          <RollTable column={column.value} data={data.value} style="margin-top: 10px" class="roll-table" onClickRow={handelClickRow}>
            {" "}
            <template>
              {" "}
              <span style={{ color: statusStyle(record.alarmStatus).color }}> {statusStyle(record.alarmStatus).label}</span>
            </template>
          </RollTable>
        </div>
      </>
    );
  },
});

export default Dispatch;
