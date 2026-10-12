import { defineComponent } from "vue";
import { ref, reactive } from "vue";

import WhiteStripeTrading from "../components/white-stripe-trading";
import { porkBimStatAbattoir } from "@/infrastructure/api/slide";

export const MeatSlaughterhouseSupplyTop = defineComponent({
  name: "MeatSlaughterhouseSupplyTop",
  setup(_props, ctx) {
    const exitData = ref("TODAY");

    const exitTop = reactive({
      title: "屠宰场供货TOP",
      tableHead: ["屠宰场名称&片数", "来货重量(kg)"],
      areaAlarmRank: [],
    });

    const exitEvent = async (value) => {
      exitData.value = value;
      porkBimTop();
    };

    //  白条来货数据（TOP5）
    const porkBimTop = async () => {
      let res = await porkBimStatAbattoir({ type: exitData.value, pageSize: 5 });
      exitTop.areaAlarmRank = res.records.map((item) => {
        return {
          alarmNum: item.supplyWeight,
          chainRatio: item.qoq,
          name: item.abattoirName,
          ratio: item.qoq, //占比不准确
          code: item.supplySlices,
        };
      });
    };

    return (): JSX.Element => (
      <WhiteStripeTrading
        onGetTime={exitEvent}
        title={exitTop.title}
        table-head={exitTop.tableHead}
        areaAlarmRank={exitTop.areaAlarmRank}
      />
    );
  },
});

export default MeatSlaughterhouseSupplyTop;
