<template>
  <div class="top-box">
    <div class="item">
      <span class="label">全部</span>
      <span class="value">{{ countInfo?.checkTotalNumber || 0 }}</span>
    </div>
    <div class="item">
      <span class="label">已盘</span>
      <span class="value">{{ countInfo?.checkCompleteNumber || 0 }}</span>
    </div>
    <div class="item">
      <span class="label">未盘</span>
      <span class="value">{{ countInfo?.checkUndiskNumber || 0 }}</span>
    </div>
    <div class="item">
      <span class="label">盘赢</span>
      <span class="value">{{ countInfo?.checkWinNumber || 0 }}</span>
    </div>
    <div class="item">
      <span class="label">盘亏</span>
      <span class="value">{{ countInfo?.checkLossNumber || 0 }}</span>
    </div>
    <div class="item">
      <span class="label">异常</span>
      <span class="value">{{ countInfo?.abnormalNumber || 0 }}</span>
    </div>
  </div>
  <div class="check-detail-info-table">
    <Table
      :columns="columns" :data-source="dataSource" :pagination="false"
      :scroll=" {x: 1000,y: scrollY}" size="small" bordered :loading="loading"
      style="margin:10px 0"
    />
    <Pagination
      v-model:current="pagination.pageNumber" v-model:pageSize="pagination.pageSize" show-size-changer
      :total="pagination.total" :default-current="1" :show-total="(total: number) => `共 ${total} 条数据`"
      @change="pageChange"
    />
  </div>
</template>
<script setup lang="ts">
import { queryByPalanCount, queryByPlanIdPage } from '@/api/asset-management/asset-management'
import { Popover, type TableColumnType } from 'ant-design-vue'
import { h, onMounted, ref } from 'vue'
import { CheckStatusList } from '@/views/enum';
import dayjs from 'dayjs'

const props = withDefaults(defineProps<{
  id:string;
}>(), {})

interface CountInfo {
  /**
   * 已盘点
   */
  checkCompleteNumber?: number;
  /**
   * 盘亏
   */
  checkLossNumber?: number;
  /**
   * 盘点总数
   */
  checkTotalNumber?: number;
  /**
   * 待盘点
   */
  checkUndiskNumber?: number;
  /**
   * 盘赢
   */
  checkWinNumber?: number;
  /** 异常 */
  abnormalNumber?:number;
}

const countInfo = ref<CountInfo>()
const scrollY=ref(450)
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
    id: props.id
  };
  loading.value = true;
  try {
    const res = await queryByPlanIdPage(params);
    if (res.data) {
      const { records, total } = res.data;
      dataSource.value = records;
      pagination.value.total = total;
    }
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
  scrollY.value = document.querySelector('.check-detail-info-table')!.clientHeight-95
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
    title: '资产编码',
    dataIndex: 'serialNumber',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '资产名称',
    dataIndex: 'name',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '资产类别',
    dataIndex: 'typeName',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '规格型号',
    dataIndex: 'norms',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '计量单位',
    dataIndex: 'unit',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '原值',
    dataIndex: 'price',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '使用部门',
    dataIndex: 'receiveDepName',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '使用人',
    dataIndex: 'receiveUserName',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '入库日期',
    dataIndex: 'startTime',
    ellipsis: true,
    customRender: ({ text }) => {
      const time = text ? dayjs(text).format('YYYY-MM-DD') : '--'
      return [
        h(Popover, { content: time }, { default: () => time })
      ]
    }
  },
  {
    title: '预计使用年限（月）',
    dataIndex: 'usageTime',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '逾龄资产',
    dataIndex: 'usage',
    ellipsis: true,
    customRender: ({ text }) => {
      text = text?'是':'否'
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '盘点操作人',
    dataIndex: 'checkUserName',
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
    title: '盘点状态',
    dataIndex: 'checkStatus',
    ellipsis: true,
    customRender: ({ text }) => {
      const status = CheckStatusList.find(e => e.value === text)?.label || '--'
      return [
        h(Popover, { content: status }, { default: () => status || '--' })
      ]
    }
  },
  {
    title: '异常类型',
    dataIndex: 'abnormalTypeName',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text || '--' })
      ]
    }
  },
  {
    title: '说明',
    dataIndex: 'abnormalRemarks',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text || '--' })
      ]
    }
  }
];

onMounted(() => {
  getTableData()

  queryByPalanCount({ id: props.id }).then(res => {
    if (res.data) {
      countInfo.value = res.data as CountInfo
      const checkTotalNumber = countInfo.value.checkTotalNumber ?? 0
      const checkWinNumber = countInfo.value.checkWinNumber ?? 0
      countInfo.value.checkTotalNumber = checkTotalNumber + checkWinNumber
    }
  })
})
</script>
<style scoped lang="less">
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
.check-detail-info-table{
  height: calc(100% - 95px);
}
</style>
