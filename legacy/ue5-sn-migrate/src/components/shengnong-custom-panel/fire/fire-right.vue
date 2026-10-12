<template>
  <div class="panel">
    <SubPanelTemplate
      image="xf-2.png"
      title="消防设备统计"
    >
        <DeviceStatistics
          :data="deviceStatisticsData"
          @clickNumber="clickNumber"
          @clickPie="clickPie"
          @clickRow="clickRow"
        />
    </SubPanelTemplate>
    <SubPanelTemplate
      title="消防物资到期统计"
      image="xf-3.png"
    >
      <div class="fire-wz">
        <ArchiveStatistics :totalData="archiveStatisticsData.totalData" :data="archiveStatisticsData.statList"
        @clickRow="(item)=>{handleCurrentArchive(item)}" @totalClick="handleTotalClick" :isScroll="false"
        :show-more="true" @moreClick="moreArchiveClick" />
      </div>
    </SubPanelTemplate>
    <!--报警记录-->
    <AlarmRecord  style="margin-top:15px" :applicationCode='applicationCode'/>
  </div>
  <modal-alarm-table
    v-if="alarmModalShow"
    :show-modal="alarmModalShow"
    @close="closeModal"
    :parameter="alarmParameter"
  ></modal-alarm-table>
  <modal-table :show="showModal" title="易燃物资建档记录" width="1200px" @close="close">
    <modal-record
      v-if="showModal"
      :periodtime="''"
      type="FIRE_FIGHTING_EQUIPMENT"
      :marketName="marketName"
      :marketid="''"
      status="已过期"
    ></modal-record>
  </modal-table>
  <modal-table :show="showmodalfire" title="消防设备" @close="closemod">
    <modal-fire
      v-if="showmodalfire"
      type="FIRE_FIGHTING_EQUIPMENT"
      :periodtime="pieTime.dateRange.join(',')"
      :status="statusName"
      :marketid="''"
      :typeName="typeName"
    ></modal-fire>
  </modal-table>
  <AlarmStatisticsModal @close="showArchiveMore = false" :modalTitle="'消防物资到期统计'" :showModal="showArchiveMore" :parameter="abnormalParameter" :getDataFunc="getFireRankApi" :showChainRatio="false" />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted} from "vue";
import ArchiveStatistics from "../common/gas-archive-statistics.vue";
import DeviceStatistics from '../common/device-statistics.vue'
import DateInlineForm from "../common/dateInlineForm.vue";
import SubPanelTemplate from "../common/snPanelTemplate.vue";
import AlarmRecord from "./components/alarm-record.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import modalTable from "@/components/modal-table/modal.vue";
import ModalRecord from "@/components/shengnong-custom-panel/gasPanel/gastable.vue";
import { storeMarket } from "@/piniaStore/other";
import { fireDeviceCategoryStat, fireDeviceData, fireDeviceExpire, fireSafetyCard, flammableDevice,flammableDeviceList } from "@/api/shennong/compre";
import useCommon from "@/components/hooks/useCommon";
import dayjs from "dayjs";
import ModalFire from "./firetable.vue";
import { filterMarket, getallNumber } from "@/utils/common";
import AlarmStatisticsModal from "@/components/shengnong-custom-panel/security-monitoring/components/alarm-statistics-modal.vue";
import bus from "@/utils/bus";
import { TopParams } from "../common/alarmlist-event";

const applicationCode = "FIRECONTROL";
const piniaStoreMarket = storeMarket();
const {
  piniaStoreArea,
  piniaStoreMenu,
} = useCommon();
//消防设备统计==================================================================
const pieTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});

const deviceStatisticsData = reactive(
  {
    totalNum: 0,
    pieData:[
      {name: "总设备数",value: 0,color: "blue"},
      {name: "在线设备数",value: 0,color: "green"},
    ],
    headData:[
      {name: "设备总数",value: "0",color: "blue",unit: "个",icon:'icon-3.png'},
      {name: "在线数",value: "0",color: "green",unit: "个"},
      {name: "离线数",value: "0",color: "yellow",unit: "个"},
    ]
});
const changeDevice=async () => {
  let param = {
    marketTenant: '',
    applicationCode: applicationCode,
    // period: deviceTime.value.dateRange.join(","),
    // type: deviceTime.value.timeType,
    period: '',
    type: '',
    typeCode: 'FIRE_FIGHTING_EQUIPMENT'
  };
  let stat = await fireDeviceCategoryStat(param);
  const statList = stat?.filter(item => {
    const name = item?.name?.toLowerCase();
    return (
      // 温感设备（包含温感、温感探测器等关键词）
      /温感|温感探测器/i.test(name) ||
      
      // 烟感设备（包含烟感、感烟、烟雾等关键词）
      /烟感|感烟/i.test(name) ||
      
      // 水压设备（包含水压、压力、hydraulic等关键词）
      /水压|消防水压/i.test(name)
    );
  })
  deviceStatisticsData.pieData = statList?.map((item, index) => {
    return {
      name: item.name,
      value: item.count,
      color: colors[index % colors.length],
    };
  }).slice(0, 3);
  let res: any = await fireDeviceData(param);
  const onLine = res?.deviceStateList?.find(e => e.stateName==='在线')
  const offLine = res?.deviceStateList?.find(e => e.stateName==='离线')
  deviceStatisticsData.headData[0].value = res?.totalNum;
  deviceStatisticsData.headData[1].value = onLine?.stateNum;
  deviceStatisticsData.headData[2].value = offLine?.stateNum;

  const totalNumber = getallNumber(deviceStatisticsData.pieData, "value")
  const count = Number(res?.totalNum) - totalNumber
  if (count > 0 && deviceStatisticsData.pieData.length > 0) {
    deviceStatisticsData.pieData.push({
      name: '其他',
      value: count,
      color: '#5D5FEF'
    })
  }
};
const alarmParameter = ref<Record<string, any>>({
  applicationCode: applicationCode,
  alarmTypeCode: applicationCode,
});

const alarmModalShow = ref<boolean>(false);
const closeModal = () => {
  alarmModalShow.value = false;
};
//易燃设备建档统计================================================================
const showModal = ref(false);
const marketName = ref("");
const statusName = ref("");
const archiveStatisticsData = ref({
  totalData:[ {name: "总物资数",value: 0,color: "blue",unit:'个',icon:'icon-3.png'}],//报警总数
  statList:[]
});
const getFlammableDevice = async () => {
  let param = {
    period: '',
    stateRange: '',
    type: '',
    pageSize: 20,
    pageNumber: 1,
    applicationCode: applicationCode,
    typeCode: 'FIRE_FIGHTING_EQUIPMENT',
    state: 'EXPIRE',
  };
  let { records, total, pages } = await fireDeviceExpire(param);
  const newRecords = filterMarket(records)
  const totalNum=newRecords.reduce((pre,cur)=>pre+cur.num,0)
  archiveStatisticsData.value.statList = newRecords.toSorted((a,b)=>b.num-a.num).map((item, index) => {
    return {
      sort: index + 1,
      name: item.marketName,
      value: item.num,
      count: item.num,
      ratio: item.num / totalNum,
      width: item.num / totalNum * 100,
      color: colors[index % colors.length],
      marketTenant:item.marketTenant
    };
  }).slice(0, 3);

  const {deviceExpireNum} = await fireSafetyCard({ 
    period: '',
    type: '',
    marketTenant: '',
    applicationCode: applicationCode
  })
  archiveStatisticsData.value.totalData[0].value = deviceExpireNum || 0
};
const changeAlarmAnalysisTime = async () => {
  changeDevice();
  getFlammableDevice();
};
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
const deviceTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [
    dayjs(new Date()).format("YYYY-MM-DD 00:00:00"),
    dayjs(new Date()).format("YYYY-MM-DD 23:59:59"),
  ],
});
const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
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

bus.on("topPanelClick", (item: TopParams): void => {
  if (item?.key === "deviceExpireNum") {
    statusName.value = ''
    marketName.value = ''
    showModal.value = true;
  }
});
// 报警处理情况, 易燃设备建档统计 每15秒轮播
onMounted(() => {
  changeAlarmAnalysisTime();
  
});
const showmodalfire = ref(false);
const clickPie = (item) => {
  statusName.value = ''
  typeName.value = ''
  showmodalfire.value = true;
};
const clickNumber = (item) => {
  typeName.value = ''
  statusName.value = item.name.includes('在线') ? '1' : item.name.includes('离线') ? '0' :'';
  showmodalfire.value = true;
};
const typeName = ref('');
const clickRow = (item) => {
  statusName.value = ''
  typeName.value = item.name
  showmodalfire.value = true;
};
const closemod = () => {
  showmodalfire.value = false;
};
const getFireRankApi =  async (param?: Record<string, any>): Promise<any> => {
  let params = {
    ...param,
    typeCode: 'FIRE_FIGHTING_EQUIPMENT',
    state: 'EXPIRE'
  };
  let { records, total, pages } = await fireDeviceExpire(params);
  const totalNum = records.reduce((pre,cur)=>pre+cur.num,0)
  const list = records.toSorted((a,b)=>b.num-a.num).map((item, index) => {
    return {
      sort: index + 1,
      marketName: item.marketName,
      value: item.num,
      count: item.num,
      ratio: item.num / totalNum,
      color: colors[index % colors.length],
      marketTenant:item.marketTenant,
      totalNum: item.num,
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
</script>
<style scoped lang="less">
.fire-wz{
  :deep(.container .box){
    padding: 5px 10px;
  }
}
:deep(.alarm-list .alarm-item){
  margin-top: 2px;
  margin-bottom: 10px;
  padding: 2px 8px;
}
</style>
