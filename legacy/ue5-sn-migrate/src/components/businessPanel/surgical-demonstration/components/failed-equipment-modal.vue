<template>
  <Modal :title="title" :width="1040" v-model="props.showModal" @close="closeModal" wrapClassName="modal-table-device">
    <template #modal-content>
      <div class="modal-layout">
        <div class="table-top">
          <a-form ref="selectForm" :model="search" layout="inline">
            <a-form-item label="时间">
              <a-config-provider :locale="zhCN">
                <a-range-picker v-model:value="search.date" value-format="YYYY-MM-DD" />
              </a-config-provider>
            </a-form-item>
            <a-form-item label="状态">
              <a-select style="width: 100px" v-model:value="search.alarmStatusEnum">
                <a-select-option :value="item.value" v-for="item in statusOptions">{{ item.label }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="设备名称">
              <a-input style="width: 150px" v-model:value="search.keyword"></a-input>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" size="middle" :loading="loading" @click="query">查询</a-button>
              <a-button size="middle" style="margin-left: 15px" @click="reset">重置</a-button>
            </a-form-item>
          </a-form>
        </div>
        <div style="margin-top: 15px">
          <a-table :pagination="false" :columns="columns" :dataSource="dataSource"></a-table>
        </div>
        <div style="height: 30px">
          <a-pagination style="float: right; margin-top: 15px" v-model:current="search.pageNumber"
            v-model:page-size="search.pageSize" @change="onShowSizeChange" :total="search.total" />
        </div>
      </div>
    </template>
  </Modal>
</template>
<script setup lang="ts">
import Modal from "@/components/modal-table/modal-layout.vue";
import { onMounted, reactive, ref, watch } from "vue";
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { storeMenu } from '@/piniaStore/menu'
import { storeArea } from '@/piniaStore/area'
import { alarmStatisticsList } from '@/api/alarm'
import moment from 'moment'

const statusOptions = ref([
{
    value: "ALARM_UN_CONFIRMED",
    label: "待接收"
  },
{
    value: "ALARM_PROGRESS_CONFIRMED",
    label: "处理中"
  },
{
    value: "ALARM_SUSPEND",
    label: "已挂起"
  },
{
    value: "ALARM_HANDLER",
    label: "已处理"
  },
])
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const columns = [
      {
          title: "序号",
          dataIndex: "index",
          key: "index",
          ellipsis: true,
          align:'center',
          width:80,
      },
      {
          title: "设备编码",
          dataIndex: "alarmTargetCode",
          key: "alarmTargetCode",
          align:'center',
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              text ? text : "--"
            );
          },
      },
      {
          title: "设备名称",
          dataIndex: "alarmTargetName",
          align:'center',
          key: "alarmTargetName",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              text ? text : "--"
            );
          },
      },
      {
          title: "所属区域",
          dataIndex: "areaName",
          key: "areaName",
          align:'center',
          ellipsis: true
      },      {
          title: "异常类型",
          dataIndex: "alarmTargetTypeName",
          key: "alarmTargetTypeName",
          align:'center',
          ellipsis: true,
      },      {
          title: "异常上报时间",
          dataIndex: "alarmTime",
          key: "alarmTime",
          width:180,
          align:'center',
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--"
            );
          },
      },     {
          title: "当前状态",
          dataIndex: "alarmStatusName",
          key: "alarmStatusName",
          ellipsis: true,
      },
]
const emit = defineEmits(["close"]);
interface Props {
  parameter?: any;
  title: string;
  showModal: boolean;
  alarmStatusEnum:string;
  date?:string[]
}
const props = withDefaults(defineProps<Props>(), {
  title: "",
  showModal: false,
  parameter: {},
  alarmStatusEnum:''
});
const closeModal = () => {
  emit("close");
};

const loading = ref(false);
const selectForm = ref();

interface RowItem {
  id: string | number;
  time: string;
  code: string;
  name: string;
  typeName: string;
  status: string;
  area: string;
}
const dataSource = ref([]);

const search = reactive<Record<string, any>>({
  ...props.parameter,
  alarmStatusEnum:props.alarmStatusEnum,
  date:props.date,
  keyword: '',
  area: '',
  typeName: '',
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});
const onShowSizeChange = async(current, size) => {
  search.pageNumber = current;
  search.pageSize = size;
  search.date = ''
  await query()
};
const query = async () => {
  let params = {
    alarmStatus:search.alarmStatusEnum,
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    keyword:search.keyword,
    pageSize: search.pageSize,
    pageNumber: search.pageNumber, 
    period:search.date?`${moment(search.date[0]).format('YYYY-MM-DD 00:00:00')},${moment(search.date[1]).format('YYYY-MM-DD 23:59:59')}`:''
  };
  let res: any = await alarmStatisticsList(params);
  search.total = res.total
  res.records.forEach((item,index)=>{
   item.index = index+1
  })
  dataSource.value = res.records
}
const reset = () => {
  search.pageNumber = 1;
  search.alarmStatusEnum = props.alarmStatusEnum
  search.date = props.date
  search.keyword = ''
  query()
};

onMounted(()=>{
  query()
})
</script>

<style lang="less" scoped>
:deep(.ant-select-selection-item) {
  color: #fff;
}

:deep(.ant-form-item-label > label) {
  color: #fff;
}

:deep(.ant-picker-input > input) {
  color: #fff;
}

:deep(.ant-picker-input > input::placeholder) {
  color: #fff;
}

:deep(.ant-table-thead > tr > th) {
  color: #fff;
}

:deep(.ant-table-tbody > tr > td) {
  color: #fff;
}

:deep(.ant-table-tbody > tr > td.ant-table-cell-row-hover) {
  background-color: transparent;
}

:deep(.ant-select-selector) {
  background: rgba(216, 216, 216, 0.1) !important;
  border: 1px solid rgba(96, 112, 128, 0.6) !important;
}

:deep(.ant-picker-range) {
  background: rgba(216, 216, 216, 0.1) !important;
  border: 1px solid rgba(96, 112, 128, 0.6) !important;
}

:deep(.ant-table-cell) {
  background: rgba(16, 40, 68, 0.8);
  height: 48px;
  border-bottom: rgba(16, 40, 68, 0.8);
}

.table_header {
  background: rgba(16, 40, 68, 0.8);
  height: 48px;
  display: flex;
  color: #fff;
  line-height: 48px;

  div {
    width: 20%;
    text-align: center;
    padding: 0 15px;
  }
}

.table_content {
  // display: flex;
  color: #fff;

  .no-content {
    display: flex;
    justify-content: center;

    :deep(.content) {
      margin-top: 10%;
    }
  }

  .content {
    display: flex;

    div {
      width: 20%;
      line-height: 48px;
      text-align: center;
      height: 48px;
      border-bottom: 1px solid rgba(105, 116, 140, 0.5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

:deep(.ant-pagination-item-ellipsis) {
  color: #fff !important;
}

.overflow {
  overflow: hidden; //超出的文本隐藏
  text-overflow: ellipsis; //溢出用省略号显示
  white-space: nowrap;
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
    color: #fff;
  }
}

:deep(.ant-modal-content) {
  background-color: rgba(4, 17, 32, 0.92) !important;
}

:deep(.modal-width) {
  width: 940px !important;
}

:deep(.ant-table-tbody > tr > td.ant-table-cell-row-hover) {
  background-color: rgba(16, 40, 68, 0.8);
}
:deep(.ant-picker-clear) {
  background-color: #000;
}
</style>
<style lang="less">
.modal-table-device {
  .modal-width {
    width: 940px !important;
  }

  a {
    color: #2989FF;
  }
}

</style>