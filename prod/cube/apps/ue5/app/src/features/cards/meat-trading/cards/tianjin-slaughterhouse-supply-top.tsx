import { defineComponent } from "vue";
import { ref, reactive } from "vue";

import ModalSupplyTable from "../components/modal-supply-table";
import WhiteStripeTrading from "../components/white-stripe-trading";
import { porkBimStatAbattoir } from "@/infrastructure/api/slide-tianjin";

export const TianjinSlaughterhouseSupplyTop = defineComponent({
  name: "TianjinSlaughterhouseSupplyTop",
  setup(_props, ctx) {
    const exitData = ref("THIS_WEEK");
    const showExitModal = ref(false);

    const exitTop = reactive({
      title: "屠宰场供货TOP",
      tableHead: ["屠宰场名称", "片数", "来货重量(kg)"],
      areaAlarmRank: [],
    });

    const exitEvent = async (value) => {
      exitData.value = value;
      porkBimTop();
    };

    const showMoreExit = (item: any) => {
      showExitModal.value = true;
    };

    const closeExitModal = () => {
      showExitModal.value = false;
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
          phone: item.supplySlices,
        };
      });
    };

    return (): JSX.Element => (
      <>
        <WhiteStripeTrading
          onGetTime={exitEvent}
          onShowMore={showMoreExit}
          title={exitTop.title}
          table-head={exitTop.tableHead}
          areaAlarmRank={exitTop.areaAlarmRank}
        />
        <ModalSupplyTable showModal={showExitModal.value} type={exitData.value} onClose={closeExitModal} />
      </>
    );
  },
});

export default TianjinSlaughterhouseSupplyTop;
