<template>
  <SubPanelTemplate title="人均消费金额统计">
    <template #extra>
      <DateInlineForm v-model:modelValue="workOrderTime" @search="changeHandleworkOrderTime"></DateInlineForm>
    </template>
    <div class="data-stat" v-if="state.listData.length > 0">
      <DisplayPanel :bg-img="'overView47.png'" :content-list="state.listData"></DisplayPanel>
    </div>
    <div class="data-stat" v-else style="min-height: 150px">
      <noData />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DisplayPanel from "@/components/businessPanel/public/display-panel.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import { canteenConsumptionAmount, canteenConsumptionPersonCount } from "@/api/onecard";
import DateInlineForm, { ModelValueItf } from "@/components/businessPanel/public/dateInlineForm.vue";

interface ListItem { 
  name: string; 
  value: number; 
  color?: string
 }
const state = reactive<{
  listData: ListItem[]
}>({
  listData: [],
})

const workOrderTime = ref<ModelValueItf>({
  timeType: "TODAY",
  dateRange: []
});

const changeHandleworkOrderTime = async () => {
  try {
    const [amountRes, personRes] = await Promise.all([
      canteenConsumptionAmount({ period: workOrderTime.value.dateRange.join(","), type: workOrderTime.value.timeType }),
      canteenConsumptionPersonCount({ period: workOrderTime.value.dateRange.join(","), type: workOrderTime.value.timeType })
    ]);

    let amount = 0;
    let personCount = 0;

    if (typeof amountRes === 'number') {
      amount = amountRes;
    } else if (amountRes && typeof amountRes.amount === 'number') {
      amount = amountRes.amount;
    } else if (amountRes && typeof amountRes.data === 'number') {
      amount = amountRes.data;
    }

    if (typeof personRes === 'number') {
      personCount = personRes;
    } else if (personRes && typeof personRes.count === 'number') {
      personCount = personRes.count;
    } else if (personRes && typeof personRes.data === 'number') {
      personCount = personRes.data;
    }

    const perCapita = personCount > 0 ? (amount / personCount) : 0;

    state.listData = [
      {
        name: '消费金额',
        value: Number(amount.toFixed(2)),
      },
      {
        name: '消费人数',
        value: personCount,
      },
      {
        name: '人均消费金额',
        value: Number(perCapita.toFixed(2)),
      }
    ];

  } catch (error) {
    state.listData = [];
  }
}

</script>
<style lang="less" scoped>
.data-stat {
  margin-top: 10px;
  padding: 24px 12px;
  height: 240px;
}
</style>