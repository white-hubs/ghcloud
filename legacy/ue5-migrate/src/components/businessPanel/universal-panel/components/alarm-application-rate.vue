<template>
    <SubPanelTemplate :title="title">
      <template #extra>
        <DateInlineForm v-model:modelValue="alarmTime" @search="changeAlarmTime"></DateInlineForm>
      </template>
      <div class="flex-between" style="margin-top: 10px;">
        <PlanPie :pieData="monitorSituationPieData">
          <div class="content">
            <div class="total-num">{{ alarmTotal }}</div>
            <div>报警总数</div>
          </div>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
        </PlanPie>
        <PieList class="my-pieList" :roundPieData="monitorSituationPieData" @handelClickItemize="handelClick"></PieList>
      </div>
    </SubPanelTemplate>
    <modal-alarm-table v-if="alarmModalShow" :show-modal="alarmModalShow" @close="closeModal" :parameter="alarmParameter"></modal-alarm-table>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted, computed} from 'vue'
import { ModelValueItf } from '../../public/types'
import { equipmentNumber } from '@/utils/requestData/alarm'
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import PlanPie from "../../public/charts/pie/planePie.vue";
import PieList from "../../public/pieList.vue";
import { useStateStore } from '@/pages/state/use-state-store';
import { cubeAlarmStatService } from '@/api/service'
import modalAlarmTable from "@/components/modal-table/modal-alarm-tableNew.vue";

const { globalState } = useStateStore()

interface Props {
  title: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: '报警占比',
});
const alarmModalShow = ref<boolean>(false);
const alarmParameter = ref({});
const closeModal = () => {
  alarmModalShow.value = false;
};
const handelClick = (item) => {
  alarmParameter.value = {
    applicationCode: item?.code || item?.applicationCode,
    dateRange: alarmTime.value?.dateRange,
  }
  alarmModalShow.value = true
}

const alarmTime = ref<ModelValueItf>()
const monitorSituationPieData = ref([]);
const alarmTotal = computed(() => {
  return monitorSituationPieData.value.reduce((pre, cur) => {
    return pre + cur.value;
  }, 0);
});
const colors = ["#29C2FF", "#74AEE7", "#FFC700", '#00F27B', "#328BF7", "#EF424A", "#6EE3E1"];
const changeAlarmTime = async()=>{
  let param = {
    period: alarmTime.value.dateRange.join(","),
    type: alarmTime.value.timeType,
  };
  let data = await cubeAlarmStatService.alarmApplicationStatGroup(param);
  const total = data.reduce((sum, item) => sum + item.alarmNum, 0);
  monitorSituationPieData.value = data.map((item, index) =>{
    return {
      label: item.applicationName,
      value: item.alarmNum,
      code: item.applicationCode,
      unit: "个",
      ratio: total > 0 ? `${((item.alarmNum / total) * 100).toFixed(2)}%` : 0,
      color: colors[index % colors.length]
    }
  })
}
</script>
<style lang="less" scoped>
.content {
  text-align: center;
  color: #fff;
  font-size: 14px;

  .total-num {
    font-size: 16px;
  }
}
.extra {
  margin-left: 16px;
  font-size: 12px;
  font-weight: 400;
  font-family: Roboto-Regular, Roboto;

  .mode {
    color: #e7f0ff;
  }

  .downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    margin: 0 3px;
    transform: rotate(180deg);
  }

  .uptriangle {
    border-bottom: 8px solid #ffcece;
    transform: rotate(0deg);
  }

  .down {
    color: #2ae8bd;
    font-family: Roboto-Regular, Roboto;
  }

  .up {
    color: #f14545;
    font-family: Roboto-Regular, Roboto;
  }
}
.my-pieList {
  height: 200px;
  padding-top: 40px;
  padding-bottom: 10px;
}
</style>