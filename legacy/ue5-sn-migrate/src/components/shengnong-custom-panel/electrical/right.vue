<template>
  <div class="panel">
    <EventAlarmStatistics style="margin-top:15px" :applicationCode='applicationCode' @click="clickAlarmStatistics"  />
    <SubPanelTemplate image="bj.png" title="报警事件分析">
      <template #extra>
        <DateInlineForm v-model:modelValue="alarmAnalysisTime" @search="changeAlarmAnalysisTime" menuPage="electrical"></DateInlineForm>
      </template>
      <EventAnalysis :data="alarmStatisticsData" @clickTotal="handleClickTotal" @clickRow="(item)=>{clickAlarmAnalysisBar(item)}" />
    </SubPanelTemplate>
    <SubPanelTemplate title="报警记录" image="icon-2.png">
      <template #extra>
        <DateInlineForm v-model:modelValue="alarmRecordTime" @search="changeReceptionTrendsTime" menuPage="electrical"></DateInlineForm>
      </template>
      <div v-if="alarmListData.length>0" style="height:263px">
        <div class="more" @click="moreClick">查看更多></div>
        <RollTable @clickRow="clickRowAlarm" :column="column" :data="alarmListData" :limitScrollNum="4" :showLength="10">
        <template #alarmStatus="{ record }">
          <span v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待处理</span>
          <span v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
          <span v-else="record.alarmStatus === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
        </template>
      </RollTable>
      </div> 
      <noData v-else />
    </SubPanelTemplate>
  </div>
  <modal-alarm-table
    :show-modal="alarmModalShow"
    @close="closeModal"
    :parameter="alarmParameter"
  ></modal-alarm-table>
  <!-- <Alarm v-if="alarmDetailModalShow" @close="closeAlarmDetailModal" :isalarm="true" :alarmDetailData="alarmDetailParameter">
  </Alarm> -->
  <Modal :show="alarmDetailModalShow" :title="`${alarmDetailParameter?.alarmTypeName}【${ alarmDetailParameter?.marketName || alarmDetailParameter?.market }】`" @close="closeAlarmDetailModal">
    <Alarm @closeDevicePanel="closeAlarmDetailModal" :alarmDetailData="alarmDetailParameter" v-if="alarmDetailModalShow"
      :isalarm="true" :marketName="alarmDetailParameter?.marketName ">
    </Alarm>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import noData from "@/components/businessPanel/public/noData.vue";
import EventAlarmStatistics from "./components/event-alarm-statistics.vue";
import EventAnalysis from "../common/event-analysis.vue";
import DateInlineForm from "../common/dateInlineForm.vue";
import SubPanelTemplate from "../common/snPanelTemplate.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import { storeMarket } from "@/piniaStore/other";
import { alarmRecordPage, alarmHandleAnalysisStat, alarmSituationStat, getMarketConfig } from "@/api/shennong/alarm";
import moment from "moment";
import Alarm from "@/components/alarmdetails/equipmentModesn.vue";
import { openAlarmDetail, removeMarketToken } from '@/components/hooks/useAlarm'
import bus from "@/utils/bus";
import { TopParams } from "../common/alarmlist-event";
import Modal from "@/components/modal-table/modal.vue";
import useEscClose from '@/components/hooks/useEscClose';

const applicationCode = "ELECTRICMANAGE";
const piniaStoreMarket = storeMarket();

//报警事件分析==================================================================

const alarmAnalysisTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const alarmStatisticsData = ref({
  totalNum: 0,//报警总数
  totalRatio: 0,//报警环比
  statList:[
      {
        sort:1,
        name:'已处理报警数',
        key:'handlerNum',
        count:0,
        ratio:'1',
        ratioKey:'handlerChainRatio',
        modes:'1',
        linkRatio:1,
        code:1,
        sn:true,
        width:0.1,
        rank:1,
        lineColor:['rgba(57,238,143,0.00)','#3bf793']
      },
      {
        sort:2,
        name:'未响应报警数',
        key:'unConfirmedNum',
        count:0,
        ratio:'1',
        ratioKey:'unConfirmedChainRatio',
        modes:'1',
        linkRatio:1,
        code:1,
        sn:true,
        width:0.1,
        rank:1,
        lineColor:['rgba(247,160,59,0.00)','#f7a03b']
      },
      {
        sort:3,
        name:'超时报警数',
        key:'timeoutNum',
        count:0,
        ratio:'1',
        ratioKey:'timeoutChainRatio',
        modes:'1',
        linkRatio:1,
        code:1,
        sn:true,
        width:0.1,
        rank:1,
        lineColor:['rgba(250,78,78,0.00)','#fa4e4e']
      },
      {
        sort:4,
        name:'超时未处理报警数',
        key:'timeoutUnHandlerNum',
        count:0,
        ratio:'1',
        ratioKey:'timeoutUnHandlerChainRatio',
        modes:'1',
        linkRatio:1,
        code:1,
        sn:true,
        width:0.1,
        rank:1,
        lineColor:['rgba(75,134,255,0.00)','#4b86ff']
      },
  ]
});
const alarmParameter = ref<Record<string, any>>({
  applicationCode: applicationCode,
  alarmTypeCode: applicationCode,
});
const changeAlarmAnalysisTime = async () => {
  alarmParameter.value.dateRange = alarmAnalysisTime.value.dateRange;
  let param = {
    period: alarmAnalysisTime.value.dateRange.join(","),
    type: alarmAnalysisTime.value.timeType,
    pageSize: 5,
    pageNumber: 1,
    applicationCode: applicationCode,
    marketTenant: '',
  };
  const totalStat=await alarmSituationStat(param)
  let result = await alarmHandleAnalysisStat(param);
  const { handlerNum, handlerChainRatio, unConfirmedNum, unConfirmedChainRatio, timeoutNum, timeoutChainRatio, timeoutUnHandlerNum, timeoutUnHandlerChainRatio } = result;
  const {totalNum,chainRatio} = totalStat
  alarmStatisticsData.value.totalNum = totalNum
  alarmStatisticsData.value.totalRatio = chainRatio
  alarmStatisticsData.value.statList[0].count = handlerNum
  alarmStatisticsData.value.statList[0].ratio = handlerChainRatio
  alarmStatisticsData.value.statList[0].width = handlerNum ? handlerNum / totalNum : 0
  alarmStatisticsData.value.statList[1].count = unConfirmedNum
  alarmStatisticsData.value.statList[1].ratio = unConfirmedChainRatio
  alarmStatisticsData.value.statList[1].width = unConfirmedNum ? unConfirmedNum / totalNum : 0
  alarmStatisticsData.value.statList[2].count = timeoutNum
  alarmStatisticsData.value.statList[2].ratio = timeoutChainRatio
  alarmStatisticsData.value.statList[2].width = timeoutNum ? timeoutNum / totalNum : 0
  alarmStatisticsData.value.statList[3].count = timeoutUnHandlerNum
  alarmStatisticsData.value.statList[3].ratio = timeoutUnHandlerChainRatio
  alarmStatisticsData.value.statList[3].width = timeoutUnHandlerNum ? timeoutUnHandlerNum / totalNum : 0
};

const clickAlarmAnalysisBar = (record) => {
  alarmParameter.value = {
    applicationCode: applicationCode,
    alarmTypeCode: applicationCode,
    dateRange: alarmAnalysisTime.value.dateRange,
    alarmHandlerTimeoutStatus:["timeoutNum",'timeoutUnHandlerNum'].includes(record.key)?'TIMED_OUT':'',
    filterAlarmStatus: record.key==="timeoutUnHandlerNum"?'ALARM_HANDLER':'',
    alarmStatus:["handlerNum"].includes(record.key)  ? "ALARM_HANDLER" : record.key == "unConfirmedNum" ? "ALARM_UN_CONFIRMED" : null,
  }
  alarmModalShow.value = true;
};

const handleClickTotal = (record) => {
  alarmParameter.value = {
    applicationCode: applicationCode,
    alarmTypeCode: applicationCode,
    dateRange: alarmAnalysisTime.value.dateRange,
  }
  alarmModalShow.value = true;
};

bus.on("topPanelClick", (item: TopParams): void => {
  if (item?.key === "totalNum") {
    alarmParameter.value = {
      applicationCode: applicationCode,
      alarmTypeCode: applicationCode,
      dateRange: item?.period?.split(','),
    }
    alarmModalShow.value = true;
  } else if (item?.key === "handlerNum") {
    alarmParameter.value = {
      applicationCode: applicationCode,
      alarmTypeCode: applicationCode,
      dateRange: item?.period?.split(','),
      alarmStatus: "ALARM_HANDLER",
    }
    alarmModalShow.value = true;
  }
});
const clickAlarmStatistics = (record) => {
  alarmParameter.value = {
    applicationCode: applicationCode,
    alarmTypeCode: applicationCode,
    dateRange: record.dateRange,
    alarmEventTypeCode: record.sign,
  }
  alarmModalShow.value = true;
};

const alarmModalShow = ref<boolean>(false);
const closeModal = () => {
  alarmModalShow.value = false;
};


//报警记录=============================================================
const alarmRecordTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const alarmListData = ref([]);
const column = reactive([
  
  {
    title: "报警事件",
    dataIndex: "alarmEventName",
    width: 140,
  },
  {
    title: "报警市场",
    dataIndex: "marketName",
    width: 140,
  },
  {
    title: "报警级别",
    dataIndex: "alarmLevelName",
  },
  {
    title: "状态",
    dataIndex: "alarmStatus",
    slots: {
      customRender: "alarmStatus",
    },
  },
  {
    title: "报警时间",
    dataIndex: "alarmTime",
    width: 120,
  },
]);

const changeReceptionTrendsTime = async () => {
  let param = {
    period: alarmRecordTime.value.dateRange.join(","),
    type: alarmRecordTime.value.timeType,
    pageSize: 4,
    pageNumber: 1,
    marketTenant: '',
    applicationCode: applicationCode
  };
  let { records } = await alarmRecordPage(param);
  alarmListData.value = records.map((item) => {
    return {
      ...item,
      alarmTime: moment(item.alarmTime).format("YYYY-MM-DD"),
    };
  }).slice(0,3);
};

const moreClick = ()=>{
  alarmModalShow.value = true;
  alarmParameter.value = Object.assign(alarmParameter.value, {
    dateRange: alarmRecordTime.value.dateRange,
  });
}
const alarmDetailModalShow = ref(false);
const alarmDetailParameter = ref<any>({
  applicationCode: applicationCode,
  alarmTypeCode: applicationCode,
});
const clickRowAlarm = async (record) => {
  await openAlarmDetail(record, (res)=>{
    alarmDetailParameter.value = Object.assign(alarmDetailParameter.value, record);
    alarmDetailModalShow.value = true;
  })
};
const closeAlarmDetailModal = () => {
  alarmDetailModalShow.value = false;
}
useEscClose(() => {
  if (alarmDetailModalShow.value) {
    closeAlarmDetailModal();
  }
});

</script>
<style scoped lang="less">
.more {
  color: #93AADB;
  font-size: 14px;
  text-align: right;
  margin: 4px;
  cursor: pointer;
}
:deep(.roll-table .table-tr){
  height: 50px;
  line-height: 50px;
}
:deep(.roll-table .header){
  height: 40px;
}

</style>
