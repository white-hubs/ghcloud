<template>
  <div class="panel">
    <SubPanelTemplate image="bj.png" title="报警事件分析" class="bj">
      <template #extra>
        <DateInlineForm v-model:modelValue="alarmAnalysisTime" @search="changeAlarmAnalysisTime" menuPage="gas"></DateInlineForm>
      </template>
      <EventAnalysis :data="alarmStatisticsData" @clickTotal="handleClickTotal" @clickRow="(item)=>{clickAlarmAnalysisBar(item)}" />
    </SubPanelTemplate>
    <SubPanelTemplate title="易燃物资建档统计" image="icon-4.png">
      <ArchiveStatistics :totalData="archiveStatisticsData.totalData" :data="archiveStatisticsData.statList"
        @clickRow="(item)=>{handleCurrentArchive(item)}" @totalClick="handleTotalClick" :isScroll="isScroll"
        :show-more="true" @moreClick="moreArchiveClick" />
    </SubPanelTemplate>
    <SubPanelTemplate title="报警记录" image="icon-2.png">
      <template #extra>
        <DateInlineForm v-model:modelValue="alarmRecordTime" @search="changeReceptionTrendsTime" menuPage="gas"></DateInlineForm>
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
  <modal-alarm-table :show-modal="alarmModalShow" @close="closeModal" :parameter="alarmParameter"></modal-alarm-table>
  <modal-table :show="showModal" title="易燃物资建档记录" @close="close" width="1200px">
    <!-- todo: 和后端确认后传type -->
    <modal-record v-if="showModal" :periodtime="''" :marketName="marketName"
      :status="statusName" :type="'FLAMMABLE_EQUIPMENT'"></modal-record>
  </modal-table>
  <Modal :show="alarmDetailModalShow" :title="`${alarmDetailParameter?.alarmTypeName}【${ alarmDetailParameter?.marketName || alarmDetailParameter?.market }】`" @close="closeAlarmDetailModal">
    <Alarm @closeDevicePanel="closeAlarmDetailModal" :alarmDetailData="alarmDetailParameter" v-if="alarmDetailModalShow"
      :isalarm="true" :marketName="alarmDetailParameter?.marketName ">
    </Alarm>
  </Modal>
  <AlarmStatisticsModal @close="showArchiveMore = false" :modalTitle="'易燃物资建档统计'" :showModal="showArchiveMore" :parameter="abnormalParameter" :getDataFunc="getGasRankApi" :showChainRatio="false" />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted  } from "vue";
import noData from "@/components/businessPanel/public/noData.vue";
import EventAnalysis from "../common/event-analysis.vue";
import ArchiveStatistics from "../common/gas-archive-statistics.vue";
import DateInlineForm from "../common/dateInlineForm.vue";
import SubPanelTemplate from "../common/snPanelTemplate.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import modalTable from "@/components/modal-table/modal.vue";
import ModalRecord from "./gastable.vue";
import { storeMarket } from "@/piniaStore/other";
import { flammableDevice, flammableDeviceList } from "@/api/shennong/compre";
import useCommon from "@/components/hooks/useCommon";
import Alarm from "@/components/alarmdetails/equipmentModesn.vue";
import { alarmHandleAnalysisStat,alarmSituationStat,alarmRecordPage } from "@/api/shennong/alarm";
import moment from "moment";
import dayjs from "dayjs";
import { openAlarmDetail } from '@/components/hooks/useAlarm'
import AlarmStatisticsModal from "@/components/shengnong-custom-panel/security-monitoring/components/alarm-statistics-modal.vue";
import bus from "@/utils/bus";
import { filterMarket, getallNumber } from "@/utils/common";
import { TopParams } from "../common/alarmlist-event";
import Modal from "@/components/modal-table/modal.vue";
import useEscClose from '@/components/hooks/useEscClose';

const applicationCode = "GAS_MANAGEMENT";
const piniaStoreMarket = storeMarket();
const {
  piniaStoreArea,
  piniaStoreMenu,
} = useCommon();
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
        sort:2,
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
        sort:3,
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
  const { unConfirmedNum, unConfirmedChainRatio, timeoutNum, timeoutChainRatio, timeoutUnHandlerNum, timeoutUnHandlerChainRatio } = result;
  const {totalNum} = totalStat
  alarmStatisticsData.value.totalNum = totalNum
  alarmStatisticsData.value.totalRatio = totalStat.chainRatio
  alarmStatisticsData.value.statList[0].count = unConfirmedNum
  alarmStatisticsData.value.statList[0].ratio = unConfirmedChainRatio
  alarmStatisticsData.value.statList[0].width = unConfirmedNum ? unConfirmedNum / totalNum : 0
  alarmStatisticsData.value.statList[1].count = timeoutNum
  alarmStatisticsData.value.statList[1].ratio = timeoutChainRatio
  alarmStatisticsData.value.statList[1].width = timeoutNum ? timeoutNum / totalNum : 0
  alarmStatisticsData.value.statList[2].count = timeoutUnHandlerNum
  alarmStatisticsData.value.statList[2].ratio = timeoutUnHandlerChainRatio
  alarmStatisticsData.value.statList[2].width = timeoutUnHandlerNum ? timeoutUnHandlerNum / totalNum : 0
};

const clickAlarmAnalysisBar = (record) => {
  alarmParameter.value = {
    applicationCode: applicationCode,
    alarmTypeCode: applicationCode,
    dateRange: alarmAnalysisTime.value.dateRange,
    alarmHandlerTimeoutStatus:["timeoutNum",'timeoutUnHandlerNum'].includes(record.key)?'TIMED_OUT':'',
    filterAlarmStatus:record.key==="timeoutUnHandlerNum"?'ALARM_HANDLER':'',
    alarmStatus: record.key == "handlerNum" ? "ALARM_HANDLER" : record.key == "unConfirmedNum" ? "ALARM_UN_CONFIRMED" : null,
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
const alarmModalShow = ref<boolean>(false);
const closeModal = () => {
  alarmModalShow.value = false;
};
//易燃设备建档统计================================================================
const isScroll=ref(false)
const close = () => {
  showModal.value = false;
};
const archiveStatisticsTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [
    dayjs(new Date()).format("YYYY-MM-DD 00:00:00"),

    dayjs(new Date()).format("YYYY-MM-DD 23:59:59"),
  ],
});
const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
const archiveStatisticsData = ref({
  totalData:[ {name: "总物资数",value: 100,color: "blue",unit:'个',icon:'icon-3.png'}],//报警总数
  statList:[]
});
const getFlammableDevice = async () => {
  let param = {
    period: '',
    type: '',
    marketTenant: '',
    applicationCode: applicationCode,
    pageSize: 50,
    pageNumber: 1
  };
  let { records, total, pages } = await flammableDeviceList(param);
  let res: any = await flammableDevice(param);
  const newRecords = filterMarket(records)
  const totalCount = getallNumber(newRecords, "num")
  archiveStatisticsData.value.totalData[0].value = totalCount
  archiveStatisticsData.value.statList = newRecords.toSorted((a,b)=>b.num-a.num).map((item, index) => {
    return {
      sort: index + 1,
      name: item.marketName,
      value: item.num,
      count: item.num,
      ratio: item.num / totalCount,
      width: item.num / totalCount * 100,
      color: colors[index % colors.length],
    };
  }).slice(0,3);
};
const handleCurrentArchive = (data) => {
  statusName.value = data.name
  marketName.value = piniaStoreMarket.currentMarketName
    ? piniaStoreMarket.currentMarketName
    : data.name;
  // alarmParameter.value.name=data.name
  showModal.value = true;
};
const handleTotalClick = (data) => {
  statusName.value = ''
  marketName.value = piniaStoreMarket.currentMarketName
    ? piniaStoreMarket.currentMarketName
    : data.name;
  showModal.value = true;
};
const getGasRankApi =  async (param?: Record<string, any>): Promise<any> => {
  let { records, total, pages } = await flammableDeviceList(param);
  const totalNum = records.reduce((pre,cur)=>pre+cur.num,0)
  const list = records.toSorted((a,b)=>b.num-a.num).map((item, index) => {
    return {
      sort: index + 1,
      marketName: item.marketName,
      value: item.num,
      count: item.num,
      totalNum: item.num,
      ratio: item.num/totalNum,
      color: colors[index % colors.length],
    };
  });
  return { total: total, records: list, pages: pages }
};
const showArchiveMore = ref(false)
const abnormalParameter = ref<Record<string, any>>({
  applicationCode: applicationCode,
  marketTenant: ""
});
const moreArchiveClick = (data) => {
  abnormalParameter.value = {
    applicationCode: applicationCode,
    marketTenant: ""
  };
  showArchiveMore.value = true;
};

//报警记录=============================================================
const alarmRecordTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const showModal = ref(false);
const marketName = ref("");
const statusName = ref("");
const alarmListData = ref([]);
const column = reactive([
  {
    title: "报警时间",
    dataIndex: "alarmTime",
    width: 120,
  },
  {
    title: "报警级别",
    dataIndex: "alarmLevelName",
  },
  {
    title: "报警事件",
    dataIndex: "alarmEventName",
    width: 140,
  },
  {
    title: "状态",
    dataIndex: "alarmStatus",
    slots: {
      customRender: "alarmStatus",
    },
  },
]);

const moreClick = ()=>{
  alarmModalShow.value = true;
  alarmParameter.value = Object.assign(alarmParameter.value, {
    dateRange: alarmRecordTime.value.dateRange,
  });
}

const clickAlarmBar = (record) => {
  showModal.value = true;
  alarmParameter.value = Object.assign(alarmParameter.value, record);
};

const changeReceptionTrendsTime = async () => {
  let params = {
    areaId: piniaStoreArea.currentAreaId,
    period: alarmRecordTime.value.dateRange.join(","),
    type: alarmRecordTime.value.timeType,
    marketTenant: '',
    pageSize: 50,
    pageNumber: 1,
    applicationCode 
  };
  let res: any = await alarmRecordPage(params);
  alarmListData.value = res.records.map((item) => {
    return {
      ...item,
      alarmTime: moment(item.alarmTime).format("YYYY-MM-DD"),
    };
  }).slice(0, 3);
};
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
onMounted(() => {
  getFlammableDevice()
});

</script>
<style scoped lang="less">
// :deep(.eventItem) {
//   margin-bottom: 20px;
//   padding: 6px;
// }

.more {
  color: #93AADB;
  font-size: 14px;
  text-align: right;
  margin: 4px;
  cursor: pointer;
}
:deep(.eventItem){
  margin-bottom: 12px;
}
:deep(.roll-table .table-tr){
  height: 45px;
  line-height: 45px;
}
:deep(.roll-table .header){
  height: 40px;
}
</style>
