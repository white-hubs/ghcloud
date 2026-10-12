<template>
  <SubPanelTemplate title="工程巡查异常记录">
    <template #extra>
      <div class="flex-align">
        <DateInlineForm v-model:modelValue="timeFrame" @search="getAlarmLevel" />
      </div>
    </template>
    <div class="dataTitle">
      <div class="dataTitle-right" style="color: #5EA6FF;" @click="handleAll">查看更多>></div>
    </div>
    <div class="abnormal-statistics">
      <vue3-seamless-scroll :list="lists" :step="lists.length>4?0.5:0" hover :singleHeight="40" :waitTime="1000">
        <div class="abnormal-statistics-item" @click="detail(item)" v-for="item in lists" :key="item.id">
          <div class="abnormal-statistics-item-left">
            <img v-if="item?.fileVO?.path" :src="item?.fileVO?.path" alt="" srcset="">
            <img v-else :src="getAssetsImage('alarm-default.png')" alt="" srcset="">
          </div>
          <div class="abnormal-statistics-item-right">
            <div class="abnormal-statistics-item-right-top">
              <!-- <div>{{ item.targetName }}</div> -->
              <div>{{ dayjs(item.time).format("YYYY-MM-DD HH:mm:ss") }}</div>
            </div>
            <div class="abnormal-statistics-item-right-middle">
              <div class="right-middle-title">{{item.targetName}}</div>
              <div class="right-middle-type">异常</div>
            </div>
            <div class="abnormal-statistics-item-right-bottom">
              <div>异常项:</div>
              <div>{{item.errorItem}}</div>
            </div>
          </div>
        </div>
      </vue3-seamless-scroll>
    </div>
  </SubPanelTemplate>
    <inspect ref="inspectRef" :title="'巡查记录详情'" v-if="alarmModalShow" :parameter="inspectParameter"
      @close="alarmModalShow = false"></inspect>

  <modal-table :modalStyle="{width:'900px'}" v-if="inspectionRecordShow" :show="inspectionRecordShow" title="巡检记录列表"
    @close="()=>inspectionRecordShow = false">
    <inspect-record :parameter="inspectListParameter"></inspect-record>
  </modal-table>

</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from '../public/types'
import { getAssetsImage } from "@/utils/getImage";
import { inspectAnalysisTaskRecordPage } from "@/api/maintain";
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";
import dayjs from "dayjs";
import inspect from "./components/inspect-detail/index.vue";
import inspectRecord from "./components/inspect-record.vue";
import modalTable from '@/components/modal-table/modal.vue'

const inspectParameter = ref({
  id:'',
  businessType:""
})
const inspectListParameter = ref({
  period:[],
  businessType:"SMALL_ENGINEERING",
  title:'工程巡查异常记录',
})
const alarmModalShow = ref(false)
const inspectionRecordShow = ref(false)
let timeFrame = ref<ModelValueItf>();
const lists = ref([])
const getAlarmLevel = async ()=>{
 const res = await inspectAnalysisTaskRecordPage(
    {
      pageNumber:1,
      pageSize:10,
      period:timeFrame.value.dateRange.join(","),
      businessType:'SMALL_ENGINEERING',
      result:'ABNORMAL'
    }
  )
  lists.value = res.records
}
const detail = (item)=>{
  
  inspectParameter.value.id = item.id
  inspectParameter.value.businessType = 'SMALL_ENGINEERING'
  alarmModalShow.value = true
}
const handleAll = ()=>{
  inspectListParameter.value.period = timeFrame.value.dateRange
  inspectionRecordShow.value = true
}
</script>
<style lang="less" scoped>
.abnormal-statistics {
  margin-top: 10px;
  overflow: hidden;

  .abnormal-statistics-item {
    padding: 8px;
    display: flex;
    align-items: center;
    margin-top: 10px;
    height: 90px;
    cursor: pointer;
    background: linear-gradient(90deg, rgba(0, 34, 61, 0.00), #002a56 50%, #002a56 51%, rgba(9, 49, 114, 0.00));

    .abnormal-statistics-item-left {
      img {
        width: 62px;
        height: 62px;
      }
    }

    .abnormal-statistics-item-right {
      margin-left: 20px;
      flex: 1;

      .abnormal-statistics-item-right-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 2px;

        div {
          font-size: 14px;
          color: #8FA0C5;
        }
      }

      .abnormal-statistics-item-right-middle {
        display: flex;
        align-items: center;
        margin-top: 2px;

        div {
          font-size: 20px;
          color: #d9e5ff;
        }

        .right-middle-title {
          color: #fff;
          font-size: 20px;
        }

        .right-middle-type {
          color: #d9e5ff;
          font-size: 14px;
          padding: 5px 7px;
          font-size: 13px;
          border-radius: 4px;
          margin-left: 6px;
          background: rgba(255, 0, 0, 0.15);
          border: 0.5px solid rgba(255, 187, 187, 0.50);
          box-shadow: 0px 0px 9px 0px rgba(255, 114, 114, 0.50) inset;
          color: #ffcece;
        }
      }

      .abnormal-statistics-item-right-bottom {
        display: flex;
        align-items: center;
        margin-top: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        div {
          font-size: 14px;
          color: #7A89A9;

        }
      }
    }
  }
}

.dataTitle {
  color: #ABB8CB;
  font-size: 14px;
  text-align: right;

  .dataTitle-right {
    cursor: pointer;
  }
}
</style>