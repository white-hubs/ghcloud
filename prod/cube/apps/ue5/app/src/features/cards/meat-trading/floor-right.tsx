import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { summary, supplydata, arrangedata } from "@/infrastructure/api/slide";
import { setTimeType } from "@/infrastructure/utils/common";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./floor-right.module.less";

export const FloorRight = defineComponent({
  name: "FloorRight",
  setup(_props, ctx) {
    const transactionData = ref<any>();
    const timeData = ref("");
    const beforeTimeData = ref("");
    const transactionTime = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: [],
    });
    const ltransactionTime = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: [],
    });
    const timeList = [
      { label: "近7天", value: "THIS_WEEK" },
      { label: "近30天", value: "THIS_MONTH" },
      { label: "近1年", value: "THIS_YEAR" },
    ];
    const arranged = reactive<any>({});
    const lchangeTransactionTime = async () => {
      let data = await arrangedata({ type: setTimeType(ltransactionTime.value.timeType) });
      Object.assign(arranged, data);
    };
    const changeTransactionTime = async () => {
      let data = await summary({ type: setTimeType(transactionTime.value.timeType) });
      let summarydata = await supplydata({ type: setTimeType(transactionTime.value.timeType) });
      transactionData.value = [
        {
          name: "交易量",
          transactionInfoData: [
            {
              name: "交易片数",
              value: data.tradeSlices,
              chainRatio: data.qoqTradeSlices,
              unit: "片",
            },
            {
              name: "交易重量",
              value: data.tradeWeight,
              chainRatio: data.qoqTradeWeight,
              unit: "kg",
            },
          ],
        },
        {
          name: "交易均价",
          transactionInfoData: [
            {
              name: "交易均价",
              value: data.tradeAverageAmount,
              chainRatio: data.qoqTradeAverageAmount,
              unit: "元/kg",
            },
            {
              name: "实际均价",
              value: data.actualAverageAmount,
              chainRatio: data.qoqActualAverageAmount,
              unit: "元/kg",
            },
          ],
        },
        {
          name: "交易金额",
          transactionInfoData: [
            {
              name: timeData.value + "交易金额",
              value: data.tradeAmount,
              chainRatio: data.qoqTradeAmount,
              unit: "元",
            },
            {
              name: timeData.value + "交易佣金",
              value: data.tradeCommission,
              chainRatio: data.qoqTradeCommission,
              unit: "元",
            },
          ],
        },
        {
          name: "供货量",
          transactionInfoData: [
            {
              name: timeData.value + "供货片数",
              value: summarydata.supplySlices,
              chainRatio: summarydata.qoqSupplySlices,
              unit: "片",
            },
            {
              name: timeData.value + "供货重量",
              value: summarydata.supplyWeight,
              chainRatio: summarydata.qoqSupplyWeight,
              unit: "kg",
            },
          ],
        },
      ];
    };

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="白条交易数据">
            <template>
              {" "}
              <DateInlineForm
                timeList={timeList}
                modelValue={transactionTime.value}
                onUpdate:modelValue={(v) => {
                  transactionTime.value = v;
                }}
                onSearch={changeTransactionTime}
              ></DateInlineForm>
            </template>
            {transactionData.map((item) => (
              <div class="transaction-list" key={item.name}>
                <div class="transaction-column">
                  <span class="transaction-column-drop"></span>
                  <span class="transaction-column-name"> {item.name}</span>
                </div>
                <div class="transaction-box">
                  {item.transactionInfoData.map((data) => (
                    <div class="transaction-info" key={item.name}>
                      <div class="transaction-info-title">
                        {" "}
                        <span> {data.name}</span>
                      </div>
                      <div class="transaction-info-data">
                        <count-to startVal={0} endVal={data.value} duration={2000} separator></count-to>
                        <span class="unit"> {data.unit}</span>
                      </div>
                      <div class="ringRatio">
                        <span> 环比</span>
                        <div class={["downtriangle", data.chainRatio > 0 && "uptriangle"]}></div>
                        <div class={[data.chainRatio > 0 ? "up" : "down"]}> {data.chainRatio + "%"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </SubPanelTemplate>
          <SubPanelTemplate title="理货审核率">
            <template>
              {" "}
              <DateInlineForm
                timeList={timeList}
                modelValue={ltransactionTime.value}
                onUpdate:modelValue={(v) => {
                  ltransactionTime.value = v;
                }}
                onSearch={lchangeTransactionTime}
              ></DateInlineForm>
            </template>
            <div class="supply-material-box">
              <div class="supply-material-left">
                <div class="centerBox">
                  <div class="supply-material-name"> 理货审核总数</div>
                  <div class="supply-material-name">
                    {" "}
                    <count-to startVal={0} endVal={arranged.total} duration={2000} separator></count-to>
                  </div>
                </div>
              </div>
              <div class="flex-content">
                <div class="supply-material-right">
                  <div class="supply-material-info">
                    <div class="supply-material-data">
                      <span> 理货合格数</span>
                      <div class="ringRatio">
                        <span> 环比</span>
                        <div class={["downtriangle", arranged.qoqPorkArrangeAuditPassed > 0 && "uptriangle"]}></div>
                        <div class={[arranged.qoqPorkArrangeAuditPassed > 0 ? "up" : "down"]}>
                          {" "}
                          {arranged.qoqPorkArrangeAuditPassed + "%"}
                        </div>
                      </div>
                    </div>
                    <div class="supply-material-value">
                      <count-to startVal={0} endVal={arranged.porkArrangeAuditPassedNum} duration={2000} separator></count-to>
                      <span class="unit" style="margin-left:10px">
                        {arranged.porkArrangeAuditPassed}%
                      </span>
                    </div>
                  </div>
                </div>
                <div class="supply-material-right">
                  <div class="supply-material-info">
                    <div class="supply-material-data">
                      <span> 理货不合格数</span>
                      <div class="ringRatio">
                        <span> 环比</span>
                        <div class={["downtriangle", arranged.qoqPorkArrangeAuditFailed > 0 && "uptriangle"]}></div>
                        <div class={[arranged.qoqPorkArrangeAuditFailed > 0 ? "up" : "down"]}>
                          {" "}
                          {arranged.qoqPorkArrangeAuditFailed + "%"}
                        </div>
                      </div>
                    </div>
                    <div class="supply-material-value">
                      <count-to startVal={0} endVal={arranged.porkArrangeAuditFailedNum} duration={2000} separator></count-to>
                      <span class="unit" style="margin-left:10px">
                        {arranged.porkArrangeAuditFailed}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default FloorRight;
