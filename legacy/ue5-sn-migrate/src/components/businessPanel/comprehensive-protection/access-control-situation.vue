<template>
  <SubPanelTemplate title="门禁通行情况">
    <template #extra>
      <DateInlineForm v-model:modelValue="trendTime" @search="getTemplateData"></DateInlineForm>
    </template>
    <DisplayPanel @itemClick="itemClick" :bg-img="'overView47.png'" :content-list="listData"></DisplayPanel>
  </SubPanelTemplate>
  <trafficRecordsModal :params="trafficParams" :showModal="showModal" @close="showModal = false"></trafficRecordsModal>

</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import DisplayPanel from "@/components/businessPanel/public/display-panel.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import {trafficAnalysis} from "@/utils/requestData/accessControl";
import trafficRecordsModal from "@/components/businessPanel/convenient-access/trafficRecords-modal.vue";

const trendTime = ref<ModelValueItf>({ timeType: 'TODAY', dateRange: [] });
const showModal = ref(false);
const listData = ref([
  {
    name: "通行总数（次）",
    value: 0,
  },
  {
    name: "异常通行（次）",
    value: 0,
  },
  {
    name: "正常通行（次）",
    value: 0,
  }
]);
const trafficParams = reactive({
  date:[],
  eventResult:''
})
const getTemplateData = async () => {
  let res = await trafficAnalysis(trendTime.value.timeType);
  listData.value[0].value = res.total;
  listData.value[1].value = res.arr[1].value;
  listData.value[2].value = res.arr[0].value;
}
const itemClick = (value) => {
  if (value.name === '通行总数（次）') {
    trafficParams.eventResult = ''
  }else if (value.name === '异常通行（次）') {
    trafficParams.eventResult = 'DO_REFUSE'
  }else{
    trafficParams.eventResult = 'DO_PASS'
  }
  trafficParams.date = trendTime.value.dateRange
  showModal.value = true;
}
</script>
<style scoped lang="less">
:deep(.showPanel) {
  height: 220px;
  margin: 10px 0;
}
</style>