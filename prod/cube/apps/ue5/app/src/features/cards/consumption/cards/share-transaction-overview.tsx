import { defineComponent } from "vue";
import { ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { transactionCopiesStat, transactionCopiesTypeStat } from "@/infrastructure/api/onecard";
import pieGuidance from "@/shared-ui/panel/charts/pie/pie-guidance";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./share-transaction-overview.module.less";

export const ShareTransactionOverview = defineComponent({
  name: "ShareTransactionOverview",
  setup(_props, ctx) {
    const yData = ref([
      {
        name: "退款",
        value: 10,
        color: "#0099FF",
      },
      {
        name: "消费",
        value: 20,
        color: "#FF9900",
      },
      {
        name: "充值",
        value: 30,
        color: "#63a35c",
      },
    ]);
    const transactionList = ref([
      {
        label: "交易份数",
        value: "100",
        ratio: 10,
      },
      {
        label: "交易笔数",
        value: "100",
        ratio: 10,
      },
      {
        label: "单笔平均份数",
        value: "100",
        ratio: 10,
      },
    ]);
    const transactionTime = ref<ModelValueItf>();

    const changeTransactionTime = async () => {
      let colorList = ["#2AE8BD", "#99C7FF", "#FFC700", "#F14545"];
      const res = await transactionCopiesStat({ type: transactionTime.value.timeType, period: transactionTime.value.dateRange.join(",") });
      transactionList.value[0].value = res.amount;
      transactionList.value[0].ratio = res.qoqAmount;
      transactionList.value[1].value = res.num;
      transactionList.value[1].ratio = res.qoqNum;
      transactionList.value[2].value = res.avgAmount;
      transactionList.value[2].ratio = res.qoqAvgAmount;
      const data = await transactionCopiesTypeStat({
        type: transactionTime.value.timeType,
        period: transactionTime.value.dateRange.join(","),
      });
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
        <SubPanelTemplate title="份额交易概览">
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

export default ShareTransactionOverview;
