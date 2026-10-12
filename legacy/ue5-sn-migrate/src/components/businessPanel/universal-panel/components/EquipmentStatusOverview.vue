<template>
      <SubPanelTemplate :title="title">
      <OperateDays title="设备总数" :value="deviceTotal">
      </OperateDays>
      <GridContainer :data="deviceStatistic" class="body-bum"></GridContainer>
      <div class="chart">
        <pieGuidance :chartPosition="'0'" :height="'180px'" :y-data="yData"></pieGuidance>
      </div>
    </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import useCommon from '@/components/hooks/useCommon'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import GridContainer from "../../public/gridContainer.vue";
import pieGuidance from "../../public/charts/pie/pie-guidance.vue"
interface Props {
  title: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: '设备状态总览',
});
const deviceTotal = ref(0);
const deviceStatistic = ref([]);
const deviceStatusType = {
    ALARM: "报警",
    TROUBLE: "故障",
    OFFLINE: "离线",
    NORMAL: "正常",
}
const colorList = [
  "#2F8DFF",
  "#19F8F7",
  "#7786a3",
  "#FFAB10",
]
const yData = ref([
    { name: '正常', value: 0, itemStyle: { color: "#2F8DFF" } },
    { name: '离线', value: 0, itemStyle: { color: "#2AE8BD" } },
    { name: '故障', value: 0, itemStyle: { color:  "#7786a3" } },
    { name: '告警', value: 0, itemStyle: { color: "#f7c741" } },
])
const { getEquipmentNumber } = useCommon()
const getEquipmentInfo = async () => {
    yData.value.length = 0
    let res:any = await getEquipmentNumber()
    if (!res.deviceNum) {
        return
    }
    deviceTotal.value=res.deviceNum
    deviceStatistic.value.length = 0
    res.deviceStatusNums.forEach((item, index) => {
        yData.value.push({
            name: deviceStatusType[item.name],
            value: item.num,
            itemStyle:{color:colorList[index]} 
        })
        deviceStatistic.value.push({
            alarmStatusName: deviceStatusType[item.name],
            color: colorList[index],
            alarmNum: item.num,
        })

    })
}
onMounted(()=>{
  getEquipmentInfo()
})
</script>
<style lang="less" scoped>
.chart{
  height: 260px;
}
</style>