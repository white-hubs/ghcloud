<template>
  <Card title="耗材领用明细表" style="width: 100%;margin-bottom: 16px;" class="table consumable-requisition-table">
    <AliasTable :columns="columns" :data-source="dataSource" :pagination="false" size="small"
      bordered :loading="loading" 
      :screenX="1000"
      :screenY="175"
      :applicationCode="applicationCode" 
      tableCode="CONSUMABLE_REQUISITION"
    />
    <div style="display: flex;justify-content: flex-end;margin-top: 20px;">
      <Pagination v-model:current="pagination.pageNumber" v-model:pageSize="pagination.pageSize" show-size-changer
        :total="pagination.total" :default-current="1" :show-total="(total: number) => `共 ${total} 条数据`"
        @change="pageChange" />
    </div>
  </Card>
</template>
<script setup lang="ts">
import { getConsumableReduceRecordDetailPage } from '@/api/asset-management/asset-management'
import { translateAmount } from '@/utils/tool'
import { Popover, type TableColumnType } from 'ant-design-vue'
import dayjs from 'dayjs'
import { h, ref } from 'vue'
import { AliasTable } from '@ghcloud/generic-component'

const props = withDefaults(defineProps<{
  dimension:string;
  period:string;
}>(), {})
const applicationCode = __ENV__.applicationCode
const loading = ref(false)
const dataSource = ref<unknown[]>([])
const pagination = ref({
  pageSize: 10,
  pageNumber: 1,
  total: 0
})
const tableRef = ref()
const screenY = ref(175)
const getTableData = async (deptId="") => {
  const params = {
    pageNumber: pagination.value.pageNumber,
    pageSize: pagination.value.pageSize,
    dimension: props.dimension,
    period: props.period,
    deptId,
  };
  loading.value = true;
  try {
    const res = await getConsumableReduceRecordDetailPage(params);
    if (res.data) {
      const { records, total } = res.data;
      dataSource.value = records;
      pagination.value.total = total;
    }
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
}
const pageChange = (pageNumber: number, pageSize: number) => {
  pagination.value.pageNumber = pageNumber || 1;
  pagination.value.pageSize = pageSize;
  getTableData();
};

const columns: TableColumnType[] = [
  {
    title: '序号',
    width: 70,
    align: 'center',
    customRender: ({ index }) => `${index + 1}`
  },
  {
    title: '部门名称',
    dataIndex: 'deptName',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '耗材名称',
    dataIndex: 'name',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '耗材编码',
    dataIndex: 'code',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '分类名称',
    dataIndex: 'categoryName',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '仓库',
    dataIndex: 'storeName',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '品牌',
    dataIndex: 'brand',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '单位',
    dataIndex: 'unit',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '处理时间',
    dataIndex: 'reduceDate',
    ellipsis: true,
    customRender: ({ text }) => {
      const time = text ? dayjs(text).format('YYYY-MM-DD') : '--'
      return [
        h(Popover, { content: time }, { default: () => time })
      ]
    }
  },
  {
    title: '领用数量',
    dataIndex: 'num',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '金额',
    dataIndex: 'amount',
    ellipsis: true,
    customRender: ({ text }) => {
      text = translateAmount(text)
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '处理人',
    dataIndex: 'handler',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  }
]
const getData = (id="") => {
  getTableData(id)
}

defineExpose({
  getData
})
</script>
<style scoped lang="less">
.table {
  :deep(.asset-management-card-body) {
    padding-bottom: 0px !important;
  }

  :deep(.asset-management-pagination) {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }
}
</style>
