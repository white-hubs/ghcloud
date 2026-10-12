<template>
  <div class="panel overview-left">
    <SubPanelTemplate :title="props.title" class="device-count">
      <DeviceStatistics @handelClickItemize="handelClickItemize" imgPath="business-icon/triage-queue/6.png"
        :statistic="deviceStatisticsData"></DeviceStatistics>
      <div class="device-count-chart">
        <elevator-analysis-pie @clickbar="handelClickDeviceItemize" style="width: 50%; height: 1.0416rem" :radius="'75'"
          :pieData="pieData">
          <div style="color: #fff; text-align: center; font-size: 0.072rem">{{ deviceStatisticsData.total }}</div>
          <div style="color: #fff; text-align: center; font-size: 0.072rem">设备总数</div>
        </elevator-analysis-pie>
        <elevatorAnalysisList :contentList="pieData" style="width: 50%;"
          @handlecurrent="handelClickDeviceItemize">
        </elevatorAnalysisList>
      </div>
    </SubPanelTemplate>
  </div>
  <modal-equipment-table :show-modal="deviceModalShow" @close="closeModal" :parameter="deviceParameter">
  </modal-equipment-table>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DeviceStatistics from "../components/device-statistics.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue";
import modalEquipmentTable from "@/components/modal-table/modal-equipmentAll-table.vue";
import { applicationCode } from "@/api/saftsecurity/overview";
import { cubeDeviceCenterService } from '@/api/service'

const props = withDefaults(defineProps<{
  title?: string;
}>(), {
  title: '设备统计'
})
const pieData = ref([]);
const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
const deviceStatisticsData = reactive({
  title: "设备总数",
  total: 0,
  itemize: [
    {
      label: "在线设备数",
      value: 0,
      color: '#2AE8BD'
    },
    {
      label: "离线设备数",
      value: 0,
      color: '#FFAB10'
    },
  ],
});

// 设备统计
const getDeviceStatic = async () => {
  const res = await cubeDeviceCenterService.deviceTagStatusCount(
    {tagCodes:[...applicationCode.keys()]}
  );
  deviceStatisticsData.total = res.totalNumber;
  deviceStatisticsData.itemize[0].value = res.normalNumber
  deviceStatisticsData.itemize[1].value = res.offlineNumber
  const data = await cubeDeviceCenterService.deviceTagPercentage(
    [...applicationCode.keys()]
  );
  if(Array.isArray(data)) {
    pieData.value = data.map((res, index) => {
      return {
        name: applicationCode.get(res.tagCode) || '其他',
        value: res.percentage,
        color: colors[index % colors.length],
        tagCode:res.tagCode
      };
    });
  }
};

const deviceModalShow = ref<boolean>(false);
const deviceParameter = ref<Record<string, any>>({
  deviceState: "",
  tagCodes: [],
  areaId:undefined,
  filterTagCodes:[]
});
const handelClickDeviceItemize = (item?: any) => {
  if (item.name === '其他') {
    deviceParameter.value.tagCodes = []
    deviceParameter.value.filterTagCodes = pieData.value.map(res => {
    if(res.tagCode!== "other")
      return res.tagCode
    })
  }else{
    deviceParameter.value.tagCodes = [item?.tagCode]
    deviceParameter.value.filterTagCodes = []
  }
    deviceParameter.value.deviceState = undefined
  if(item.data){
   deviceParameter.value.tagCodes = [item.data.originData.tagCode]
  }
  deviceModalShow.value = true;
};
const handelClickItemize = (value)=>{
  if (value.label === '在线设备数') {
    deviceParameter.value.deviceState = true
  }else if(value.label === '离线设备数'){
    deviceParameter.value.deviceState = false
  }else{
    deviceParameter.value.deviceState = undefined
  }
  deviceParameter.value.tagCodes = [...applicationCode.keys()]
  deviceModalShow.value = true;
}
const closeModal = () => {
  deviceModalShow.value = false;
};

const init = () => {
  getDeviceStatic()
};
onMounted(() => {
  init()
});
</script>
<style lang="less" scoped>
@import url("./device.less");

</style>
