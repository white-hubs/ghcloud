<template>
  <SubPanelTemplate title="事件报警统计" image="bj.png" class="gz">
    <template #extra>
      <DateInlineForm v-model:modelValue="safetyWorkTime" @search="changeWorkOrderTime" menuPage="electrical" />
    </template>
    <NumberStatistics :data="safetyWorkData" @click="handleClick" />

  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../../common/snPanelTemplate.vue";
import DateInlineForm from "../../common/dateInlineForm.vue";
import { ModelValueItf } from "../../../businessPanel/public/types";
import NumberStatistics from "../../common/number-statistics.vue";
import { alarmEventRatio } from '@/api/shennong/alarm'
import { storeMarket } from "@/piniaStore/other";

const props = withDefaults(
  defineProps<{
    applicationCode: string;
  }>(),
  {
    applicationCode: "ELECTRICMANAGE",
  }
);
const emit = defineEmits(["click"]);
const piniaStoreMarket = storeMarket();
const safetyWorkTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const safetyWorkData = reactive([
  {
    name: '过压报警',
    value: 0,
    sign:'electricEvent_gybj',
    unit: '个',
    icon: "alarm_overvoltage.png",
  },
  {
    name: '过流报警',
    value: 0,
    sign:'electricEvent_glbj',
    unit: '个',
    icon: "alarm_overcurrent.png",
  },
  {
    name: '欠压报警',
    value: 0,
    sign:'electricEvent_qybj',
    unit: '个',
    icon: "alarm_undervoltage.png",
  },
  {
    name: '过温报警',
    value: 0,
    sign:'electricEvent_gwbj',
    unit: '个',
    icon: "alarm_overtemperature.png",
  },
  {
    name: '漏电报警',
    value: 0,
    sign:'electricEvent_ldbj',
    unit: '个',
    icon: "alarm_leakageelectricity.png",
  },
]);
const changeWorkOrderTime = async ()=>{
  let param = {
    period: safetyWorkTime.value.dateRange.join(","),
    type: safetyWorkTime.value.timeType,
    marketTenant: '',
    applicationCode: props.applicationCode,
  };
  let res: any = await alarmEventRatio(param);
  safetyWorkData.forEach(aItem => {
  aItem.value = 0; 
  res.forEach(bItem => {
    if (bItem.id.includes(aItem.sign)) {
      aItem.value += bItem.totalNum;
    }
  });
});

}
const handleClick = (item) => {
  emit('click',{
    ...item,
    ...safetyWorkTime.value
  })
}
</script>
<style lang="less" scoped></style>