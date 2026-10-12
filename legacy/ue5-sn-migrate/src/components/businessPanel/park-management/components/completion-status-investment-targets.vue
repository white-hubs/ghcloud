<template>
    <SubPanelTemplate :title="title">
      <template #extra>
        <DateInlineForm :timeList="timeList" v-model:modelValue="through" @search="changeDate"></DateInlineForm>
      </template>
      <displayPanel
        :bg-img="'overView16.png'"
        :content-list="contentList"
        :showimg="false"
      ></displayPanel>
    </SubPanelTemplate>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import displayPanel from "@/components/businessPanel/public/display-panelsafty.vue";
import { onMounted, reactive, ref } from "vue";
import { investmentPlanPage } from '@/api/youxianqu-park'
import dayjs from "dayjs";

const props = withDefaults(defineProps<{
  title?: string;
}>(), {
  title: '招商目标完成情况'
})
const through = ref({
    timeType: "THIS_YEAR",
    dateRange: ["", ""],
})
const contentList = ref([
  {
    name:'租赁完成',
    value:'0'
  },
  {
    name:'销售完成',
    value:'0'
  },
  {
    name:'购地完成',
    value:'0'
  },
]);
const timeList = ref([])

const changeDate = async () => {
  const purchase = await investmentPlanPage({targetType:'1',planMonth:through.value.timeType})
  const lease = await investmentPlanPage({targetType:'2',planMonth:through.value.timeType})
  const sale = await investmentPlanPage({targetType:'3',planMonth:through.value.timeType})
  contentList.value[0].value = lease.total
  contentList.value[1].value = sale.total
  contentList.value[2].value = purchase.total
};
onMounted(() => {
  const now = new Date();
  const year = now.getFullYear(); // 获取当前年份
  const month = now.getMonth() + 1; // 获取当前月份（注意：月份从0开始，所以要加1）
  for (let index = 1; index < month+1; index++) {
    timeList.value.push({
      label: `${index}月`, value: dayjs(`${year}-${index}`).format("YYYY-MM") 
    })
  }
  through.value.timeType = dayjs(now).format("YYYY-MM") 
});
</script>
<style lang="less" scoped>
.panel {
  .chart {
    height: 220px;
  }
}
.trafficBox {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 12px;
}

.parkingLot {
  display: flex;
  justify-content: space-around;
  margin-top: 30px;
}

.backgroundBox {
  width: 86px;
  height: 86px;
  background: rgba(41, 137, 255, 0.302);
  box-shadow: inset 0px 0px 10px 0px rgba(41, 137, 255, 0.6),
    inset 0px 0px 6px 0px rgba(41, 137, 255, 0.8);
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  transform: translate(-50%, -50%);

  img {
    width: 36px;
    height: 28px;
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
}
.barChart {
  height: 200px;
}
</style>
