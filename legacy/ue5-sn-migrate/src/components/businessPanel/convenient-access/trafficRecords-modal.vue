<template>
  <Modal title="通行记录" :width="1200" v-model="props.showModal" @close="closeModal" wrapClassName="traffic-records-modal">
    <template #modal-content>
      <div class="modal-layout">
        <div class="table-top">
          <a-form ref="selectForm" :model="search" layout="inline">
            <a-form-item label="时间">
              <a-config-provider :locale="zhCN">
                <a-range-picker v-model:value="search.date" value-format="YYYY-MM-DD" />
              </a-config-provider>
            </a-form-item>
            <a-form-item label="门禁名称">
              <a-input style="width: 150px" v-model:value="search.keyword"></a-input>
            </a-form-item>
            <a-form-item label="通行结果">
              <a-select style="width: 100px" v-model:value="search.eventResult">
                <a-select-option :value="item.value" v-for="item in statusOptions">{{ item.label }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" size="middle" @click="query(1)">查询</a-button>
              <a-button size="middle" style="margin-left: 15px" @click="reset">重置</a-button>
            </a-form-item>
          </a-form>
        </div>
        <div class="table-staff">通行人员：{{ passingPersonnel }}名</div>
        <div class="room-home-bottom">
          <a-table :pagination="false" :columns="columns" :dataSource="dataSource"></a-table>
          <a-pagination style="text-align: right;margin-top: 10px;" @change="query" v-model:current="current"
            :total="total" />
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { getDoorEventRecord, passedNumByDay, visualizationEvent } from '@/api/door'
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import Modal from "@/components/modal-table/modal-layout.vue";
import moment from "moment"
import { ref, reactive,onMounted, watch} from 'vue'
const emit = defineEmits(["close"]);
interface Props {
  showModal: boolean;
  params:any
}
const passingPersonnel = ref(0)
const statusOptions = [
{
    value: "DO_PASS",
    label: "通过",
  },
  {
    value: "DO_REFUSE",
    label: "拒绝",
  },
]
const columns = [
      {
          title: "时间",
          dataIndex: "eventTime",
          key: "eventTime",
          ellipsis: true,
          align:'center',
          width: 160,
          customRender: ({ text }) => {
            return (
              text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--"
            );
          },
      },
      {
          title: "门禁名称",
          dataIndex: "doorName",
          key: "doorName",
          ellipsis: true,
          align:'center',
          width: 160,
          customRender: ({ text }) => {
            return (
              text ? text : "--"
            );
          },
      },
      {
          title: "通行人员",
          dataIndex: "personName",
          key: "personName",
          ellipsis: true,
          align:'center',
          customRender: ({ text }) => {
            return (
              text ? text : "--"
            );
          },
      },
      {
          title: "通行方式",
          dataIndex: "eventWay",
          key: "eventWay",
          ellipsis: true,
          align:'center',
          customRender: ({ text }) => {
            return (
              text ? text : "--"
            );
          },
      },
      {
          title: "通行事件",
          dataIndex: "eventName",
          key: "eventName",
          ellipsis: true,
          align:'center',
          customRender: ({ text }) => {
            return (
              text ? text : "--"
            );
          },
      },
      {
          title: "通行结果",
          dataIndex: "eventResult",
          key: "eventResult",
          ellipsis: true,
          align:'center',
          customRender: ({ text }) => {
            return (
              text == "DO_PASS" ? "通过" : "拒绝"
            );
          },
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
watch(()=>props.showModal,() => {
  if (props.showModal) {
    search.date = props.params.date?props.params.date:[]
    search.eventResult = props.params.eventResult
    query()
  }
})
const closeModal = () => {
  emit("close");
};
const query = async (pageNumber?:number) => {
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
      keyword:search.keyword,
      period:arr?arr.join(','):'',
      pageNumber:current.value,
      eventResult:search.eventResult,
      pageSize:10, 
  }
 let res = await getDoorEventRecord(param)
 passingPersonnel.value = await passedNumByDay({period:arr?arr.join(','):'',keyword:search.keyword,eventResult:search.eventResult})
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