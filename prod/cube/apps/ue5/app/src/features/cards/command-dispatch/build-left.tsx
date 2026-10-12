import { defineComponent } from "vue";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { AlarmAreaTop } from "@/infrastructure/api/models/alarm";
import bus from "@/infrastructure/utils/bus";
import RingChart from "@/shared-ui/panel/charts/ring/ring";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import noData from "@/shared-ui/panel/noData";
import useCommon from "@/visualization-core/hooks/useCommon";
import { storeMenu } from "@/visualization-core/stores/menu";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./build-left.module.less";

export const BuildLeft = defineComponent({
  name: "BuildLeft",
  setup(_props, ctx) {
    interface AlarmHandlType {
      list: AlarmAreaTop[];
    }
    let deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    let timer: any = reactive(null);
    const devicestatistic = ref([]);
    let colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
    const pieData = ref([]);
    const column = [
      {
        title: "设备名称",
        dataIndex: "deviceName",
      },
      {
        title: "设备类型",
        dataIndex: "genreName",
      },
      {
        title: "区域",
        dataIndex: "areaName",
      },
      {
        title: "状态",
        dataIndex: "deviceStatus",
        slots: {
          customRender: "deviceStatus",
        },
      },
    ];
    const data = ref([]);
    const alarmRank = reactive<AlarmHandlType>({
      list: [],
    });
    let equipmentData = reactive({
      deviceNum: 0,
      devices: [],
      deviceGenreNums: {},
    });
    const { eventTime, getEventTop, getEquipmentNumber } = useCommon();
    const { globalState } = useStateStore();
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
    async function changeEventTime() {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: eventTime.value.dateRange.join(","),
        type: eventTime.value.timeType,
      };
      alarmRank.list = await getEventTop(param);
    }
    const getEquipmentInfo = async () => {
      pieData.value.length = 0;
      devicestatistic.value.length = 0;
      let res: any = await getEquipmentNumber();
      if (!res.deviceNum) {
        return;
      }
      equipmentData.deviceNum = res.deviceNum;
      equipmentData.devices = res.devices;
      equipmentData.deviceGenreNums = res.deviceGenreNums;
      res.deviceStatusNums.forEach((item) => {
        if (item.name === "NORMAL") {
          devicestatistic.value.push({
            alarmStatusName: "在线设备数",
            alarmNum: item.num,
            color: "#00F27B",
          });
        } else if (item.name === "TROUBLE") {
          devicestatistic.value.push({
            alarmStatusName: "故障设备数",
            alarmNum: item.num,
            color: "#FFC700",
          });
        }
      });
      res.deviceGenreNums.forEach((item, index) => {
        pieData.value.push({
          name: item.genreName,
          value: item.num,
          color: colorList[index],
        });
      });
      data.value = res.devices;
    };
    const handelClickRow = (record) => {
      if (record.alarmTargetCode) {
        bus.emit("equipmentPosition", record);
      }
    };
    const init = () => {
      getEquipmentInfo();
      changeEventTime();
    };
    onMounted(() => {
      getEquipmentInfo();
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
          <SubPanelTemplate title="设备分布统计">
            <div class="body">
              <OperateDays title="设备总数" value={equipmentData.value.deviceNum} class="body-num"></OperateDays>
              <GridContainer data={devicestatistic.value}></GridContainer>
              <div class="chart">
                {" "}
                <RingChart pieData={pieData.value} seriesName="设备类型统计" total={equipmentData.deviceNum}></RingChart>
              </div>
              <div class="roll-table">
                {" "}
                <RollTable column={column} data={data.value} onClickRow={handelClickRow}>
                  {" "}
                  <template>
                    {" "}
                    <span class={record.deviceStatus}> {deviceStatusType[record.deviceStatus]}</span>
                  </template>
                </RollTable>
              </div>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警事件top5">
            <div class="herader">
              {" "}
              <DateInlineForm
                modelValue={eventTime}
                onUpdate:modelValue={(v) => {
                  eventTime.value = v;
                }}
                onSearch={changeEventTime}
              ></DateInlineForm>
            </div>
            <div class="body" style="min-height: 250px">
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
            <div class="body" style="min-height: 200px">
              {" "}
              <noData></noData>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default BuildLeft;
