import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { transactionAmountStat, transactionTrendStat, transactionTypeStat, transactionUserStat } from "@/infrastructure/api/onecard";
import pieGuidance from "@/shared-ui/panel/charts/pie/pie-guidance";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import LineChart from "@/shared-ui/panel/lineChart";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
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
    const intercomTime = ref<ModelValueItf>();
    const transactionTime = ref<ModelValueItf>();
    const handleTime = ref<ModelValueItf>();
    const xData = ref<string[]>([]);
    const yDataTrend = ref<number[]>([]);
    const intercomRank = ref([]);
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
    const changeHandleTime = async () => {
      const res = await transactionTrendStat({ type: handleTime.value.timeType, period: handleTime.value.dateRange.join(",") });
      xData.value = res.map((item) => {
        return handleTime.value.timeType === "TODAY" ? item.code + "时" : item.code;
      });
      yDataTrend.value = res.map((item) => {
        return item.value;
      });
    };
    const getIntercomEvent = async () => {
      intercomRank.value = await transactionUserStat({ type: intercomTime.value.timeType, period: intercomTime.value.dateRange.join(",") });
    };

    return (): JSX.Element => (
      <>
        <div>
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
          <SubPanelTemplate title="金额交易趋势图">
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
        </div>
      </>
    );
  },
});

export default Left;
