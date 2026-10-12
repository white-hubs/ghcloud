<template>
  <SubPanelTemplate :title="props.title">
    <LightingRound @handel-click-itemize="handelClickWork" class="LightingBox" :data="roundData"></LightingRound>
  </SubPanelTemplate>
  <modal-work-table :show-modal="workModalShow" @close="closeModal" :parameter="workParameter"></modal-work-table>
  <modal-user-table :show-modal="userModalShow" @close="closeModal" :parameter="userParameter"></modal-user-table>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import LightingRound from "../components/lighting-round.vue";
import modalWorkTable from "../components/modal-work-table.vue";
import modalUserTable from "../components/modal-user-table.vue";
import { workOrderCompletionStatistics } from '@/api/flow'
import { arrangeTodayStat } from "@/api/attendance";
const props = withDefaults(defineProps<{
  title?: string;
}>(), {
  title: '管理态势分析'
})
const workModalShow = ref<boolean>(false);
const userModalShow = ref<boolean>(false);
// 风险源分析
const roundData = reactive([
    {
        statistic: { title: '完成率', value: '0', unit: '%' },
        legendList: [
            { name: '未完成工单数(个)', color: '#FFAB10', value: 0,type:'flow-order',key:'ACTIVE' },
            { name: '已完成工单数(个)', color: '#2AE8BD', value: 0,type:'flow-order',key:'FINISHED' }
        ],
    },
    {
        statistic: { title: '在岗率', value: '0', unit: '%' },
        legendList: [
            { name: '在岗员工数(个)', color: '#2989FF', value: 0 ,type:'staff',key:'WORKING'},
            { name: '离岗员工数(个)', color: '#FFAB10', value: 0 ,type:'staff',key:'LEAVE_POST'}
        ],
        key:'staff'
    },
])
// 工单统计
const getWorkNumber = async () => {
    const res = await workOrderCompletionStatistics({appCodes:['ATTENDANCE_MANAGEMENT','PERSONNELMANAGEMENT','OFFICIAL_MANAGEMENT','HIDDENDANGER','FAULT'].join(",")})
    const orderFinished=res.find(e=>e.result==="FINISHED").number
    const orderUnFinished=res.find(e=>e.result==="UNFINISHED").number
    roundData[0].statistic.value = orderFinished+orderUnFinished?((orderFinished/(orderFinished+orderUnFinished)) * 100).toFixed(0)+'%':'0%'
    roundData[0].legendList[0].value = orderUnFinished
    roundData[0].legendList[1].value = orderFinished

    const req = await arrangeTodayStat()
    roundData[1].statistic.value = req.totalCount?((req.workCount/(req.totalCount)) * 100).toFixed(0)+'%':'0%'
    roundData[1].legendList[0].value = req.workCount
    roundData[1].legendList[1].value = req.totalCount - req.workCount
}

const workParameter = ref<Record<string, any>>({
  status: "",
});
const userParameter = ref<Record<string, any>>({
  status: "",
});
const handelClickWork = (item?: any) => {
  workModalShow.value = false;
  userModalShow.value = false;
  userParameter.value={}
  workParameter.value={}
  if(item.type==="staff"){
    userParameter.value={workBool:item.name==='在岗员工数（个）'?true:false}
    userModalShow.value = true;
  }
  if(item.type==="flow-order"){
    workParameter.value={status:item.key}
    workModalShow.value = true;
  }
};
const closeModal = () => {
  workModalShow.value = false;
  userModalShow.value = false;
};
const init = () => {
  getWorkNumber()
};
onMounted(() => {
  init()
});
</script>
<style scoped lang="less">
.monitorPanelBox {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  align-items: center;
  .alarm-analysis{
    height: auto;
  }
}

.chart {
  height: 220px;
}

:deep(.LightingBox) {
  &.round-wrap .monitorBox {
    flex-direction: column;
    width: calc(var(--font-size-scale) * 90px);
  }

  .monitor .monitorBox .monitorValue {
    font-size: 16px;
    font-family: D-DIN, D-DIN;
    font-weight: 700;
  }

  .monitor .monitorBox .monitorList .monitorColor {
    display: none !important;
  }

  .monitor {
    width: calc(var(--font-size-scale) * 180px) !important;
    justify-content: space-between;
    margin-top: 15px;
  }

  .info {
    position: relative;
    justify-content: space-around;
    flex-direction: row;

    &::after {
      content: '';
      display: inline-block;
      height: 1px;
      border-top: 1px solid rgba(255, 255, 255, 0.3);
      position: absolute;
      width: 200px;
      top: 92px;
      left: 121px;
    }

    &::before {
      content: '';
      display: inline-block;
      height: 1px;
      border-top: 1px solid rgba(255, 255, 255, 0.3);
      position: absolute;
      top: 80px;
      left: 90px;
      width: 35px;
      transform: rotateZ(40deg);
    }
  }

  .roate {
    width: 67px !important;
    height: 67px !important;
  }

  .r1 {
    width: 90px !important;
    height: 90px !important;
  }

  .r2 {
    width: 80px !important;
    height: 80px !important;
  }

  .r3 {
    width: 80px !important;
    height: 80px !important;
    border-radius: 100%;
  }

  .item {
    height: 110px !important;
  }

  .icon {
    width: 30px !important;
    height: 30px !important;
  }
}
</style>
