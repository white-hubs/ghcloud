<template>
  <SubPanelTemplate title="工程巡查记录" image="xs-c2.png" class="gz">
    <template #extra>
      <DateInlineForm v-model:modelValue="safetyWorkTime" @search="changeWorkOrderTime" menuPage="smallProject" />
    </template>
    <div class="more" @click="handleMore">查看更多></div>
    <template v-if="list.length">
      <div class="alarm-list" v-for="item in list" :key="item.id">
        <div class="alarm-item" @click="clickRow(item)">
          <div class="alarm-item-left">
            <img v-if="!item?.imgs?.path"  class="alarm-image" :src="getSnImage('alarm-default.png')" alt="" srcset="">
            <img v-else :src="httpImgUrl(item?.imgs?.path || '')" alt="" class="alarm-image"
            @error="handleImageError"
            />
          </div>
          <div class="alarm-item-right">
            <div class="alarm-item-content">
              <div class="alarm-item-header">
                <div class="market-name">{{item.marketName}}</div>
                <div class="alarm-time">{{dayjs(item.time).format('YYYY-MM-DD HH:mm:ss')}}</div>
              </div>
              <div class="alarm-item-info">
                <div class="task-name">工程名称: {{item.targetName || '--'}}</div>
                <div class="status-tag" :class="item.result === 'ABNORMAL' ? 'abnormal' : 'normal'">
                  {{ item.result === 'ABNORMAL' ? '异常' : '正常' }}
                </div>
              </div>
              <div class="error-item">异常项: {{item.errorItem || '--'}}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <NoData class="modal-layout" v-else></NoData>
  </SubPanelTemplate>
  <inspectAbnormalRecord
    :marketName="marketTenant"
    v-if="showInspectModel"
    :time="safetyWorkTime.dateRange.join(',')"
    :title="'工程巡查记录'"
    :show-modal="showInspectModel"
    @close="showInspectModel = false"
  ></inspectAbnormalRecord>
  <Modal :show="detailModalShow" title="工程巡查记录" @close="closeModal">
    <inspect v-if="detailModalShow" @close="closeModal" :parameter="inspectParameter" ></inspect>
  </Modal>
</template>

<script setup lang="ts">
import { getSnImage } from '@/utils/getImage'
import { ref, reactive,onMounted} from 'vue'
import NoData from "@/components/businessPanel/public/noData.vue";
import SubPanelTemplate from "../../common/snPanelTemplate.vue";
import DateInlineForm from "../../common/dateInlineForm.vue";
import { ModelValueItf } from "../../../businessPanel/public/types";
import { storeMarket } from "@/piniaStore/other";
import dayjs from 'dayjs'
import { safetyMarketInspectRecord } from "@/api/shennong/small-project"
import { getErrItemTagRecordDetail, getVideoFilePathsSn, loginSessionSn } from '@/api/snMarket'
import { isHttpUrl } from "@/utils/common";
import { openAlarmDetail } from '@/components/hooks/useAlarm'
import inspect from "./inspect-detail/index.vue";
import inspectAbnormalRecord from "./inspect-abnormal-record.vue";
import Modal from "@/components/modal-table/modal.vue";
import useEscClose from '@/components/hooks/useEscClose';

const props = withDefaults(
  defineProps<{
    applicationCode: string;
  }>(),
  {
    applicationCode: "SMALL_ENGINEERING",
  }
);
const safetyWorkTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const piniaStoreMarket = storeMarket();
const list = ref([]);
const changeWorkOrderTime = async ()=>{
  let param = {
    period: safetyWorkTime.value.dateRange.join(","),
    type: safetyWorkTime.value.timeType,
    pageSize: 5,
    pageNumber: 1,
    marketTenant: '',
    businessType: 'SMALL_ENGINEERING',
  };
  
  let { records } = await safetyMarketInspectRecord(param);
  for (let i = 0; i < records.length; i++) {
    try {
      await openAlarmDetail(records[i])
      const result = await getInfo(records[i].id)
      const imgs = result?.standardVOS?.map((item) => {
        const fileVO = item?.itemVOS?.find(e => e.fileVOS?.find(f => f.path || f.endpointPath))
        return fileVO
      }).filter(item => item)
      records[i].imgs = imgs[0]?.fileVOS?.[0]
    } catch (error) {
      records[i].imgs = {}
    }
  }
  list.value = records
}
const getInfo = async (id): Promise<any> => {
  const res = await getErrItemTagRecordDetail({ id: id, businessType: 'SMALL_ENGINEERING' })
  return res
};
const httpImgUrl = (path) => {
  let url = ''
  const baseUrl = sessionStorage.getItem("market-baseUrl");
  if(!isHttpUrl(path)){
    url = baseUrl + path
  }else{
    url = path
  }
  return url
}
const detailModalShow = ref<boolean>(false);
const inspectParameter = ref<Record<string, any>>({
  applicationCode: props.applicationCode,
  id: "",
  marketTenant: "",
  marketName: "",
  dateRange: ""
});
const clickRow = async (record) => {
  await openAlarmDetail(record, (res)=>{
    inspectParameter.value = Object.assign(inspectParameter.value, record);
  })
  detailModalShow.value = true;
};
const closeModal = () => {
  detailModalShow.value = false
};
useEscClose(() => {
  if (detailModalShow.value) {
    closeModal();
  }
});

const handleMore = () => {
  showInspectModel.value = true;
}

const marketTenant = ref("");
const showInspectModel = ref(false);

const handleImageError = (event) => {
  const img = event.target;
  img.status = 'error';
  img.src = getSnImage('alarm-default.png');
};

</script>
<style lang="less" scoped>
.alarm-list {
  .alarm-item {
    padding: 8px 16px;
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    height: 82px;
    // background: linear-gradient(90deg, rgba(0, 34, 61, 0.00), #002a56 50%, #002a56 51%, rgba(9, 49, 114, 0.00));
    background: url("/resource/v1/ue5-sn-migrate/assets/images/sn/xs-bg.png") no-repeat;
    background-size: 100% 100%;
    cursor: pointer;
    .alarm-item-left {
      flex-shrink: 0;
      margin-right: 14px;

      .alarm-image {
        width: 62px;
        height: 62px;
        border-radius: 4px;
        object-fit: cover;
      }
    }

    .alarm-item-right {
      flex: 1;
      overflow: hidden;
      
      .alarm-item-content {
        width: 100%;
        
        .alarm-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .market-name {
            font-size: 14px;
            color: #93AADB;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 150px;
          }
          
          .alarm-time {
            font-size: 12px;
            color: #8D98B0;
          }
        }
        
        .alarm-item-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          .task-name {
            font-size: 16px;
            color: #D9E5FF;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 200px;
          }
          
          .status-tag {
            padding: 2px 6px;
            border-radius: 2px;
            font-size: 12px;
            
            &.abnormal {
              background: rgba(255, 0, 0, 0.15);
              border: 0.5px solid rgba(255, 187, 187, 0.50);
              color: #FF4D4F;
            }
            
            &.normal {
              background: rgba(82, 196, 26, 0.15);
              border: 0.5px solid rgba(183, 235, 143, 0.50);
              color: #52C41A;
            }
          }
        }
        
        .error-item {
          font-size: 14px;
          color: #8D98B0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}

.more {
  color:#93AADB;
  font-size: 14px;
  text-align: right;
  padding:4px;
  cursor: pointer;
}
</style>