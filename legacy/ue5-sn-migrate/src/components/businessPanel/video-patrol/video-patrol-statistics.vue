<template>
  <SubPanelTemplate title="视频巡逻统计" >
    <displayPanel
      :bg-img="'overView16.png'"
      :content-list="contentList"
      :showimg="false"
    ></displayPanel>
  </SubPanelTemplate>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import displayPanel from "@/components/businessPanel/public/display-panelsafty.vue";
import { onMounted, reactive, ref } from "vue";
import { cameraPatrolStatistics } from '@/api/vmonitor'
import { ModelValueItf } from '../public/types'

const props = withDefaults(defineProps<{
title?: string;
}>(), {
title: '视频巡逻统计'
})
const alarmTypeTime = ref<ModelValueItf>();
const contentList = ref([
{
  name:'巡逻路线',
  value:'0'
},
{
  name:'监控点位',
  value:'0'
},
{
  name:'巡逻人员',
  value:'0'
},
]);

const changeDate = async () => {
  const res = await cameraPatrolStatistics()
  contentList.value[0].value = String(res.patrolLineCount) 
  contentList.value[1].value = String(res.patrolCameraCount)
  contentList.value[2].value = String(res.patrolUserCount)
};
onMounted(() => {
  changeDate()
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
