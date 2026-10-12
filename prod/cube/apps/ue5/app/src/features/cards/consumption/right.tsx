import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import {
  accountStatusStat,
  transactionCopiesStat,
  transactionCopiesStatTime,
  transactionCopiesTypeStat,
} from "@/infrastructure/api/onecard";
import pieGuidance from "@/shared-ui/panel/charts/pie/pie-guidance";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
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
    const accountStatusData = ref([]);
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
    const handleTime = ref<ModelValueItf>();
    const transactionTime = ref<ModelValueItf>();
    const xData = ref<string[]>(["1", "2", "3", "4", "5", "6"]);
    const yDataTrend = ref<number[]>([2, 3, 4, 5, 6, 7, 8]);
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
    const changeHandleTime = async () => {
      const res = await transactionCopiesStatTime({ type: handleTime.value.timeType, period: handleTime.value.dateRange.join(",") });
      xData.value = res.map((item) => {
        return handleTime.value.timeType === "TODAY" ? item.code + "时" : item.code;
      });
      yDataTrend.value = res.map((item) => {
        return item.value;
      });
    };
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
        <div>
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
        </div>
      </>
    );
  },
});

export default Right;
