import moment from "moment";
import { defineComponent } from "vue";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import DeviceStatistics from "@/features/cards/security-monitoring-safty/device-statistics";
import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-table";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmrecords, recordStatus } from "@/infrastructure/api/alarm";
import bus from "@/infrastructure/utils/bus";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./alarm-statistics-panel-floor.module.less";

export const AlarmStatisticsPanelFloor = defineComponent({
  name: "AlarmStatisticsPanelFloor",
  props: {
    title: { type: String, required: false, default: "报警记录" },
  },
  setup(props, ctx) {
    let timer: any = reactive(null);
    const alarmModalShow = ref<boolean>(false);
    const parameter = reactive({
      areaIds: "",
      alarmStatus: "",
      filterAlarmStatus: "",
      dateRange: [],
    });
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

    const { globalState } = useStateStore();

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
      parameter.dateRange = timeTypeqs.value.dateRange;
      alarmModalShow.value = true;
    };
    // 报警事件
    const listData = ref([]);
    async function changeEventTime() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: timeTypeqs.value.dateRange.join(","),
        type: timeTypeqs.value.timeType,
        pageSize: 50,
        pageNumber: 1,
      };
      let res: any = await alarmrecords(params);
      let data = await recordStatus(params);
      deviceStatisticsrecord.total = data.alarmNum;
      deviceStatisticsrecord.itemize = [
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
    }
    const openAlarmModal = (item) => {
      if (window.config.entry === "views") {
        bus.emit("setOpenAlarmModal", { ...item, hidePanel: true });
      } else {
        bus.emit("openAlarmModal", item);
      }
    };

    // 切换视频
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
    const deviceStatisticsrecord = reactive({
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
    function init() {
      changeEventTime();
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
          <SubPanelTemplate title="报警记录">
            <template>
              {" "}
              <DateInlineForm
                modelValue={timeTypeqs}
                onUpdate:modelValue={(v) => {
                  timeTypeqs.value = v;
                }}
                onSearch={changeEventTime}
              ></DateInlineForm>
            </template>
            <DeviceStatistics
              onHandelClickItemize={handelClickItemize}
              imgPath="overView21.png"
              statistic={deviceStatisticsrecord}
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
        </div>
      </>
    );
  },
});

export default AlarmStatisticsPanelFloor;
