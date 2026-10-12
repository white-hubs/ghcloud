<template>
  <Modal :title="modalTitle" :show="showModal" @close="closeModal" :modalStyle="{
      width: '666px',
    }">
    <div class="modal-layout" v-if="dataSource.length > 0">
      <div class="list-container" style="">
        <RankStatItem v-for="item in dataSource" :show-chain-ratio="props.showChainRatio" :key="item.id"
          v-bind="item" />
      </div>
      <div style="height: 30px" v-if="datainfo.total > 0">
        <a-pagination style="float: right; margin-top: 15px; color: #fff" :show-total="(total) => `共 ${total} 条`"
          v-model:current="datainfo.pageNumber" v-model:page-size="datainfo.pageSize" @change="onShowSizeChange"
          :total="datainfo.total" show-size-changer :pageSizeOptions="['20', '30', '50', '100']" />
      </div>
    </div>
    <NoData class="modal-layout" v-else></NoData>
  </Modal>
</template>
<script setup lang="ts">
import Modal from "@/components/modal-table/modal.vue";
import { onMounted, reactive, ref, watch } from "vue";
import NoData from "@/components/businessPanel/public/noData.vue";
import { alarmStatisticsRank } from "@/api/shennong/alarm";
import { filterMarket, getallNumber } from "@/utils/common";
import { getSnImage } from '@/utils/getImage'
import { getMarketList} from "@/api/shennong/compre";
import RankStatItem from '@/components/shengnong-custom-panel/common/rank-stat-item.vue';
import { storeArea } from "@/piniaStore/area";
const piniaStoreArea = storeArea();
const emit = defineEmits(["close"]);

interface Props {
  parameter: Record<string, any>;
  showModal: boolean;
  modalTitle: string;
  showChainRatio: boolean;
  getDataFunc?: (param: Record<string, any>) => Promise<{ total: number, records: any, pages: number }>;
  fieldNames:{
    name:string;
    value:string;
    chainRatio?:string;
  };
  percentTotal?: number;
}
const props = withDefaults(defineProps<Props>(), {
  modalTitle: "报警记录",
  showModal: false,
  showChainRatio: true,
  fieldNames:()=>{
    return {
      name: "marketName",
      value:"totalNum",
      chainRatio:"chainRatio",
   }
  }
});
const table_header = [
  "排名",
  "市场名称",
  "报警数量",
];
const proStyle=(width)=>{
return `width:${width}%`
}
const datainfo = reactive<Record<string, any>>({
  period: "",
  alarmLevelId: "",
  alarmStatus: "",
  alarmTypeCode: "",
  pageSize: 30,
  pageNumber: 1,
  total: 0,
  marketTenant: props.parameter.marketTenant
});
const dataSource = ref([]);

const onShowSizeChange = (current, size) => {
  datainfo.pageNumber = current;
  datainfo.pageSize = size;
  getTableData()
};
const getTableData = async () => {
  let param = {
    period:props.parameter.dateRange? props.parameter.dateRange.join(","):'',
    stateRange:props.parameter.alarmStatus? props.parameter.alarmStatus:'',
    type:props.parameter.type? props.parameter.type:'',
    pageSize: datainfo.pageSize,
    pageNumber: datainfo.pageNumber,
    applicationCode:props.parameter.applicationCode? props.parameter.applicationCode:'',
  };
  let result = { total: 0, records: [], pages: 0 }
  if (props.getDataFunc) {
    result = await props.getDataFunc(param);
  } else {
    result = await alarmStatisticsRank(param);
  }
  let { records, total } = result
  if (Array.isArray(records) && records.length > 0) {
    const newRecords = filterMarket(records, props.fieldNames.name ?? 'marketName')
    const total = getallNumber(newRecords, props.fieldNames.value)
    const percentTotal = props?.percentTotal ? props.percentTotal : total
    dataSource.value = newRecords.sort((a, b) =>{
        return (b[props.fieldNames.value] ?? b.totalNum) - (a[props.fieldNames.value] ?? a.totalNum)
      })
      .map((item, index) => {
        return {
          ...item,
          rank:(datainfo.pageNumber-1)*datainfo.pageSize+ index + 1,
          name: item[props.fieldNames.name] ?? item.marketName, //名称
          count: item[props.fieldNames.value] ?? item.taskNum, //总数
          percent: percentTotal ? (item[props.fieldNames.value] / percentTotal) * 100 + '%':'0%', //相对总数占比
          chainRatio: props.showChainRatio? item[props.fieldNames.chainRatio] || item.ratio : '', //环比
        };
      });
  }
  datainfo.total = dataSource.value.length || total
};
const marketList = ref([]);
const marketV2List = ref([]);
onMounted(async () => {
  try {
    marketList.value = await getMarketList();
    const tenantV1 = (window?.config?.feature?.subMarketV1 || [])?.map(item => item.tenant)
    marketV2List.value = marketList.value?.filter(item => item.status)?.filter(item => !tenantV1.includes(item.marketTenant+''))
    piniaStoreArea.marketV2List = marketV2List.value
    piniaStoreArea.marketV1List = marketList.value?.filter(item => item.status)?.filter(item => tenantV1.includes(item.marketTenant+''))
  } catch (error) {}
});
const closeModal = () => {
  emit("close");
};
watch(
  () => props.showModal,
  async () => {
    if (props.showModal) {
      getTableData()
    }
  }
);
</script>

<style lang="less" scoped>
:deep(.ant-modal-content) {
  // border: 1px solid rgba(18, 133, 255, 0.20) !important;
  background: #fff !important;
}

.alarm-time-picker {
  width: 230px;
}

.alarm-level-select,
.handle-status-select {
  width: 150px;
}

.list-container {
  margin-top: 15px;
  height: 480px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 30px
}

.table_header {
  background: rgba(16, 40, 68, 0.8);
  height: 48px;
  display: flex;
  color: #fff;
  line-height: 48px;
  color: #fff;

  .table_header_item0,
  .table_header_item1,
  .table_header_item2 {
    padding: 0 15px;
    text-align: center;
    text-wrap: nowrap;
  }

  .table_header_item0 {
    width: 20%;
    flex: 0.2;
  }

  .table_header_item1 {
    width: 20%;
    flex: 0.2;
  }

  .table_header_item2 {
    width: 60%;
    flex: 0.6;
  }
}

.content {
  display: flex;
  color: #fff;

  .content-item0,
  .content-item1,
  .content-item2 {
    line-height: 48px;
    height: 48px;
    border-bottom: 1px solid rgba(105, 116, 140, 0.5);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 10px;
  }

  .content-item0 {
    flex: 0.2;
  }

  .content-item1 {
    flex: 0.2;
  }

  .content-item2 {
    flex: 0.6;
  }
}

.content-item-title {
  display: flex;

  span {
    font-family: D-DIN, D-DIN-Regular;
    font-weight: bold;
    font-size: 20px;
  }

  .line {
    width: 100%;
    height: 9px;
    margin: 20px 0 0 12px;
    background: rgba(217, 231, 255, 0.1);
    border-radius: 0px 0px 0px 0px;
    display: flex;
    align-items: center;

    .progress {
      height: 100%;
      width: 0;
      background: linear-gradient(63deg, rgba(97, 148, 247, 0.14) 0%, rgba(148, 186, 249, 1) 100%);
      opacity: 1;
      transition: all 2s ease 1s;
    }

    .up_proress {
      background: linear-gradient(63deg, rgba(97, 148, 247, 0.14) 2%, #5d9aff 80%);
    }

    .progress0 {
      background: linear-gradient(63deg, rgba(223, 85, 85, 0.14) 2%, #df5555 80%);
    }

    .progress1 {
      background: linear-gradient(63deg, rgba(209, 163, 115, 0.14) 2%, #e19953 80%);
    }

    .progress2 {
      background: linear-gradient(63deg, rgba(197, 171, 99, 0.14) 2%, #c5ab63 80%);
    }
  }
}

:deep(.ant-select-selection-item) {
  color: rgba(255, 255, 255, 1);
}
</style>
