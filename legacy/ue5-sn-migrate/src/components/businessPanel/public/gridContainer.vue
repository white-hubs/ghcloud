<template>
  <div class="grid-container">
    <div class="grid-item" v-for="item in props.data" @click="handelClickDeviceNum(item)">
      <a-statistic :valueStyle="valueStyle(item.color)" :value="item.alarmNum">
        <template #title>
          <div class="title flex-start">
            <div class="box" :style="boxStyle(item.color)"></div>
            <span>{{ item.alarmStatusName }}</span>
          </div>
        </template>
      </a-statistic>
    </div>
  </div>
  <modal-alarm-table :alarmStatus="alarmParameter.alarmStatus" v-if="alarmModalShow" :show-modal="alarmModalShow" @close="closeModal" :parameter="parameter"></modal-alarm-table>
</template>
<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import modalAlarmTable from "@/components/modal-table/modal-alarm-tableNew.vue";

interface Props {
  alarmStatusName: string | number;
  alarmNum: number;
  alarmStatus?: string;
  color?: string;
}
const props =  withDefaults(defineProps<{
  data: Props[];
  parameter?: any;
}>(),{
  parameter: {}
});
const emits=defineEmits(['clickItem'])
const alarmModalShow = ref<boolean>(false);
const alarmParameter = ref<Record<string, any>>(props.parameter);

const valueStyle = computed(() => (color: string) => {
  return {
    fontSize: "18px",
    color: color,
    paddingLeft: "16px",
  };
});
const boxStyle = computed(() => (color: string) => {
  return {
    width: "4px",
    height: "4px",
    background: color,
  };
});
const columnNum = computed(() => {
  return props.data.length;
});
const handelClickDeviceNum = (item) => {
  const obj = {
    '待接收':'ALARM_UN_CONFIRMED',
    '处理中':'ALARM_PROGRESS_CONFIRMED',
    '已挂起':'ALARM_SUSPEND',
    '已处理':'ALARM_HANDLER',
  }
  alarmParameter.value = obj[item.alarmStatusName]?{alarmStatus:obj[item.alarmStatusName] }:{alarmStatus:false }
  if (alarmParameter.value.alarmStatus) {
    alarmModalShow.value = true
  }
  emits('clickItem',item) 
}
const closeModal = () => {
  alarmModalShow.value = false;
};
onMounted(() => {
  
})
</script>
<style lang="less" scoped>
.grid-container {
  display: grid;
  grid-column-gap: 10px;
  grid-template-columns: repeat(v-bind(columnNum), 1fr);
  .grid-item {
    background: rgba(0, 0, 0, 0.4);
    padding: 3px 8px;
    cursor: pointer;
    .title {
      font-size: 12px;
      color: #d0deee;
      .box {
        margin-right: 8px;
      }
    }

  }
}
</style>
