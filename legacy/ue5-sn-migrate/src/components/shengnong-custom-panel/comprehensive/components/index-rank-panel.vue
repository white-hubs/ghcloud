<template>
  <div class="panel">
  <SubPanelTemplate title="安全指数周排名" image="pm.png">
    <template #title>
      <div class="top-title" @click="showTipModal = true">
        <img class="top-icon" :src="getSnImage('top-icon.png')" alt="" />
      </div>
    </template>
      <div class="content">
        <div class="more" @click="handleMore">查看更多></div>
        <div class="content-list" v-if="eventItemList.length > 0">
          <EventAlarmItem
            v-for="(item, index) in eventItemList"
            :sort="item.rank"
            :ratio="item.ratio"
            :linkRatio="item.ratio"
            :count="item.count"
            :name="item.name"
            :sn="true"
            :width="item.width"
            :hideRatio="true"
            @click="clickRow(item)"
          />
        </div>
        <noData v-else />
      </div>
    </SubPanelTemplate>
</div>
  <AlarmStatisticsModal @close="showRankMore = false" :modalTitle="'安全指数周排名'" :showModal="showRankMore" :parameter="moreParameter" :getDataFunc="getSafetyRankApi" :showChainRatio="false" 
    :fieldNames="{
      name: 'marketName',
      value: 'riskValue',
      chainRatio: 'ratio',
    }"
    :percentTotal="100"
  />
  <modal-table :show="showTipModal" title="风险指数说明" @close="showTipModal = false" width="973px">
    <tip-modal v-if="showTipModal"></tip-modal>
  </modal-table>
  <modal-table :show="showModal" :title="reinInfo.name" @close="close">
    <reinsurancemodle :id="reinInfo.id" v-if="showModal" :status="reinInfo.status"></reinsurancemodle>
  </modal-table>
</template>
<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { storeMarket } from "@/piniaStore/other";
import noData from "@/components/businessPanel/public/noData.vue";
import SubPanelTemplate from "../../common/snPanelTemplate.vue";
import EventAlarmItem from '../../common/snEventItem.vue'
import { riskIndex } from "@/api/shennong/alarm";
import { getMarketList } from "@/api/shennong/compre";
import dayjs from "dayjs";
import AlarmStatisticsModal from "@/components/shengnong-custom-panel/security-monitoring/components/alarm-statistics-modal.vue";
import { getSnImage } from "@/utils/getImage";
import modalTable from "@/components/modal-table/modal.vue";
import reinsurancemodle from "./reinsurancemodle.vue";
import tipModal from "./tip-modal.vue";

const piniaStoreMarket = storeMarket();
const props = withDefaults(
  defineProps<{
    chartHeight?: number;
    applicationCode: string;
  }>(),
  {
    chartHeight: 300,
    applicationCode: "",
  }
);

const showModal = ref(false);
const showTipModal = ref(false);
const reinInfo = reactive({
  name:'',
  id:'',
  status:false,
});

const eventItemList = ref([])
const showRankMore = ref(false)
const period = dayjs().subtract(1, 'week').startOf('week').format('YYYY-MM-DD')+','+dayjs().subtract(1, 'week').endOf('week').format('YYYY-MM-DD')
const moreParameter = ref<Record<string, any>>({
  applicationCode: '',
  period: period,
  marketTenant: ""
});
const clickRow = (item) => {
  Object.assign(reinInfo, item);
  showModal.value = true;
}
const close = () => {
  showModal.value = false;
};
const handleMore = () => {
  moreParameter.value = {
    applicationCode: '',
    period: period,
    marketTenant: ""
  };
  showRankMore.value = true;
}
const getData =  async (): Promise<any> => {
  try {
    let param = {
      period: period,
      marketTenant: '',
    };
    const [res, data ] = await Promise.all([
      riskIndex(param),
      getMarketList()
    ])
    res.forEach(item=>{
      data.forEach(e=>{
        if(item.marketTenant === e.marketTenant){
          item.status = e.status
        }
      })
    })
    const marketV1 = window?.config?.feature?.subMarketV1 || [];
    const tenantV1 = marketV1?.map(item => item.tenant)
    const newList = res.filter(item => !!item.status)?.filter(item => !tenantV1.includes(item.marketTenant+''))?.map((item, index) => {
      const riskValue = item.status ? 100 - Number(item.riskIndex) : 0
      return {
        ...item,
        status: item.status,
        riskValue: riskValue,
        name: item.marketName,
        id: item.marketTenant,
        count: riskValue,
        width: riskValue,
      }
    }).sort((a, b) => {
      return b.riskValue - a.riskValue;
    })
    return newList
  } catch (error) {
  }
}

const changeTopTime = async () => {
  const result = await getData()
  eventItemList.value = [...result]?.map((item, index) => {
    return {
      ...item,
      rank: index + 1,
    };
  }).slice(0, 3);
};
const getSafetyRankApi =  async (param?: Record<string, any>): Promise<any> => {
  const result = await getData()
  const records = result?.map((item, index) => {
    return {
      ...item,
      rank: index + 1,
    };
  });
  return { total: 0, records: records, pages: 1 }
};

onMounted(() => {
  changeTopTime();
});
</script>
<style lang="less" scoped>
.chart {
  width: 1.80917rem;
  height: 450px;
  margin-bottom: 30px;
}

.content-tab {
  height: 40px;
  text-align: right;
  margin-top: 10px;
  position: relative;

  :deep(.ant-tabs-tab-btn) {
    color: #93aadb;
  }

  :deep(.ant-tabs-nav::after) {
    content: none;
  }

  :deep(.ant-tabs-nav::before) {
    content: none;
  }

  :deep(.ant-tabs-tab-active) {
    background: linear-gradient(
      180deg,
      rgba(97, 148, 247, 0.0196) 0%,
      rgba(97, 148, 247, 0.5) 96%
    );
    color: #6194f7;
  }

  :deep(.ant-tabs-tab) {
    height: 36px;
  }
}
.more {
  color:#93AADB;
  font-size: 14px;
  text-align: right;
  padding:4px;
  cursor: pointer;
}
.top-icon{
  display: inline-block;
  width: 28px;
  height: 28px;
  cursor: pointer;
  margin-left: 5px;
}
</style>
