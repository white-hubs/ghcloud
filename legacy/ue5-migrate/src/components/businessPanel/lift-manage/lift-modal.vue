<template>
  <Modal title="五方通话记录" :width="1200" v-model="props.showModal" @close="closeModal" wrapClassName="traffic-records-modal">
    <template #modal-content>
      <div class="modal-layout">
        <div class="table-top">
          <a-form ref="selectForm" :model="search" layout="inline">
            <a-form-item label="时间">
              <a-config-provider :locale="zhCN">
                <a-range-picker v-model:value="search.date" value-format="YYYY-MM-DD" />
              </a-config-provider>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" size="middle" @click="query(1)">查询</a-button>
              <a-button size="middle" style="margin-left: 15px" @click="reset">重置</a-button>
            </a-form-item>
          </a-form>
        </div>
        <div class="room-home-bottom">
          <a-table :scroll={y:400} :pagination="false" :columns="columns" :dataSource="dataSource"></a-table>
          <a-pagination style="text-align: right;margin-top: 10px;" @change="query" v-model:current="current"
          v-model:page-size="search.pageSize" :total="total" />
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import Modal from "@/components/modal-table/modal-layout.vue";
import moment from "moment"
import { ref, reactive,onMounted, watch} from 'vue'
import { liftFiveCallLogPage } from '@/api/securitymanagement'
import dayjs from 'dayjs'
const emit = defineEmits(["close"]);
interface Props {
  showModal: boolean;
  params:any
}
const columns = [
      {
        title: '来电人信息',
        dataIndex: 'caller',
        key: 'caller',
        align: 'center',
      },
      {
        title: '日期',
        dataIndex: 'callTime',
        key: 'callTime',
        align: 'center',
        customRender: ({ text }: { text: number; }) => {
          return text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
        }
      },
      {
        title: '电梯编号',
        dataIndex: 'liftNumber',
        key: 'liftNumber',
        align: 'center'
      },
      {
        title: '所在区域',
        dataIndex: 'areaName',
        key: 'areaName',
        align: 'center'
      },
      {
        title: '通话内容',
        dataIndex: 'callContent',
        key: 'callContent',
        align: 'center'

      }, {
        title: '处理情况',
        dataIndex: 'handlingSituation',
        key: 'handlingSituation',
        align: 'center'
      },
    ]
const current = ref(1)
const total = ref(0)
const dataSource = ref([])
const props = withDefaults(defineProps<Props>(), {
  title: "",
  showModal: false,
  params:{}
});
const search = reactive<Record<string, any>>({
  date:[],
  eventResult:'',
  keyword: '',
  typeName: '',
  pageSize: 10,
  pageNumber: 1,
});

const closeModal = () => {
  emit("close");
};
const query = async (pageNumber?:number)=>{
  if (pageNumber) {
    current.value = pageNumber
  }
  let time = search.date?search.date:[]
 let arr = time.map((item,index)=>{
    if (index===0) {
      item = moment(item).format('YYYY-MM-DD 00:00:00')
    }else{
      item = moment(item).format('YYYY-MM-DD 23:59:59')
    }
   return item
  })
  let param ={
      period:arr?arr.join(','):'',
      pageNumber:current.value,
      pageSize:search.pageSize, 
  }
 let res = await liftFiveCallLogPage(param)
 total.value = res.total
 dataSource.value = res.records
}
const reset = ()=>{
  search.keyword = ''
  search.eventResult = ''
  search.date = []
  search.pageSize=10,
  search.pageNumber= 1,
  query()
}
onMounted(()=>{
  query()
})
</script>
<style lang="less" scoped>
.table-staff {
  color: #fff;
  font-size: 20px;
  margin-top: 10px;
}

:deep(.ant-table-thead > tr > th) {
  color: #fff;
  background: rgba(16, 40, 68, 0.8);
}

.room-home-bottom {
  margin-top: 20px;
}

:deep(.ant-table-tbody > tr > td.ant-table-cell-row-hover) {
  background-color: rgba(16, 40, 68, 0.8);
}

:deep(.ant-picker-clear) {
  background-color: #000;
}

:deep(.ant-pagination-item-active a) {
  color: #fff !important;
}
</style>
<style lang="less">
.traffic-records-modal {
  .ant-modal {
    width: 1000px !important;
    height: 620px;
    top: 50px !important;
  }
}
</style>