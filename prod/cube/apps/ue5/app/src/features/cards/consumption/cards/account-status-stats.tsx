import { defineComponent } from "vue";
import { ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { accountStatusStat } from "@/infrastructure/api/onecard";
import pieGuidance from "@/shared-ui/panel/charts/pie/pie-guidance";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./account-status-stats.module.less";

export const AccountStatusStats = defineComponent({
  name: "AccountStatusStats",
  setup(_props, ctx) {
    const accountStatusData = ref([]);
    const intercomList = ref([
      {
        label: "账户总数",
        value: "0",
      },
      {
        label: "正常状态",
        value: "0",
      },
      {
        label: "过期状态",
        value: "0",
      },
    ]);
    const intercomTime = ref<ModelValueItf>();

    const getIntercomEvent = async () => {
      const res = await accountStatusStat({ type: intercomTime.value.timeType, period: intercomTime.value.dateRange.join(",") });
      intercomList.value[0].value = res.total;
      intercomList.value[1].value = res.normal;
      intercomList.value[2].value = res.expired;
      accountStatusData.value = [
        {
          name: "正常",
          value: res.normal,
          color: "#19F8F7",
        },
        {
          name: "过期",
          value: res.expired,
          color: "#FFC700",
        },
      ];
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="账户实时状态统计">
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
          <div class="environment-box">
            {intercomList.map((item) => (
              <div class="environment-item">
                <div class="environment-item-title"> {item.label}</div>
                <div class="environment-item-box">
                  <div class="environment-item-value">{item.value || 0}个</div>
                </div>
              </div>
            ))}
          </div>
          <div class="pie-chart">
            {" "}
            <pieGuidance showLegend={false} y-data={accountStatusData.value} height="80%"></pieGuidance>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default AccountStatusStats;
