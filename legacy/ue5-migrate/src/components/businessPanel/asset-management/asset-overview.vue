<template>
   <SubPanelTemplate title="资产概览" class="visiting-data">
    <template #extra>
      <DateInlineForm v-model:modelValue="trendTime" @search="getTemplateData"></DateInlineForm>
    </template>
    <div class="item" v-for="item in visitingData" :key="item.title">
      <a-statistic :title="item.title">
        <template #formatter>
          <count-to :startVal="0" :endVal="item.value" :duration="2000" separator=""></count-to>
        </template>
      </a-statistic>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from '../public/types'
import { overdue } from '@/api/property'

const trendTime = ref<ModelValueItf>({ timeType: 'TODAY', dateRange: [] });
const visitingData = ref([
    { title: "资产总数", value: 7800 },   
    { title: "资产总金额", value: 4500 },   
    { title: "报修资产数", value: 1500 },      
    { title: "报废资产数", value: 800},    
    { title: "逾龄资产数", value: 800},    
    { title: "到期资产数", value: 800},    
]);
const getTemplateData = async () => {
  const res = await overdue({period: trendTime.value.dateRange.join(",")})
  visitingData.value[0].value = res.propertyNumber ?? 0
  visitingData.value[1].value = res.repairReportNumber ?? 0
  visitingData.value[2].value = res.weedOutNumber ?? 0
  visitingData.value[3].value = res.usageNumber ?? 0
  visitingData.value[4].value = res.maintenanceNumber ?? 0
}
</script>
<style lang="less" scoped>
.visiting-data {
  :deep(.sub-panel-content) {
    display: flex;
    flex-wrap: wrap;

    .item {
      height: 60px;
      width: 50%;
      margin: 5px 0;
      justify-content: center;
      box-sizing: border-box;

      .ant-statistic {
        display: inline-flex;
        flex-flow: column-reverse;

        .ant-statistic-content {
          height: 29px;
          .ant-statistic-content-value {
            color: #fff;
          }
        }

        .ant-statistic-title {
          color: #D0DEEE;
          font-size: 16px;
          font-weight: bold;
          margin: 0;
        }
      }
    }
  }

}
</style>