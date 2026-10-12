import { defineComponent } from "vue";
import { ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { transactionUserStat } from "@/infrastructure/api/onecard";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

export const AccountConsumptionTop10 = defineComponent({
  name: "AccountConsumptionTop10",
  setup(_props, ctx) {
    const intercomTime = ref<ModelValueItf>();
    const intercomRank = ref([]);

    const getIntercomEvent = async () => {
      intercomRank.value = await transactionUserStat({ type: intercomTime.value.timeType, period: intercomTime.value.dateRange.join(",") });
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="账户消费Top10">
          <template>
            {" "}
            <DateInlineForm
              modelValue={intercomTime.value}
              onUpdate:modelValue={(v) => {
                intercomTime.value = v;
              }}
              onSearch={getIntercomEvent}
            ></DateInlineForm>
          </template>
          <div class="body" style="min-height: 250px">
            {intercomRank.map((item, index) => (
              <EventAlarmItem sn={false} sort={index + 1} name={item.name} count={item.value} />
            ))}
          </div>
          <div class="body" style="min-height: 250px">
            {" "}
            <noData></noData>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default AccountConsumptionTop10;
