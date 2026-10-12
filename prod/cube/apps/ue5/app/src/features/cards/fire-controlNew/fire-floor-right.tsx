import moment from "moment";
import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmStatisticsList, statisticsDeviceTop, statisticsStatus } from "@/infrastructure/api/alarm";
import { AlarmAreaTop, AlarmStatus } from "@/infrastructure/api/models/alarm";
import bus from "@/infrastructure/utils/bus";
import enumeratie from "@/infrastructure/utils/enumeratie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./fire-floor-right.module.less";

export const FireFloorRight = defineComponent({
  name: "FireFloorRight",
  setup() {
    const { globalState } = useStateStore();
    const { alarmStatusOptions, alarmLeaveOptions } = enumeratie();

    let timer: ReturnType<typeof setInterval> | null = null;
    const handleTime = ref<ModelValueItf>();
    const timeFrame = ref<ModelValueItf>();

    const alarmRank = reactive<{ list: AlarmAreaTop[] }>({
      list: [],
    });

    const colorList = ["#FFC700", "#74AEE7", "#00F27B", "#29C2FF"];
    const alarmCon = ref({
      count: 0,
      ratio: 10,
    });
    const alarmStatusData = ref<AlarmStatus[]>([]);
    const data = ref<any[]>([]);

    const column = ref([
      {
        title: "报警时间",
        dataIndex: "alarmTime",
        width: 120,
      },
      {
        title: "报警级别",
        dataIndex: "alarmLevelCode",
        slots: {
          customRender: "alarmLevelCode",
        },
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

    const statusStyle = computed(() => (key: string) => alarmStatusOptions.value.find((item) => item.value === key));
    const leaveStyle = computed(() => (key: string) => alarmLeaveOptions.value.find((item) => item.value === key));

    const getAlarmHandlTop = async () => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: handleTime.value?.dateRange.join(","),
        type: handleTime.value?.timeType,
      };
      alarmRank.list = await statisticsDeviceTop(params);
    };

    const getAlarmList = async () => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: timeFrame.value?.dateRange.join(","),
        type: timeFrame.value?.timeType,
        pageSize: 50,
        pageNumber: 1,
      };
      const status = await statisticsStatus(params);
      const res = await alarmStatisticsList(params);
      alarmStatusData.value = status.alarmStatusStatistics.map((item, index) => {
        item.color = colorList[index];
        return item;
      });
      alarmCon.value = {
        count: status.alarmNum,
        ratio: status.chainRatio,
      };
      data.value = res.records.map((item) => ({
        ...item,
        alarmTime: moment(item.alarmTime).format("YYYY-MM-DD"),
      }));
    };

    const init = () => {
      getAlarmList();
      getAlarmHandlTop();
    };

    watch(
      () => globalState.business.currentAreaId,
      () => {
        if (timer) clearInterval(timer);
        timer = setInterval(init, (window as any).config.pageLoopRequestTime);
        init();
      },
    );

    const handelClickRow = (record: { alarmTargetCode?: string }) => {
      if (record.alarmTargetCode) {
        bus.emit("equipmentPosition", record);
      }
    };

    onMounted(() => {
      timer = setInterval(init, (window as any).config.pageLoopRequestTime);
    });

    onBeforeUnmount(() => {
      if (timer) clearInterval(timer);
    });

    return () => (
      <div>
        <SubPanelTemplate title="报警设备top5">
          <div class="header">
            <DateInlineForm
              modelValue={handleTime.value}
              onUpdate:modelValue={(v) => {
                handleTime.value = v;
              }}
              onSearch={getAlarmHandlTop}
            />
          </div>
          {alarmRank.list.length > 0 ? (
            <div class="body" style="min-height: 250px">
              {alarmRank.list.map((item, index) => (
                <EventAlarmItem
                  key={item.id}
                  sort={index + 1}
                  name={item.name}
                  linkRatio={item.chainRatio}
                  count={item.alarmNum}
                  ratio={`${item.ratio}%`}
                />
              ))}
            </div>
          ) : (
            <div class="body" style="min-height: 150px">
              <noData />
            </div>
          )}
        </SubPanelTemplate>

        <SubPanelTemplate title="消防报警">
          <div class="header">
            <DateInlineForm
              modelValue={timeFrame.value}
              onUpdate:modelValue={(v) => {
                timeFrame.value = v;
              }}
              onSearch={getAlarmList}
            />
          </div>
          <div class="body">
            <OperateDays title="报警数" value={alarmCon.value.count} class={["body-bum", "alarm-num", styles.bodyNum]}>
              <div class="extra flex-start">
                <div class="mode">环比</div>
                <div class={["downtriangle", alarmCon.value.ratio > 0 && "uptriangle"]} />
                <div class={[alarmCon.value.ratio < 0 ? "down" : "up"]}>{alarmCon.value.ratio}%</div>
              </div>
            </OperateDays>
            <GridContainer data={alarmStatusData.value} />
            <RollTable
              column={column.value}
              data={data.value}
              class={["roll-table", styles.rollTable]}
              onClickRow={handelClickRow}
              v-slots={{
                alarmStatus: ({ record }: { record: { alarmStatus: string } }) => (
                  <span style={{ color: statusStyle.value(record.alarmStatus)?.color }}>
                    {statusStyle.value(record.alarmStatus)?.label}
                  </span>
                ),
                alarmLevelCode: ({ record }: { record: { alarmLevelCode: string } }) => (
                  <span style={{ color: leaveStyle.value(record.alarmLevelCode)?.color }}>
                    {leaveStyle.value(record.alarmLevelCode)?.label}
                  </span>
                ),
              }}
            />
          </div>
        </SubPanelTemplate>
      </div>
    );
  },
});

export default FireFloorRight;
