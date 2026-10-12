<template>
  <SubPanelTemplate title="资产利用率统计分析" class="visiting-data">
    <template #extra>
      <DateInlineForm v-model:modelValue="trendTime" @search="getTemplateData"></DateInlineForm>
    </template>
    <div class="equipmentAlarm">
        <RoundPie :data="roundPieData" :eventNum="eventNum">
        </RoundPie>
        <pieList :roundPieData="roundPieData"></pieList>
      </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from '../public/types'
import RoundPie from "@/components/businessPanel/public/charts/roundPie/roundPie.vue";
import pieList from "@/components/businessPanel/public/pieList.vue";
import { getPropertyByType } from '@/api/property'

const trendTime = ref<ModelValueItf>({ timeType: 'TODAY', dateRange: [] });
const roundPieData = ref([]);
const eventNum = ref<number>(0);
const getTemplateData = async () => {
  const res = await getPropertyByType({period: trendTime.value.dateRange.join(",")})
  const colors = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A"];
  roundPieData.value = res.map((e,i)=>{
    return {
      label: e.name,
      value: e.value,
      color: colors[i]
    }
  })
}
</script>
<style lang="less" scoped>
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;
  .content {
    font-size: 12px;
  }
  :deep(.pie-box){
    width: 200px;
  }
}
</style>