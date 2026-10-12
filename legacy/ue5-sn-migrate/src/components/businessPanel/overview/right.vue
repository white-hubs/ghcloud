<template>
  <div class="panel">
    <SubPanelTemplate title="监控态势">
      <div class="monitor-statistic">
        <SituationAnalysis imgPath="overView5.png" :statistic="monitorSituationAnalysis" @click-num="showDeviceTable">
        </SituationAnalysis>
        <div class="flex-between">
          <PlanPie :pieData="monitorSituationPieData">
            <div class="content">
              <div class="total-num">{{ monitorSituationAnalysis.total }}</div>
              <div>设备总数</div>
            </div>
          </PlanPie>
          <PieList :roundPieData="monitorSituationPieData" @handel-click-itemize="handleClickItemize"></PieList>
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="监控人员统计">
      <div class="person-statistic">
        <div class="total">
          <span>人员总数</span>
          <count-to :startVal="0" :endVal="personStatistic.total" :duration="4000" class="scroll-number"></count-to>
        </div>
        <div class="view-statistic flex-center">
          <div class="bg">
            <img :src="getAssetsImage('overView4.png')" />
            <img class="rotate" :src="getAssetsImage('overView13.png')" alt="" />
          </div>
          <div class="view-content view-left flex-center">
            <div class="icon">
              <img :src="getAssetsImage('overView9.png')" alt="" />
            </div>
            <div class="content">
              <count-to :startVal="0" :endVal="personStatistic.onDutyNum" :duration="4000"
                class="scroll-number"></count-to>
              <div class="title">在岗人员</div>
            </div>
          </div>
          <div class="view-content view-right flex-center">
            <div class="content">
              <count-to :startVal="0" :endVal="personStatistic.leaveNum" :duration="4000"
                class="scroll-number"></count-to>
              <div class="title">离岗人员</div>
            </div>
            <div class="icon">
              <img :src="getAssetsImage('overView11.png')" alt="" />
            </div>
          </div>
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="管理态势">
      <template #extra>
        <DateInlineForm v-model:modelValue="workOrderTime" @search="changeHandleworkOrderTime"></DateInlineForm>
      </template>
      <div class="risk">
        <div v-for="item in deviceSituationPieData">
          <div>
            <div>{{item.name}}(个)</div>
            <div style="font-size:18px">{{item.value}}</div>
          </div>
        </div>

      </div>
      <div class="flex-between">
        <PlanPie :pieData="deviceSituationPieData" class="device-total-pie" pie-class="device-total-pie-chart">
          <div class="content">
            <div class="total-num">{{ riskData.totalNum }}</div>
            <div>设备总数</div>
          </div>
        </PlanPie>
        <!-- @handel-click-itemize="handelClickDeviceItemize" -->
        <PieList :roundPieData="deviceSituationPieData" @handel-click-itemize="handelClickDeviceItemize"
          class="device-total-list"></PieList>
      </div>

    </SubPanelTemplate>
    <modal-equipment-table :show-modal="deviceModalShow" :parameter="deviceParameter"
      @close="closeModal"></modal-equipment-table>
    <modal-broadcast-table :show-modal="ModalShow" :parameter="Parameter"
      @close="ModalShow=false"></modal-broadcast-table>
  </div>
</template>
<script setup lang="ts">
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import SituationAnalysis from "./situation-analysis.vue";
import PlanPie from "../public/charts/pie/planePie.vue";
import PieList from "../public/pieList.vue";
import Radar from "../public/charts/radar/radar.vue";
import noData from "../public/noData.vue";
import { getAssetsImage } from "../../../utils/getImage";
import { CountTo } from "vue3-count-to";
import { ModelValueItf } from "../public/types";
import { onMounted, reactive, ref } from "vue";
import { getMonitorSituation } from "@/api/device";
import { getStateTotal } from "@/api/personnel";
import { getFlowNumberStatistic } from "@/api/flow";
import modalEquipmentTable from "@/components/modal-table/modal-equipment-table.vue";
import { arrangeTodayStat, getRiskSource } from '@/api/attendance'
import modalBroadcastTable from './component/modal-broadcast-table.vue'
interface Itemize {
  color: string;
  value: number;
  label: string;
  ratio: number;
  name:string
  // applicationCode: string;
}
const handleTime = ref<ModelValueItf>();
  const deviceSituationPieData = ref<Itemize[]>([]);
    const deviceSituationAnalysis = reactive({
  title: "设备总数",
  total: 0,
  itemize: [
    {
      label: "在线",
      value: 0,
      color: "#35D93D",
      key: "NORMAL",
    },
    {
      label: "离线",
      value: 0,
      color: "#D0DEEE",
      key: "OFFLINE",
    },
    {
      label: "故障",
      value: 0,
      color: "#FFC700",
      key: "TROUBLE",
    },
    {
      label: "报警",
      value: 0,
      color: "#F14545",
      key: "ALARM",
    },
  ],
});
const handelClickDeviceItemize=(value)=>{

Parameter.value.typeId=value.typeId
ModalShow.value=true


}
const workOrderTime = ref<ModelValueItf>();
const monitorSituationAnalysis = reactive({
  title: "设备总数",
  total: 0,
  itemize: [
    {
      label: "在线",
      value: 0,
      color: "#35D93D",
      key: "NORMAL",
    },
    {
      label: "离线",
      value: 0,
      color: "#D0DEEE",
      key: "OFFLINE",
    },
    {
      label: "故障",
      value: 0,
      color: "#FFC700",
      key: "TROUBLE",
    },
    {
      label: "报警",
      value: 0,
      color: "#F14545",
      key: "ALARM",
    },
  ],
});
const monitorSituationColors = ref<string[]>([
  "#FFAB10",
  "#2F8DFF",
  "#F14545",
  "#19F8F7",
]);
const monitorSituationPieData = ref<{ label: string; value: number; color: string }[]>(
  []
);
const personStatistic = reactive({
  total: 0,
  onDutyNum: 0,
  leaveNum: 0,
});
const workOrderStatustic = reactive({
  total: 38,
  maxData: [12, 12, 12, 12, 12],
  workerData: [6, 4, 7, 12, 9],
  workerTitles: ["考勤管理", "行政管理", "人事管理", "资产管理", "工作汇报"],
});
const deviceModalShow = ref(false);
const ModalShow = ref(false);
const deviceParameter = ref<Record<string, any>>({
  applicationCode: "SECURITY_MONITORING",
});
const Parameter=ref({
  typeId:''

})
const closeModal = () => {
  deviceModalShow.value = false;
};
const requestMonitorSituation = async () => {
  const res = await getMonitorSituation();
  monitorSituationAnalysis.total = res.deviceNum;
  monitorSituationAnalysis.itemize.map((item) => {
    let ele = res.deviceStatusNums.find((element) => element.name === item.key);
    item.value = ele.num;
  });
  monitorSituationPieData.value = res.deviceAreaNum.map((item, index) => {
    let areaName = item.areaName.split("/");
    if (areaName.length === 3) {
      areaName = areaName[1] + "/" + areaName[2];
    } else {
      areaName = item.areaName;
    }
    return {
      label: `${areaName}(${Math.round(item.proportion * 10000) / 100}%)`,
      value: item.num,
      color: monitorSituationColors.value[index % 4],
      areaId: item.areaId,
    };
  });
};
const deviceSituationColors = ref<string[]>(["#FFAB10", "#2F8DFF", "#F14545", "#19F8F7"]);

const riskData=reactive<{
  totalNum:number

}>({
totalNum: 0
})
const getRisk=async ()=>{
 const res=await getRiskSource({
period: workOrderTime.value.dateRange.join(","),
dimension: '',
eventResult: '',
typeNames: []
})
deviceSituationPieData.value=res.typeVOList.map((item,index)=>{
return {
label:`${item.typeName}(${item.ratio*100}%)`,
value: item.totalNum,
ratio: item.totalNum,
color: deviceSituationColors.value[index % 4],
name:item.typeName,
typeId:item.typeId


    

}

})
Object.assign(riskData,res)

}
const requestStateTotal = async () => {
  const res = await arrangeTodayStat();
  personStatistic.onDutyNum = 0
  personStatistic.leaveNum = 0
  personStatistic.total = 0
  personStatistic.onDutyNum = res.workCount
  personStatistic.leaveNum = res.totalCount - res.workCount
  personStatistic.total = res.totalCount
};
const handleClickItemize = (item: any) => {
  deviceParameter.value = {
    areaId: item.areaId,
    applicationCode: "SECURITY_MONITORING",
  };
  deviceModalShow.value = true;
};
const requestFlowNumberStatistic = async () => {
  const res = await getFlowNumberStatistic({
    period: workOrderTime.value.dateRange.join(","),
  });
  workOrderStatustic.total = res.map((item) => item.count).reduce((m, n) => m + n);
  workOrderStatustic.workerData = res.map((item) => item.count);
  workOrderStatustic.workerTitles = res.map((item) => item.applicationId.applicationName);
  const maxValue = Math.max(...res.map((item) => item.count));
  workOrderStatustic.maxData = new Array(workOrderStatustic.workerData.length).fill(
    maxValue
  );
};
const showDeviceTable = (item: any) => {
  deviceParameter.value = {
    status: item.key,
    applicationCode: "SECURITY_MONITORING",
  };
  deviceModalShow.value = true;
};
const changeHandleworkOrderTime = () => {
  getRisk();
};
onMounted(() => {
  requestMonitorSituation();
  requestStateTotal();
});
</script>
<style lang="less" scoped>
.device-total-pie,
.device-total-list,
.device-total-pie-chart,
.alarm-total-pie,
.alarm-total-list,
.alarm-total-pie-chart {
  height: 140px !important;
}

.device-total-list {
  margin-top: 20px;

}

:deep(.device-total-pie-chart),
:deep(.alarm-total-pie-chart) {
  height: 140px !important;
}

.panel {
  font-size: 12px;
  color: #d0deee;

  .scroll-number {
    font-size: 24px;
    margin-left: 8px;
  }
}

.monitor-statistic {
  width: 100%;

  .content {
    text-align: center;
    color: #fff;
    font-size: 14px;

    .total-num {
      font-size: 16px;
    }
  }
}

.content {
  text-align: center;
  color: #fff;
  font-size: 14px;

  .total-num {
    font-size: 16px;
  }
}

.person-statistic {
  width: 100%;
  text-align: center;

  .view-statistic {
    width: 100%;
    position: relative;

    .bg {
      position: relative;

      img {
        width: 154px;
        height: 130px;
      }

      .rotate {
        position: absolute;
        top: 10px;
        left: 47px;
        width: 60px;
        height: 60px;
      }
    }

    .view-content {
      width: 98px;
      height: 60px;

      .icon img {
        width: 18px;
        height: 18px;
      }
    }

    .view-left {
      background-image: url("/resource/v1/ue5-sn-migrate/assets/images/overView10.png");
      background-size: contain;
      position: absolute;
      left: 0;
      bottom: 0;
    }

    .view-right {
      background-image: url("/resource/v1/ue5-sn-migrate/assets/images/overView8.png");
      background-size: contain;
      position: absolute;
      right: 0;
      bottom: 0;
    }
  }
}

.manage-statistic {
  .left {
    .bg {
      position: relative;

      img {
        width: 88px;
        height: 74px;
      }

      .rotate {
        width: 34px;
        height: 34px;
        position: absolute;
        top: 0;
        left: 27px;
      }
    }
  }

  .right {
    flex: 1;
    height: 52px;
    background-image: url("/resource/v1/ue5-sn-migrate/assets/images/overView6.png");
    background-size: cover;
  }
}

.risk {
  display: flex;
  justify-content: space-between;

}

.value {
  font-size: 18px;
  color: #000 !important;
}
</style>
