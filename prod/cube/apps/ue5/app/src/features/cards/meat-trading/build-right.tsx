import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import iouTable from "./components/iou-table";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { porkBimStatSummary, porkBimStatSupplyData, spotCheck } from "@/infrastructure/api/slide";
import { setTimeType } from "@/infrastructure/utils/common";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import barChart from "@/shared-ui/panel/charts/bar/barChart";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./build-right.module.less";

export const BuildRight = defineComponent({
  name: "BuildRight",
  setup(_props, ctx) {
    const transactionTime = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: [],
    });
    const supplyMaterial = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: [],
    });
    const foodSafetyTime = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: [],
    });
    const Operatevalue = ref<number>();
    const transactionInfoData = ref([]);
    const transactionDetails = ref(false);
    const supplyInformationData = reactive({
      supplier: 0,
      qoqSupplier: 0,
      supplyWeight: 0,
      qoqSupplyWeight: 0,
      supplySlices: 0,
      qoqSupplySlices: 0,
    });
    const foodSafety = reactive<any>({
      yData: [
        {
          color: "#D9E7FF",
          data: [],
          name: "不合格数量",
          showBackground: true,
          backgroundStyle: { color: "#6C8097" },
          labelFalge: true,
        },
      ],
      xData: ["检疫票", "瘦肉精", "含水量"],
    });
    const timeList = [
      { label: "近7天", value: "THIS_WEEK" },
      { label: "近30天", value: "THIS_MONTH" },
      { label: "近1年", value: "THIS_YEAR" },
    ];
    const changeSupplyMaterialTime = () => {
      supplyInformationEvent();
    };
    const changeFoodSafetyTimeTime = () => {
      foodSafetyInformationEvent();
    };
    const changeTransactionTime = () => {
      transactionEvent();
    };
    const close = () => {
      transactionDetails.value = false;
    };
    const showIot = () => {
      transactionDetails.value = true;
    };
    // 交易信息
    const transactionEvent = async () => {
      let res = await porkBimStatSummary({ type: setTimeType(transactionTime.value.timeType) });
      transactionInfoData.value = [
        {
          name: "交易金额",
          value: res.tradeAmount,
          chainRatio: res.qoqTradeAmount,
          unit: "元",
        },
        {
          name: "交易佣金",
          value: res.tradeCommission,
          chainRatio: res.qoqTradeCommission,
          unit: "元",
        },
        {
          name: "交易均价",
          value: res.tradeAverageAmount,
          chainRatio: res.qoqTradeAverageAmount,
          unit: "元",
        },
        {
          name: "实际均价",
          value: res.actualAverageAmount,
          chainRatio: res.qoqActualAverageAmount,
          unit: "元/kg",
        },
        {
          name: "交易重量",
          value: res.tradeWeight,
          chainRatio: res.qoqTradeWeight,
          unit: "kg",
        },
        {
          name: "交易片数",
          value: res.tradeSlices,
          chainRatio: res.qoqTradeSlices,
          unit: "片",
        },
      ];
    };
    // 供货信息
    const supplyInformationEvent = async () => {
      let res = await porkBimStatSupplyData({ type: setTimeType(supplyMaterial.value.timeType) });
      Object.assign(supplyInformationData, res);
      supplyInformationData.qoqSupplier = Number(supplyInformationData.qoqSupplier);
    };

    const foodSafetyInformationEvent = async () => {
      const data = await spotCheck({
        type: setTimeType(foodSafetyTime.value.timeType),
      });
      Operatevalue.value = data.supplyReports;
      Object.assign(foodSafety.yData[0].data, [
        {
          value: data.pratiqueFailed,
          pop: data.qoqPratiqueFailed,
        },
        {
          value: data.clenbuterolFailed,
          pop: data.qoqClenbuterolFailed,
        },
        {
          value: data.watered,
          pop: data.qoqWatered,
        },
      ]);
      foodSafety.xData = ["检疫票", "瘦肉精", "含水量"];
    };

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="交易信息">
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
            <div class="transaction-info-box" onClick={showIot}>
              {transactionInfoData.map((item) => (
                <div class="transaction-info" key={item.name}>
                  <div class="transaction-info-title">
                    <img src={getAssetsImage("overView49.png")} alt></img>
                    <span> {item.name}</span>
                  </div>
                  <div class="transaction-info-data">
                    <count-to startVal={0} endVal={Number(item.value)} duration={2000} separator></count-to>
                    <span class="unit"> {item.unit}</span>
                  </div>
                  <div class="ringRatio">
                    <span> 环比</span>
                    <div class={["downtriangle", item.chainRatio > 0 && "uptriangle"]}></div>
                    <div class={[item.chainRatio > 0 ? "up" : "down"]}> {item.chainRatio + "%"}</div>
                  </div>
                </div>
              ))}
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="供货信息">
            <template>
              {" "}
              <DateInlineForm
                timeList={timeList}
                modelValue={supplyMaterial.value}
                onUpdate:modelValue={(v) => {
                  supplyMaterial.value = v;
                }}
                onSearch={changeSupplyMaterialTime}
              ></DateInlineForm>
            </template>
            <div class="supply-material-box">
              <div class="supply-material-left">
                <div class="centerBox">
                  <div class="supply-material-name"> 供货商户数</div>
                  <div class="supply-material-name">
                    <count-to startVal={0} endVal={Number(supplyInformationData.supplier)} duration={2000} separator></count-to>
                    <span class="unit"> 户</span>
                  </div>
                  <div class="ringRatio">
                    <span> 环比</span>
                    <div class={["downtriangle", supplyInformationData.qoqSupplier > 0 && "uptriangle"]}></div>
                    <div class={[supplyInformationData.qoqSupplier > 0 ? "up" : "down"]}>{supplyInformationData.qoqSupplier + "%"}</div>
                  </div>
                </div>
              </div>
              <div class="flex-content">
                <div class="supply-material-right">
                  <div class="supply-material-info">
                    <div class="supply-material-data">
                      <span> 供货重量</span>
                      <div class="ringRatio">
                        <span> 环比</span>
                        <div class={["downtriangle", supplyInformationData.qoqSupplyWeight > 0 && "uptriangle"]}></div>
                        <div class={[supplyInformationData.qoqSupplyWeight > 0 ? "up" : "down"]}>
                          {" "}
                          {supplyInformationData.qoqSupplyWeight + "%"}
                        </div>
                      </div>
                    </div>
                    <div class="supply-material-value">
                      <count-to startVal={0} endVal={Number(supplyInformationData.supplyWeight)} separator></count-to>
                      <span class="unit"> kg</span>
                    </div>
                  </div>
                </div>
                <div class="supply-material-right">
                  <div class="supply-material-info">
                    <div class="supply-material-data">
                      <span> 供货片数</span>
                      <div class="ringRatio">
                        <span> 环比</span>
                        <div class={["downtriangle", supplyInformationData.qoqSupplySlices > 0 && "uptriangle"]}></div>
                        <div class={[supplyInformationData.qoqSupplySlices > 0 ? "up" : "down"]}>
                          {" "}
                          {supplyInformationData.qoqSupplySlices + "%"}
                        </div>
                      </div>
                    </div>
                    <div class="supply-material-value">
                      <count-to startVal={0} endVal={supplyInformationData.supplySlices} duration={2000} separator></count-to>
                      <span class="unit"> 片</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="食安信息">
            <template>
              {" "}
              <DateInlineForm
                timeList={timeList}
                modelValue={foodSafetyTime.value}
                onUpdate:modelValue={(v) => {
                  foodSafetyTime.value = v;
                }}
                onSearch={changeFoodSafetyTimeTime}
              ></DateInlineForm>
            </template>
            <OperateDays value={Operatevalue.value} title="来货报备批次数"></OperateDays>
            <div class="chart">
              {" "}
              <barChart colorLsit={["#98ACCD", "#D9E7FF"]} data={foodSafety.yData} xData={foodSafety.xData}></barChart>
            </div>
          </SubPanelTemplate>
        </div>
        <iouTable onClose={close} time={transactionTime.timeType} show-modal={transactionDetails.value}></iouTable>
      </>
    );
  },
});

export default BuildRight;
