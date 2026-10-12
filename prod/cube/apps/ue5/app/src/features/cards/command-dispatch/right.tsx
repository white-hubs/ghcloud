import moment from "moment";
import { defineComponent } from "vue";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import DutyPersonList from "@/features/panel-shell/tables/duty-person-list/duty-person-list";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmHandleTop } from "@/infrastructure/api/alarm";
import { arrangeTodayStat } from "@/infrastructure/api/attendance";
import { AlarmAreaTop } from "@/infrastructure/api/models/alarm";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    interface AlarmHandlType {
      list: AlarmAreaTop[];
    }
    let timer: any = reactive(null);
    const { globalState } = useStateStore();
    let handleTime = ref<ModelValueItf>();
    let AlarmHandlList = reactive<AlarmHandlType>({
      list: [],
    });
    let personnelInfo = reactive({
      obj: {
        arrive: 0,
        total: 0,
      },
      list: [],
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
    // 报警处理排名
    function changeHandleTime() {
      getAlarmHandlTop();
    }
    async function getAlarmHandlTop() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: handleTime.value.dateRange.join(","),
        type: handleTime.value.timeType,
      };
      AlarmHandlList.list = await alarmHandleTop(params);
    }
    const getDutyPersonnel = async () => {
      let res = await arrangeTodayStat();
      personnelInfo.obj.arrive = res.workCount;
      personnelInfo.obj.total = res.totalCount;
      personnelInfo.list = res.staffResultList.map((item) => {
        return {
          ...item,
          startWorkTime: moment(item.startWorkTime).format("DD日HH:mm"),
          endWorkTime: moment(item.endWorkTime).format("DD日HH:mm"),
        };
      });
    };
    function init() {
      getDutyPersonnel();
      getAlarmHandlTop();
    }
    onMounted(() => {
      getDutyPersonnel();
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
          <SubPanelTemplate title="当日值班人员" class="monitor">
            {" "}
            <div class="body">
              {" "}
              <DutyPersonList arrive={personnelInfo.obj.arrive} total={personnelInfo.obj.total} list={personnelInfo.list} />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警处理排名" class="alarm-event">
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
              {AlarmHandlList.list.map((item, index) => (
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
            <div class="body" style="min-height: 200px;">
              {" "}
              <noData></noData>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Right;
