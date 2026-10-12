<template>
  <GLayout :title="pageTitle" :showfooter="true">
    <template #header-btn>
      <Button type="primary" @click="addPath">新增</Button>
    </template>
    <template #content-data>
      <div class="mt-15px" />
      <Form class="mt-15px" style="margin-bottom: 12px;" layout="inline" :model="formState">
        <FormItem>
          <Input v-model:value="formState.keyword" placeholder="巡更路线名称" />
        </FormItem>

        <FormItem>
          <Button type="primary" @click="handleSearch">查询</Button>
        </FormItem>
        <FormItem>
          <Button @click="reset"> 重置 </Button>
        </FormItem>
      </Form>
      <AliasTable
        :columns="columns" :data-source="dataSource" :pagination="false" size="small"
        bordered
        :loading="loading" row-key="id" application-code="ELECTRONIC_PATROL" table-code="ELECTRONIC_PATROL_PATH"
        :scroll-x="1000" :scroll-y="450"
      />
    </template>
    <template #footer-page>
      <Pagination
        v-model:current="formState.pageNumber" v-model:pageSize="formState.pageSize" show-size-changer
        :total="formState.total" :default-current="1" :show-total="(total: number) => `共 ${total} 条数据`"
        @change="pageChange"
      />
    </template>
  </GLayout>
</template>
<script lang="ts">
import { deletepath, pathPage } from '@/api/path-api'
import GLayout from '@/components/common/g-layout.vue'
import { Button, Popover, type TableColumnType, Popconfirm } from 'ant-design-vue'
import { AliasTable } from '@ghcloud/generic-component'
import dayjs from 'dayjs'
import { onMounted, reactive, ref, h } from 'vue'
import { useRouter } from 'vue-router'
import { useListQueryCache, usePageName } from '@ghcloud/cube-utils'
</script>
<script setup lang="ts">
const { pageTitle } = usePageName()
const userouter = useRouter()
const formState = reactive<Path.FormState>({
  keyword: '',
  pageNumber: 1,
  pageSize: 10,
  total: 0
})
const queryCache = useListQueryCache({
  defaults: {
    keyword: '',
    pageNumber: 1,
    pageSize: 10,
  },
  getState: () => ({
    keyword: formState.keyword,
    pageNumber: formState.pageNumber,
    pageSize: formState.pageSize,
  }),
  setState: (next) => {
    formState.keyword = (next.keyword as string) ?? ''
    formState.pageNumber = Number(next.pageNumber ?? 1)
    formState.pageSize = Number(next.pageSize ?? 10)
  }
})
const loading = ref<boolean>(false)
const dataSource = ref([])
const columns = ref<TableColumnType[]>(
  [
    {
      title: '序号',
      width: 70,
      customRender: ({ index }) => {
        return index + 1
      }
    }, {
      title: '巡更线路',
      dataIndex: 'patrolRouteName',
      key: 'patrolRouteName',
      customRender: ({ text }) => {
        return h(Popover, { content: text }, { default: () => text as string || '--' })
      }
    },
    {
      title: '巡更点数量',
      dataIndex: 'patrolLocationNumber',
      key: 'patrolLocationNumber'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      customRender: ({ record }) => {
        return `${dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')}`
      }
    }, {
      title: '创建人',
      dataIndex: 'createBy',
      key: 'createBy'
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 200,
      customRender: ({ record }) => {
        return [
          h(
            Button,
            { type: 'link', size: 'small', onClick: () => { editRow(record.id) } },
            { default: () => '编辑' }
          ),
          h(
            Popconfirm,
            { title: '确定要删除该项？', danger: true, onConfirm: () => { delRow(record.id) } },
            {
              default: () => h(
                Button,
                { type: 'link', size: 'small', danger: true },
                { default: () => '删除' }
              )
            }
          )
        ]
      }

    }])
const pageChange = (pageNumber: number, pageSize: number) => {
  formState.pageNumber = pageNumber
  formState.pageSize = pageSize
  query()
}

const query = async () => {
  const { data } = await pathPage(formState)
  dataSource.value = data?.records
  formState.total = data.total
  await queryCache.sync()
}
const handleSearch = () => {
  formState.pageNumber = 1
  query()
}
const reset = () => {
  Object.assign(formState, {
    keyword: '',
    pageNumber: 1,
    pageSize: 10,
    total: 0
  })
  query()
}
const editRow = (id: string) => {
  userouter.push(`/path/detiles?id=${id}&type=edit`)
}
const delRow = async (id: string) => {
  await deletepath(id)
  query()
}
onMounted(() => {
  queryCache.hydrateAndQuery(query)
})
const addPath = () => {
  userouter.push('/path/detiles?type=add')
}
</script>
<style lang="less" scoped>
@import url('@/style/theme/color.less');
</style>
