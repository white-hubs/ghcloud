<template>
  <div >
    <SubPanelTemplate :title="props.title">
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
import { onMounted, reactive, ref } from "vue";
import { environmentalStatUePm } from "@/api/securitymanagement";
const props = withDefaults(defineProps<{
  title?: string;
}>(), {
  title: 'PM2.5监测概览'
})
const contentList = ref([
  {
    name: "PM2.5实时数据",
    value: '',
  },
  {
    name: "当前PM2.5平均值",
    value: '20μg/m³',
  },
  {
    name: "当前空气质量等级",
    value: '优',
  }
]);

const changeDate = async () => {
 const res = await environmentalStatUePm()
 contentList.value[0].value = res.max||'0' + 'μg/m³'
 contentList.value[1].value = res.avg||'0' + 'μg/m³'
 contentList.value[2].value = res.quality
};
onMounted(()=>{
  changeDate();
})
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
