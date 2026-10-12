<template>
  <SubPanelTemplate title="管理态势">
    <template #extra>
      <DateInlineForm v-model:modelValue="workOrderTime" @search="changeHandleworkOrderTime"></DateInlineForm>
    </template>
    <div class="risk">
      <div v-for="item in riskPieData" :key="item.name">
        <div>
          <div>{{item.name}}(个)</div>
          <div style="font-size:18px">{{item.value}}</div>
        </div>
      </div>

    </div>
    <div class="flex-between">
      <PlanPie :pieData="riskPieData" class="device-total-pie" pie-class="device-total-pie-chart">
        <div class="content">
          <div class="total-num">{{ riskData.totalNum }}</div>
          <div>设备总数</div>
        </div>
      </PlanPie>
      <PieList :roundPieData="riskPieData" @handel-click-itemize="handelClickDeviceItemize"
        class="device-total-list"></PieList>
    </div>
    <modal-broadcast-table :show-modal="ModalShow" :parameter="Parameter"
      @close="ModalShow=false"></modal-broadcast-table>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import SubPanelTemplate from "../../../public/subPanelTemplate.vue";
import DateInlineForm from "../../../public/dateInlineForm.vue";
import PlanPie from "../../../public/charts/pie/planePie.vue";
import PieList from "../../../public/pieList.vue";
import modalBroadcastTable from '../../component/modal-broadcast-table.vue';
import { getRiskSource } from '@/api/attendance';
import { ModelValueItf } from "../../../public/types";

interface Itemize {
  color: string;
  value: number;
  label: string;
  ratio: number;
  name: string;
  typeId?: string;
}

const workOrderTime = ref<ModelValueItf>();
const riskPieData = ref<Itemize[]>([]);
const ModalShow = ref(false);
const Parameter = ref({
  typeId: ''
});
const riskData = reactive<{
  totalNum: number
}>({
  totalNum: 0
});
const deviceSituationColors = ref<string[]>(["#FFAB10", "#2F8DFF", "#F14545", "#19F8F7"]);

const handelClickDeviceItemize = (value: any) => {
  Parameter.value.typeId = value.typeId;
  ModalShow.value = true;
};

const getRisk = async () => {
  if (!workOrderTime.value) return;
  const res = await getRiskSource({
    period: workOrderTime.value.dateRange.join(","),
    dimension: '',
    eventResult: '',
    typeNames: []
  });
  riskPieData.value = res.typeVOList.map((item: any, index: number) => {
    return {
      label: `${item.typeName}(${item.ratio * 100}%)`,
      value: item.totalNum,
      ratio: item.totalNum,
      color: deviceSituationColors.value[index % 4],
      name: item.typeName,
      typeId: item.typeId
    };
  });
  Object.assign(riskData, res);
};

const changeHandleworkOrderTime = () => {
  getRisk();
};
</script>

<style lang="less" scoped>
.device-total-pie,
.device-total-list,
.device-total-pie-chart {
  height: 140px !important;
}

.device-total-list {
  margin-top: 20px;
}

:deep(.device-total-pie-chart) {
  height: 140px !important;
}

.content {
  text-align: center;
  color: #fff;
  font-size: 14px;

  .total-num {
    font-size: 16px;
  }
}

.risk {
  display: flex;
  justify-content: space-between;
}
</style>
