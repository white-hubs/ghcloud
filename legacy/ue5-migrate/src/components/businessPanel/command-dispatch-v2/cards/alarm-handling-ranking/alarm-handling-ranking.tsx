import { defineComponent, reactive, onMounted, ref } from "vue";

import { departmentHandlerTop } from "@/api/alarm";
import { AlarmAreaTop } from "@/api/models/alarm";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import EventAlarmItem from "@/components/businessPanel/public/eventAlarmItem.vue";
import NoData from "@/components/businessPanel/public/noData.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import ModalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import { useStateStore } from "@/pages/state/use-state-store";

import styles from "./alarm-handling-ranking.module.less";

// 报警处理排名
export const AlarmHandlingRanking = defineComponent({
  name: "AlarmHandlingRanking",
  setup() {
    const { globalState } = useStateStore();
    const handleTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const areaAlarmRank = ref<AlarmAreaTop[]>([]);
    const alarmModalShow = ref<boolean>(false);
    const parameter = reactive({
      alarmLevelCode: "",
      alarmStatus: "",
      dateRange: [],
      departmentId: "",
      deviceTags: [
        "builtin.app::SECURITY_MONITORING",
        "builtin.app::ELECTRICMANAGE",
        "builtin.app::FIRECONTROL",
        "builtin.app::GAS_MANAGEMENT",
        "builtin.app::ROTATINGMANAGE",
      ].toString(),
    });

    const areaAlarmStatistic = async () => {
      let params = {
        areaId: globalState.business.currentAreaId,
        type: handleTime.value.timeType,
        deviceTags: [
          "builtin.app::SECURITY_MONITORING",
          "builtin.app::ELECTRICMANAGE",
          "builtin.app::FIRECONTROL",
          "builtin.app::GAS_MANAGEMENT",
          "builtin.app::ROTATINGMANAGE",
        ],
        period: handleTime.value.dateRange.join(","),
      };
      areaAlarmRank.value = await departmentHandlerTop(params);
    };

    const departmentalRanking = (value) => {
      parameter.dateRange = handleTime.value.dateRange;
      parameter.deviceTags = [
        "builtin.app::SECURITY_MONITORING",
        "builtin.app::ELECTRICMANAGE",
        "builtin.app::FIRECONTROL",
        "builtin.app::GAS_MANAGEMENT",
        "builtin.app::ROTATINGMANAGE",
      ].toString();
      parameter.alarmStatus = "ALARM_HANDLER";
      parameter.alarmLevelCode = undefined;
      parameter.departmentId = value.id;
      alarmModalShow.value = true;
    };

    const closeModal = () => {
      alarmModalShow.value = false;
    };

    onMounted(() => {
      areaAlarmStatistic();
    });

    return () => (
      <SubPanelTemplate
        title="报警处理排名"
        class="alarm-event"
        v-slots={{
          extra: () => <DateInlineForm v-model:modelValue={handleTime.value} onSearch={areaAlarmStatistic}></DateInlineForm>,
        }}
      >
        <div v-show={areaAlarmRank.value.length !== 0} class={styles["body"]} style="min-height: 250px;cursor: pointer;">
          {areaAlarmRank.value.map((item, index) => (
            <div key={item.id} onClick={() => departmentalRanking(item)}>
              <EventAlarmItem
                sort={index + 1}
                name={item.name}
                linkRatio={item.chainRatio}
                count={item.alarmNum}
                ratio={item.ratio + "%"}
              />
            </div>
          ))}
        </div>
        <div v-show={areaAlarmRank.value.length === 0} class={styles["body"]}>
          <NoData></NoData>
        </div>
        <ModalAlarmTable show-modal={alarmModalShow.value} onClose={closeModal} parameter={parameter}></ModalAlarmTable>
      </SubPanelTemplate>
    );
  },
});
