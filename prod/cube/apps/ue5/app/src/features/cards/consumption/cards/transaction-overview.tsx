import { defineComponent } from "vue";
import { ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { transactionAmountStat, transactionTypeStat } from "@/infrastructure/api/onecard";
import pieGuidance from "@/shared-ui/panel/charts/pie/pie-guidance";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./transaction-overview.module.less";

export const TransactionOverview = defineComponent({
  name: "TransactionOverview",
  setup(_props, ctx) {
    const yData = ref([]);
    const transactionList = ref([
      {
        label: "交易金额",
        value: "0",
        ratio: 0,
      },
      {
        label: "交易笔数",
        value: "0",
        ratio: 0,
      },
      {
        label: "单笔平均金额",
        value: "0",
        ratio: 0,
      },
    ]);
    const transactionTime = ref<ModelValueItf>();

    const changeTransactionTime = async () => {
      let colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
      const res = await transactionAmountStat({ type: transactionTime.value.timeType, period: transactionTime.value.dateRange.join(",") });
      const data = await transactionTypeStat({ type: transactionTime.value.timeType, period: transactionTime.value.dateRange.join(",") });
      transactionList.value[0].value = res.amount;
      transactionList.value[0].ratio = res.qoqAmount;
      transactionList.value[1].value = res.num;
      transactionList.value[1].ratio = res.qoqNum;
      transactionList.value[2].value = res.avgAmount;
      transactionList.value[2].ratio = res.qoqAvgAmount;
      yData.value = data.map((item, index) => {
        return {
          name: item.name,
          value: item.value,
          itemStyle: { color: colorList[index] },
        };
      });
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="金额交易情况概览">
          <template>
            {" "}
            <DateInlineForm
              modelValue={transactionTime.value}
              onUpdate:modelValue={(v) => {
                transactionTime.value = v;
              }}
              onSearch={changeTransactionTime}
            ></DateInlineForm>
          </template>
          <div class="environment-box">
            {transactionList.map((item) => (
              <div class="environment-item">
                <div class="environment-item-title"> {item.label}</div>
                <div class="environment-item-box">
                  <div class="environment-item-value"> {item.value || 0}</div>
                  <div class="extra flex-start">
                    <div class="mode"> 环比</div>
                    <div class={["downtriangle", item.ratio > 0 && "uptriangle"]}></div>
                    <div class={[item.ratio < 0 ? "down" : "up"]}>{item.ratio}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div class="pie-chart">
            {" "}
            <pieGuidance showLegend={false} y-data={yData.value} height="80%"></pieGuidance>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default TransactionOverview;
