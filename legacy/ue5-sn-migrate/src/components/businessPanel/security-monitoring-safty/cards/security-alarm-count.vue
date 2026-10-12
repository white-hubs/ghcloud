<template>
  <div class="panel">
    <SubPanelTemplate :title="props.title">
      <template #extra>
        <DateInlineForm
          v-model:modelValue="alarmtimeType"
          @search="changeDate"
        ></DateInlineForm>
      </template>
      <displayPanel
        :bg-img="'overView16.png'"
        :content-list="contentList"
        :showimg="false"
      ></displayPanel>
    </SubPanelTemplate>
  </div>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import displayPanel from "@/components/businessPanel/public/display-panelsafty.vue";
import { reactive, ref } from "vue";
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";
import { statisticsSituation } from '@/api/alarm'

const props = withDefaults(defineProps<{
  title?: string;
}>(), {
  title: '报警情况统计'
})
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const contentList = ref([
  {
    name: "报警超时率",
    value: 0,
  },
  {
    name: "报警正确率",
    value: 0,
  },
  {
    name: "监控报警占比",
    value: 0,
  },
  {
    name: "报警响应率",
    value: 0,
  },
  {
    name: "报警处理率",
    value: 0,
  },
]);
let alarmtimeType = ref({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const parameter = reactive({
  alarmEventTypeId:'',
  dateRange:[],
})
const changeDate = async () => {
  const data = await statisticsSituation({
    areaId: piniaStoreArea.currentAreaId,
    period: alarmtimeType.value.dateRange.join(","),
    sceneType: piniaStoreMenu.currentMenu,
  });
  
  contentList.value[0].value =Number(data.timeoutRatio);
  contentList.value[1].value =Number(data.actualRatio);
  contentList.value[2].value =Number(data.ratio);
  contentList.value[3].value =Number(data.confirmedRatio);
  contentList.value[4].value =Number(data.handlerRatio);
};
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
