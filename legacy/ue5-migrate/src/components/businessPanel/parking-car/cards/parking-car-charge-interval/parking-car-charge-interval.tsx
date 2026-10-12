
import { defineComponent, onMounted, reactive, ref } from "vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import OperateDays from "@/components/businessPanel/public/operateDays.vue";
import RoundPie from "@/components/businessPanel/public/charts/roundPie/roundPie.vue";
import PieList from "@/components/businessPanel/public/pieList.vue";
import { getAssetsImage } from "@/utils/getImage";
import styles from "./parking-car-charge-interval.module.less";
import { paymentMethod } from "@/utils/requestData/parkingSpaceManage";


// 收费方式占比
export const ParkingCarChargeInterval = defineComponent({
  name: "ParkingCarChargeInterval",
  setup() {

    let pay = ref();
    const total = ref(0);
    const moneyUnit = ref("元");
    const roundPieData = reactive({ arr: [] });
    const colorList = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A", "#CBE2FF"];

    const paymentProportion = async () => {
      const res = await paymentMethod({ dimension: pay.value.timeType });
      roundPieData.arr = res.arr.map((item, index) => {
        item.color = colorList[index];
        return item;
      });

      if (res.total > 100000) {
        total.value = res.total / 10000;
        moneyUnit.value = "万元";
      } else {
        total.value = res.total;
        moneyUnit.value = "元";
      }
    };

    onMounted(() => {
      paymentProportion();
    });

    return () => (
      <SubPanelTemplate title="支付方式占比" v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={pay.value} onSearch={paymentProportion} />
        )
      }}>
        <OperateDays
          style={{ marginTop: "10px" }}
          value={total.value}
          title="实收总金额"
          unit={moneyUnit.value}
          decimals={2}
        ></OperateDays>
        <div class={styles.equipmentAlarm}>
          <RoundPie data={roundPieData.arr}>
            <div>
              <img
                width="25"
                height="25"
                src={getAssetsImage("money1.png")}
                alt=""
              />
            </div>
          </RoundPie>
          <PieList roundPieData={roundPieData.arr}></PieList>
        </div>
      </SubPanelTemplate>
    );
  },
});
