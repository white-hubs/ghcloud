import { defineComponent } from "vue";
import { ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { transactionCopiesStatTime } from "@/infrastructure/api/onecard";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./share-transaction-trend.module.less";

export const ShareTransactionTrend = defineComponent({
  name: "ShareTransactionTrend",
  setup(_props, ctx) {
    const handleTime = ref<ModelValueItf>();
    const xData = ref<string[]>(["1", "2", "3", "4", "5", "6"]);
    const yDataTrend = ref<number[]>([2, 3, 4, 5, 6, 7, 8]);

    const changeHandleTime = async () => {
      const res = await transactionCopiesStatTime({ type: handleTime.value.timeType, period: handleTime.value.dateRange.join(",") });
      xData.value = res.map((item) => {
        return handleTime.value.timeType === "TODAY" ? item.code + "时" : item.code;
      });
      yDataTrend.value = res.map((item) => {
        return item.value;
      });
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="份额交易趋势图">
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
          <div class="chart">
            <LineChart
              unit={{ x: "", y: "元" }}
              gridTop={"20"}
              x-data={xData.value}
              series={[
                {
                  data: yDataTrend,
                  linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
                },
              ]}
            />
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default ShareTransactionTrend;
