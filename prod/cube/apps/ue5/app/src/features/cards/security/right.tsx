import { defineComponent } from "vue";
import { onMounted, reactive, ref } from "vue";

import tableData from "./rollTable";
import securityMonitor from "@/features/cards/security-monitoring-safty/cards/security-monitor";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { AlarmAreaTop } from "@/infrastructure/api/models/alarm";
import bus from "@/infrastructure/utils/bus";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import usrCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    interface AlarmHandlType {
      list: AlarmAreaTop[];
    }

    const alarmRank = reactive<AlarmHandlType>({
      list: [],
    });
    let falg = ref<number>(0);
    let tableList = ref([]);
    const { eventTime, getEventTop, unusualTime, getremakerList } = usrCommon();
    const { globalState } = useStateStore();

    // 报警事件
    async function changeEventTime() {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: eventTime.value.dateRange.join(","),
        type: eventTime.value.timeType,
      };
      alarmRank.list = await getEventTop(param);
    }
    // 巡逻异常
    async function changeUnusualTime() {
      let param = {
        period: unusualTime.value.dateRange.join(","),
        pageNumber: 1,
        pageSize: 50,
      };
      tableList.value = await getremakerList(param);
      falg.value++;
    }

    const handelClickRow = (record) => {
      if (record.alarmTargetCode) {
        bus.emit("equipmentPosition", record);
      }
    };
    const { column } = tableData();
    function init() {
      changeEventTime();
      changeUnusualTime();
    }
    onMounted(() => {
      init();
    });

    return (): JSX.Element => (
      <>
        <div>
          <securityMonitor></securityMonitor>
          <SubPanelTemplate title="报警事件top5" class="alarm-event">
            <template>
              {" "}
              <DateInlineForm
                modelValue={eventTime}
                onUpdate:modelValue={(v) => {
                  eventTime.value = v;
                }}
                onSearch={changeEventTime}
              ></DateInlineForm>
            </template>
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
          </SubPanelTemplate>
          <SubPanelTemplate title="巡逻异常数统计">
            <template>
              {" "}
              <DateInlineForm
                modelValue={unusualTime}
                onUpdate:modelValue={(v) => {
                  unusualTime.value = v;
                }}
                onSearch={changeUnusualTime}
              ></DateInlineForm>
            </template>
            <div class="body" style="min-height: 200px; position: relative" style={{ top: tableList.length <= 0 ? "-40px" : "0px" }}>
              <RollTable key={falg.value} column={column} data={tableList.value} onClickRow={handelClickRow}>
                <template>
                  <a-image-preview-group>
                    {record.photos.url.map((item) => (
                      <a-image width={30} height={30} src={item}></a-image>
                    ))}
                  </a-image-preview-group>
                </template>
              </RollTable>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Right;
