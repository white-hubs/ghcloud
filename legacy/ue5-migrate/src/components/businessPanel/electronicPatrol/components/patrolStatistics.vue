<template>
  <SubPanelTemplate title="今日巡更统计">
    <div class="environment-box">
      <div class="environment-item" v-for="item in transactionList">
        <div class="environment-item-title">{{ item.label }}</div>
        <div class="environment-item-box">
          <div class="environment-item-value">{{ item.value ||0 }}</div>
          <div class="environment-item-unit">{{ item.unit }}</div>
        </div>
      </div>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { patrolTodayStatistics} from '@/api/door';

const transactionList = ref([
  {
    label:'巡更人员',
    value:'0',
    unit:'名',
    flag:'personNum'
  },
  {
    label:'巡更点位',
    value:'0',
    unit:'个',
    flag:'pointNum'
  },
  {
    label:'巡更实时耗时',
    value:'0',
    unit:'小时',
    flag:'elapsedTime'
  },
])
const getPatrolTodayStatistics = async () => {
  const res = await patrolTodayStatistics({type:'TODAY'})
  transactionList.value = transactionList.value.map((e)=>{
    return {
      ...e,
      value:res[e.flag]
    }
  })
}
onMounted(()=>{
  getPatrolTodayStatistics()
})
</script>
<style lang="less" scoped>
.environment-box {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;

  .environment-item {
    background: rgba(142, 172, 206, 0.1);
    padding: 4px;
    padding: 10px 10px;

    .environment-item-title {
      font-size: 16px;
      color: #fff;
    }

    .environment-item-box {
      display: flex;

      .environment-item-value,
      .environment-item-unit {
        color: #fff;
        margin: auto;
        font-size: 14px;
      }

      .environment-item-unit {
        color: #fff;
        margin: auto;
        font-size: 18px;
      }
    }
  }
}
</style>