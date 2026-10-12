import { defineComponent } from "vue";
import { ref, reactive } from "vue";

import WhiteStripeTrading from "../components/white-stripe-trading";
import { supplierDetails } from "@/infrastructure/api/mdata";
import { supplTradeRank } from "@/infrastructure/api/slide";

export const MeatTransactionTop5 = defineComponent({
  name: "MeatTransactionTop5",
  setup(_props, ctx) {
    const transactionData = ref("TODAY");

    const transactionTop = reactive({
      title: "白条交易大户（Top5）",
      tableHead: ["商家名称", "手机号", "来货重量(kg)"],
      areaAlarmRank: [],
    });

    const transactionEvent = (value) => {
      transactionData.value = value;
      supplTradeTop();
    };

    //  白条交易大户（TOP5）
    const supplTradeTop = async () => {
      let res = await supplTradeRank({ type: transactionData.value, pageSize: 5 });
      const wholesalerData = res.records.map((item) => {
        return supplierDetails(item.supplierId);
      });
      let wholesalerList = [];
      try {
        await Promise.all(wholesalerData).then((res) => {
          wholesalerList = res;
        });
      } catch (error) {}

      transactionTop.areaAlarmRank = res.records.map((item) => {
        return {
          alarmNum: item.tradeWeight,
          chainRatio: item.qoqTradeWeight,
          name: item.supplyName,
          ratio: item.tradeWeight, //占比不准确
          code: item.supplierCode,
          phone: wholesalerList.find((wholesaler) => wholesaler.id === item.supplierId)?.phone,
        };
      });
    };

    return (): JSX.Element => (
      <WhiteStripeTrading
        onGetTime={transactionEvent}
        title={transactionTop.title}
        table-head={transactionTop.tableHead}
        areaAlarmRank={transactionTop.areaAlarmRank}
      />
    );
  },
});

export default MeatTransactionTop5;
