
import { defineComponent, onMounted, reactive, ref } from "vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import ChargingModule from "@/components/businessPanel/public/chargingModule.vue";
import styles from "./parking-car-charge.module.less";
import { chargingOverview } from "@/utils/requestData/parkingSpaceManage";

export const ParkingCarCharge = defineComponent({
  name: "ParkingCarCharge",
  setup() {
    const collectFees = ref();

    const collectFeesList = reactive({
      arr: [],
    });

    const getChargingOverviewInfo = async () => {
      collectFeesList.arr = await chargingOverview({ dimension: collectFees.value.timeType });
    };

    onMounted(() => {
      getChargingOverviewInfo();
    });

    return () => (
      <SubPanelTemplate title="收费总览" v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={collectFees.value} onSearch={getChargingOverviewInfo} />
        )
      }}>
        <div class={styles.chargingModuleBox} style={{ minHeight: "150px" }}>
          {collectFeesList.arr.map((item, index) => (
            <ChargingModule
              collectFeesData={item}
              key={index}
            ></ChargingModule>
          ))}
        </div>
      </SubPanelTemplate>
    );
  },
});
