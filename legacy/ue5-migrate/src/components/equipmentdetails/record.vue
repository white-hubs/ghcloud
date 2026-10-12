<template>
  <div class="status-bar">
    <div class="status-bar-item">
      <span><alert-outlined style="color:#F14545;font-size: 16px;margin-right: 5px;" />告警总次数: </span>
      <div>{{ total }}</div>
    </div>
    <div class="status-bar-item status-bar-right">
      <span><warning-outlined style="color:#FFA100;font-size: 16px;margin-right: 5px;" />处理中: </span>
      <div>{{ handlingNum }}</div>
    </div>
  </div>
  <div class="title">
    <span>近期异常情况概览: </span>
  </div>
  <a-table :scroll="{y:180}"  :dataSource="dataSource" :columns="columns" :pagination="false" />
  <div class="page">
    <a-pagination v-model:current="pagination.pageNumber" v-model:pageSize="pagination.pageSize"
      :total="pagination.total" :default-current="1" :show-total="(total: number) => `共 ${total} 条数据`"
      @change="pageChange" :show-size-changer="false" />
  </div>
</template>
<script setup lang="ts">
import { alarmStatisticsList, getstatus } from '@/api/alarm';
import { AlarmTakeNotesList } from '@/api/models/alarm';
import dayjs from 'dayjs';
import { onMounted, ref } from 'vue';
import {
  AlertOutlined,
  WarningOutlined
} from '@ant-design/icons-vue';
const props = withDefaults(defineProps<{
  code: string
  id: string
}>(), {})

const pagination = ref({
  pageSize: 5,
  pageNumber: 1,
  total: 0
})
const total = ref(0)
const dataSource = ref<AlarmTakeNotesList[]>([])
const handlingNum=ref(0)

const columns = ref([
  {
    title: '序号',
    width: 80,
    align: 'center',
    customRender: ({ index }: { index: number; }) => `${index + 1}`
  },
  {
    title: '异常类型',
    align: 'center',
    dataIndex: 'alarmTypeName',
  },
  {
    title: '上报时间',
    align: 'center',
    dataIndex: 'alarmTime',
    customRender: ({ text }: { text: string; }) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
  },
  {
    title: '异常详情',
    align: 'center',
    dataIndex: 'alarmEventName',
  },
  {
    title: '当前状态',
    align: 'center',
    dataIndex: 'alarmStatusName',
  }
])

const getTableData = () => {
  alarmStatisticsList({ alarmTargetCode: props.id,pageSize:pagination.value.pageSize,pageNumber:pagination.value.pageNumber }).then(res => {
    dataSource.value = res.records
    total.value = res.total
    pagination.value.total=res.total
  })
  getstatus({alarmTargetCode:props.code}).then(res=>{
    handlingNum.value=res.alarmStatusStatistics[1].alarmNum
  })
}

const pageChange = (pageNumber: number, pageSize: number) => {
  pagination.value.pageNumber = pageNumber || 1;
  pagination.value.pageSize = pageSize;
  getTableData();
};

onMounted(()=>{
  getTableData()
})
</script>
<style scoped lang="less">
.title {
  width: 100%;
  color: #ABB8CB;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 10px;

  span {
    display: inline-block;
    width: 50%;
    margin-bottom: 10px;
  }
}

:deep(.ant-table) {
  background-color: transparent;
}
:deep(.ant-table-thead) {
  background: rgba(86,142,255,0.2);
}

:deep(.ant-table-container) {
  background-color: transparent;
}

:deep(.ant-table-content) {
  background-color: transparent;
}

:deep(.ant-table-thead) {
  th {
    background-color: rgba(16, 40, 68, 0.4x);
  }
}

:deep(.ant-table-tbody) {
  td {
    background-color: transparent;
    border-bottom: thin solid rgba(105, 116, 140, 0.50);
  }

  tr:hover:not(.ant-table-expanded-row):not(.ant-table-row-selected)>td {
    //自定义table行hover上去的背景颜色
    background: transparent;
    cursor: default;
  }
}

:deep(.ant-empty) {
  color: #d0deee;
}

.page {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;

  :deep(.ant-pagination-total-text) {
    color: white;
  }
}

.status-bar {
  font-size: 16px;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .status-bar-item {
    flex: 1;
    height: 46px;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(85deg, rgba(241, 69, 69, 0.3) 0%, rgba(241, 69, 69, 0.1) 100%);

    div {
      font-weight: bold
    }
  }

  .status-bar-right {
    margin-left: 10px;
    background: linear-gradient(270deg, rgba(255, 161, 0, 0.3) 0%, rgba(255, 161, 0, 0.1) 100%);
  }
}
:deep(.ant-table-placeholder) {
  background: transparent !important;
}
:deep(.ant-table-header){
  background: transparent !important;
}
</style>