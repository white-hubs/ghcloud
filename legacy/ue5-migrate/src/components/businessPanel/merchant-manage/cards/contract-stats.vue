<template>
  <SubPanelTemplate title="商户合同统计">
    <template #extra>
      <DateInlineForm v-model:modelValue="proportionTime" @search="changeProportionTime"></DateInlineForm>
    </template>
    <div class="equipmentAlarm">
      <planPie :pie-data="roundPieData.arr">
        <div class="content">
          <div>合同总数</div>
          <div class="pie-center">{{ roundPieData.throughNum }}(个)</div>
        </div>
      </planPie>
      <pieList :roundPieData="roundPieData.arr"></pieList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import { visualizationContractCount } from "@/api/merchant";
import planPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import pieList from "@/components/businessPanel/public/pieList.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";

const colors = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A"];
const proportionTime = ref<ModelValueItf>({
  timeType: "TODAY",
  dateRange: [],
});
const roundPieData = reactive({
  arr: [] as any[],
  throughNum: 0,
});

const changeProportionTime = async () => {
  let res = await visualizationContractCount({ period: proportionTime.value.dateRange.join(",") });
  roundPieData.throughNum = 0;
  roundPieData.arr = res.map((item: any, index: number) => {
    roundPieData.throughNum += item.value;
    return {
      label: item.name,
      value: item.value,
      color: colors[index % colors.length],
    };
  });
};
</script>

<style lang="less" scoped>
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;

  :deep(.policeList) {
    height: auto;
  }

  .content {
    font-size: 12px;
    color: #fff;
    text-align: center;
  }

  .pie-center {
    font-size: 16px;
    font-weight: bold;
  }
}
</style>
