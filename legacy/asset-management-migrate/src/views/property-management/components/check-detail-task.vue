<template>
  <div class="detai-content">
    <div class="info-title">
      盘点任务
    </div>

    <Table :columns="columns" :data-source="dataSource" :pagination="false" :scroll=" {x: 1000}" size="small" bordered
      :loading="loading" style="margin:10px 0" />
  </div>
</template>
<script setup lang="ts">
import { h, onMounted, ref } from 'vue';
import { Popover, type TableColumnType } from 'ant-design-vue'
import dayjs from 'dayjs'
import { queryTaskByPlan } from '@/api/asset-management/asset-management'

const props = withDefaults(defineProps<{
  id:string;
}>(), {})
const loading = ref(false)
const dataSource = ref<unknown[]>([])
const columns: TableColumnType[] = [
  {
    title: '序号',
    width: 70,
    align: 'center',
    customRender: ({ index }) => `${index + 1}`
  },
  {
    title: '盘点任务名称',
    dataIndex: 'taskName',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '盘点资产数量',
    dataIndex: 'checkTotalNumber',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '盘点人员',
    dataIndex: 'checkUserName',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '所在部门',
    dataIndex: 'checkDepName',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '任务状态',
    dataIndex: 'status',
    ellipsis: true,
    customRender: ({ text }) => {
      if(text){
        text=text==='UNDONE'?'未完成':'已完成'
      }
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '完成时间',
    dataIndex: 'realityEndTime',
    ellipsis: true,
    customRender: ({ text }) => {
      const time = text ? dayjs(text).format('YYYY-MM-DD') : '--'
      return [
        h(Popover, { content: time }, { default: () => time })
      ]
    }
  }
];

const getTableData = async () => {
  loading.value = true;
  try {
    const res = await queryTaskByPlan(props.id);
    if (res.data) {
      dataSource.value = res.data;
    }
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
}

onMounted(async () => {
  getTableData()
})


</script>
<style lang="less">
.detai-content {
  .templete-form-horizontal .templete-form-item-control-input-content {
    max-width: 300px !important;
    word-break: break-word;
    width: 100% !important;
  }

  .templete-form-item-label {
    width: 105px !important;
  }
}
</style>
<style lang="less" scoped>
:deep(.content-search) {
  display: none;
}

:deep(.content-table) {
  overflow: overlay !important;
}

.asset-management-pagination {
  display: flex;
  justify-content: flex-end;
}

.avatar-uploader>.templete-upload {
  width: 128px;
  height: 128px;
}

.templete-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.templete-upload-select-picture-card .templete-upload-text {
  margin-top: 8px;
  color: #666;
}

.detai-content {
  padding: 0 16px;

  .item-info {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
  }

  .asset-management-form-item {
    width: 45%;
    margin-right: 40px;
    margin-bottom: 16px;

    .asset-management-picker,
    .asset-management-input-number {
      width: 100%;
    }
  }

  .info-title {
    width: 100%;
    height: auto !important;
    text-align: left;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 10px;
    color: rgba(0, 0, 0, .8509803921568627);
    font-family: PingFang SC-Medium;
  }
}
</style>
