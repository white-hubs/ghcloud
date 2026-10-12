<template>
  <GLayout class="check-detail" title="盘点详情">
    <template #content-table>
      <div class="top-box">
        <div class="item">
          <span class="label">全部</span>
          <span class="value">{{ countInfo?.consumableNum || 0 }}</span>
        </div>
        <div class="item">
          <span class="label">已盘</span>
          <span class="value">{{ countInfo?.checkedNum || 0 }}</span>
        </div>
        <div class="item">
          <span class="label">未盘</span>
          <span class="value">{{ countInfo?.checkWaitNumber || 0 }}</span>
        </div>
        <div class="item">
          <span class="label">盘赢</span>
          <span class="value">{{ countInfo?.addNum || 0 }}</span>
        </div>
        <div class="item">
          <span class="label">盘亏</span>
          <span class="value">{{ countInfo?.reduceNum || 0 }}</span>
        </div>
      </div>
      <Table
        :columns="columns" :data-source="dataSource" :pagination="false"
        :scroll=" {x: 1000,y: 550}" size="small" bordered :loading="loading"
        style="margin:10px 0"
      />

      <Pagination
        v-model:current="pagination.pageNumber" v-model:pageSize="pagination.pageSize" show-size-changer
        :total="pagination.total" :default-current="1" :show-total="(total: number) => `共 ${total} 条数据`"
        @change="pageChange"
      />
    </template>
    <template #footer-page>
      <Button @click="back">返回</Button>
    </template>
  </GLayout>
</template>
<script setup lang="ts">
import { getConsumableCheckstat, getConsumableCheckDetailPage } from '@/api/asset-management/asset-management'
import { type TableColumnType, Popover } from 'ant-design-vue'
import dayjs from 'dayjs'
import { ref, h, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const { id } = useRoute().query as {id:string;}

interface CountInfo {
  /**
   * 盘盈数量
   */
  addNum: string;
  /**
   * 已盘数量
   */
  checkedNum: string;
  /**
   * 未盘
   */
  checkWaitNumber: string;
  /**
   * 耗材
   */
  consumableNum: string;
  reduceNum: string;
}

const countInfo = ref<CountInfo>()

const loading = ref(false)
const dataSource = ref<unknown[]>([])
const pagination = ref({
  pageSize: 10,
  pageNumber: 1,
  total: 0
})

const getTableData = async () => {
  const params = {
    pageNumber: pagination.value.pageNumber,
    pageSize: pagination.value.pageSize,
    checkId: id
  };
  loading.value = true;
  try {
    const res = await getConsumableCheckDetailPage(params);
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
  pagination.value.pageNumber = pageNumber !== 0 ? pageNumber : 1;
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
    title: '耗材分类',
    dataIndex: 'categoryName',
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
    title: '规格型号',
    dataIndex: 'model',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '盘点操作时间',
    dataIndex: 'checkTime',
    ellipsis: true,
    customRender: ({ text }) => {
      const time = text ? dayjs(text).format('YYYY-MM-DD') : '--'
      return [
        h(Popover, { content: time }, { default: () => time })
      ]
    }
  },
  {
    title: '盘点人',
    dataIndex: 'checkerName',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '盘点状态',
    dataIndex: 'status',
    ellipsis: true,
    customRender: ({ text }) => {
      const statusList = [
        { label: '未盘', value: 'INCOMPLETE' },
        { label: '已盘', value: 'COMPLETED' },
        { label: '盘赢', value: 'WIN' },
        { label: '盘亏', value: 'LOSS' }
      ]
      const status = statusList.find(e => e.value === text)?.label || '--'
      return [
        h(Popover, { content: status }, { default: () => status || '--' })
      ]
    }
  },
  {
    title: '应盘数量',
    dataIndex: 'num',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '实盘数量',
    dataIndex: 'checkNum',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  }
];

onMounted(() => {
  getTableData()

  getConsumableCheckstat({ id }).then(res => {
    if (res.data) {
      countInfo.value = res.data as CountInfo
    }
  })
})

const back=()=>{
  window.history.back()
}
</script>
<style scoped lang="less">
.check-detail{
  :deep(.content-search){
    display: none !important;
  }
  :deep(.content-table){
    padding-left: 10px;
  padding-top: 10px;
  }
}

.top-box{
  display: flex;
  justify-content: flex-start;
  .item{
    display: flex;
    flex-flow: column;
    width: 100px;
    .value{
      font-size: 20px;
      font-weight: bold;
      margin-top: 15px;
    }
  }
}
.asset-management-pagination{
  display: flex;
  justify-content: flex-end;
}
</style>
