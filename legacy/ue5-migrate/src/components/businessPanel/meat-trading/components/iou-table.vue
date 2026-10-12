<template>
  <Modal :title="title" :show="showModal" @close="cancel">
    <div class="modal-layout">
      <div class="top">
        <div class="top_content">
          <div>交易重量</div>
          <div style="font-size:24px;color:#2989FF;">
            {{ tradingWeight.currentWeight }} <span style="font-size:16px;">环比<caret-up-outlined color="#F14545" /><span>{{ tradingWeight.qoqTradeWeight }}%</span></span>
          </div>
        </div>
      </div>
      <div class="content">
        <div>
          <tableData :dataSource="tradingWeight.currentDateWeightList" :columns="columns"></tableData>
        </div>
        <div class="vs">vs</div>
        <div>
          <tableData :dataSource="tradingWeight.lastDateWeightList" :columns="columns"></tableData>
        </div>
      </div>
    </div>
  </Modal>
</template>
<script setup lang="ts">
import Modal from "../../../../components/modal-table/modal.vue";
import tableData from './tableData.vue';
import type { TableColumnType } from 'ant-design-vue';
import { onMounted, reactive, ref, watch } from "vue";
import {CaretUpOutlined} from '@ant-design/icons-vue'
import { summaryWeightList } from "@/api/slide";
import { ResTransactionWeightListponse } from "@/api/models/slide";
const UE5_MEAT_IMG = '/resource/v1/ue5-migrate/components/businessPanel/meat-trading/img'
const qua_blue = `${UE5_MEAT_IMG}/qwa_blue.png`
const qua_yellow = `${UE5_MEAT_IMG}/qua_yellow.png`
import { setTimeType } from "@/utils/common";
interface Props {
  title:string,
  showModal:boolean,
  time:any
}
const emit = defineEmits(["close"]);
const tradingWeight = reactive<ResTransactionWeightListponse>({
currentDateWeightList: [],
currentWeight: 0,
lastDateWeightList: [],
lastWeight: 0,
qoqTradeWeight: 0
})
const activeKey=ref('1')
const columns=ref<TableColumnType[]>([
{
    title: '时间',
    dataIndex: 'summaryDate',
    sorter: true,
   
  },
{
    title: '重量(kg)',
    dataIndex: 'summaryWeight',
    sorter: true,
   
  },
])
const props = withDefaults(defineProps<Props>(),{
  title:'交易信息详情',
  showModal:false,
  time:'TODAY'
})
watch(
  () => props.time,
  () => {
    getTableData()
  }
);
const cancel = ()=>{
  emit("close");
}
const getTableData = async() =>{
  let res =await summaryWeightList({type:setTimeType(props.time)})
  Object.assign(tradingWeight,res)
}
onMounted(() => {
  getTableData()
})
</script>

<style lang="less" scoped>
.top {
  display: flex;
  justify-content: space-between;

  .top_content {
    width: 100%;
    background: rgba(0, 0, 0, 0.2);
    height: 52px;
    display: flex;
    justify-content: space-between;
    line-height: 52px;
    padding: 0 16px;
    box-sizing: border-box;

    div {

      color: #fff;
    }

    img {
      margin-left: 10px
    }
  }
}

.content {

  display: flex;
  justify-content: space-between;
 position: relative;
  div {
    width: 100%;
  }

  .vs {
    margin-top: 40px;
    width: 20%;
    width: 48px;
    height: 43px;
    font-size: 36px;
    font-family: Abolition-RoundOblique-Regular, Abolition-RoundOblique;
    font-weight: 400;
    line-height: 43px;
    background: linear-gradient(180deg, #FFA800 0%, #58FAB6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

:deep(.ant-tabs-tab-btn) {
  color: #fff
}
</style>