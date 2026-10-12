import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { canteenConsumptionAmount, canteenConsumptionPersonCount } from "@/infrastructure/api/onecard";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";
import DisplayPanel from "@/shared-ui/panel/display-panel";
import noData from "@/shared-ui/panel/noData";

import styles from "./per-capita-consumption-amount-statistics.module.less";

export const PerCapitaConsumptionAmountStatistics = defineComponent({
  name: "PerCapitaConsumptionAmountStatistics",
  setup(_props, ctx) {
    interface ListItem {
      name: string;
      value: number;
      color?: string;
    }
    const state = reactive<{
      listData: ListItem[];
    }>({
      listData: [],
    });

    const workOrderTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });

    const changeHandleworkOrderTime = async () => {
      try {
        const [amountRes, personRes] = await Promise.all([
          canteenConsumptionAmount({ period: workOrderTime.value.dateRange.join(","), type: workOrderTime.value.timeType }),
          canteenConsumptionPersonCount({ period: workOrderTime.value.dateRange.join(","), type: workOrderTime.value.timeType }),
        ]);

        let amount = 0;
        let personCount = 0;

        if (typeof amountRes === "number") {
          amount = amountRes;
        } else if (amountRes && typeof amountRes.amount === "number") {
          amount = amountRes.amount;
        } else if (amountRes && typeof amountRes.data === "number") {
          amount = amountRes.data;
        }

        if (typeof personRes === "number") {
          personCount = personRes;
        } else if (personRes && typeof personRes.count === "number") {
          personCount = personRes.count;
        } else if (personRes && typeof personRes.data === "number") {
          personCount = personRes.data;
        }

        const perCapita = personCount > 0 ? amount / personCount : 0;

        state.listData = [
          {
            name: "消费金额",
            value: Number(amount.toFixed(2)),
          },
          {
            name: "消费人数",
            value: personCount,
          },
          {
            name: "人均消费金额",
            value: Number(perCapita.toFixed(2)),
          },
        ];
      } catch (error) {
        state.listData = [];
      }
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="人均消费金额统计">
          <template>
            {" "}
            <DateInlineForm
              modelValue={workOrderTime.value}
              onUpdate:modelValue={(v) => {
                workOrderTime.value = v;
              }}
              onSearch={changeHandleworkOrderTime}
            ></DateInlineForm>
          </template>
          {state.listData.length > 0 && (
            <div class="data-stat">
              {" "}
              <DisplayPanel bg-img={"overView47.png"} content-list={state.listData}></DisplayPanel>
            </div>
          )}
          <div class="data-stat" style="min-height: 150px">
            {" "}
            <noData />
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default PerCapitaConsumptionAmountStatistics;
