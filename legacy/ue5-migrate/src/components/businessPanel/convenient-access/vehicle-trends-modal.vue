<template>
  <Modal title="车流通行记录" :width="1200" v-model="props.showModal" @close="closeModal" wrapClassName="traffic-records-modal">
    <template #modal-content>
      <div class="modal-layout">
        <div class="table-top">
          <a-form ref="selectForm" :model="search" layout="inline">
            <a-form-item label="时间">
              <a-config-provider :locale="zhCN">
                <a-range-picker :allowClear="false" v-model:value="search.date" value-format="YYYY-MM-DD" />
              </a-config-provider>
            </a-form-item>
            <a-form-item label="进出位置">
              <a-select allowClear style="width: 100px" v-model:value="search.parkingInfoCode">
                <a-select-option :value="item.value" v-for="item in statusOptions">{{ item.label }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" size="middle" @click="query">查询</a-button>
              <a-button size="middle" style="margin-left: 15px" @click="reset">重置</a-button>
            </a-form-item>
          </a-form>
        </div>
        <div class="table-staff">入场车辆：{{ inOut.inNum }}辆，出场车辆：{{ inOut.outNum }}辆</div>
        <div class="room-home-bottom">
          <a-table :scroll="{ y: 300 }" :pagination="false" :columns="columns" :dataSource="dataSource"></a-table>
          <a-pagination style="text-align: right; margin-top: 10px" @change="query" v-model:current="current" :total="total" />
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="tsx">
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import Modal from "@/components/modal-table/modal-layout.vue";
import moment from "moment"
import { ref, reactive,onMounted, watch} from 'vue'
import { parkingAccessRecords, parkingAccessTotal, parkingInfos } from '@/api/park-management'
const emit = defineEmits(["close"]);
interface Props {
  showModal: boolean;
  params:any
}
const inOut = ref({
  inNum: 0,
  outNum:0
})
const columns = [
      {
          title: "时间",
          dataIndex: "accessTime",
          key: "accessTime",
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
          title: "车牌号码",
          dataIndex: "vehicleNo",
          key: "vehicleNo",
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
          title: "出入场",
          dataIndex: "accessType",
          key: "accessType",
          ellipsis: true,
          align:'center',
          customRender: ({ text }) => {
            return (
              text == "ACCESS_IN" ? "入场" : "出场"
            );
          },
      },
      {
          title: "所属停车场",
          dataIndex: "parkingInfoName",
          key: "parkingInfoName",
          ellipsis: true,
          align:'center',
          customRender: ({ text }) => {
            return (
              text ? text : "--"
            );
          },
      },
      {
          title: "位置",
          dataIndex: "channelName",
          key: "channelName",
          ellipsis: true,
          align:'center',
          customRender: ({ text }) => {
            return (
              text ? text : "--"
            );
          },
      },
      {
          title: "图片",
          dataIndex: "imageUrl",
          key: "imageUrl",
          ellipsis: true,
          align:'center',
          customRender: ({ text }) => {
            return (
              <a-image
                width={50}
                height={50}
                src={text}
              />
            );
          },
      },
]
const statusOptions = ref([])
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
  typeName: '',
  pageSize: 10,
  pageNumber: 1,
});
watch(()=>props.showModal,() => {
  if (props.showModal) {
    search.date = props.params.period?props.params.period:[]
    query()
  }
})
const closeModal = () => {
  emit("close");
};
const query = async ()=>{
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
      pageSize:10,
      parkingInfoCode:search.parkingInfoCode
  }
 let res = await parkingAccessRecords(param)
 total.value = res.total
 dataSource.value = res.records
 inOut.value =  await parkingAccessTotal({parkingInfoCode:search.parkingInfoCode,period:arr?arr.join(','):''})
}
const getParkingInfos = async ()=>{
 const res = await parkingInfos()
 statusOptions.value = res.map(e=>{
  return {
    value:e.code,
    label:e.name
  }
 })
}
const reset = ()=>{
  search.date = props.params.period?props.params.period:[]
  search.parkingInfoCode = ''
  query()
}
onMounted(()=>{
  getParkingInfos()
})
</script>
<style lang="less" scoped>
.table-staff {
  color: #fff;
  font-size: 20px;
  margin-top: 10px;
}

:deep(.ant-form-item-label > label) {
  color: #fff;
}

:deep(.ant-select-selection-item) {
  color: #fff;
}

:deep(.ant-picker-input > input) {
  color: #fff;
}

:deep(.ant-table-thead > tr > th) {
  color: #fff;
  background: rgba(16, 40, 68, 0.8);
}

:deep(.ant-table-tbody > tr > td) {
  color: #fff;
  background: rgba(16, 40, 68, 0.8);
}

:deep(.ant-table-tbody > tr > td.ant-table-cell-row-hover) {
  background-color: rgba(16, 40, 68, 0.8);
}

:deep(.ant-table-cell) {
  background: rgba(16, 40, 68, 0.8);
  border-bottom: rgba(16, 40, 68, 0.8);
}

:deep(.ant-picker-clear) {
  background-color: #000;
}

:deep(.ant-pagination-item-ellipsis) {
  color: #fff !important;
}

:deep(.ant-pagination-item-link) {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

:deep(.ant-pagination-item) {
  background: rgba(255, 255, 255, 0.1);

  a {
    color: #fff;
  }
}

:deep(.ant-pagination-item-active) {
  background: #1890ff;

  a {
    color: #fff !important;
  }
}

.room-home-bottom {
  margin-top: 20px;
}
</style>
<style lang="less">
.traffic-records-modal {
  .ant-modal {
    width: 1000px !important;
    height: 620px;
    top: 50px !important;
  }

  .ant-form-item-label > label {
    color: #fff;
  }

  .ant-table-tbody > tr > td {
    color: #fff;
  }

  .ant-pagination-item a,
  .ant-pagination-item-link,
  .ant-pagination-item-ellipsis {
    color: #fff !important;
  }
}
</style>
