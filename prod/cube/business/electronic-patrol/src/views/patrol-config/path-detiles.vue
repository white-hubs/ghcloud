<!-- eslint-disable no-console -->
<template>
  <GLayout
    :title="type === 'edit' ? '巡更路线-编辑' : '巡更路线-新增'"
    :showfooter="true"
  >
    <template #content-data>
      <div class="pl-60px pr-60px mt-15px">
        <Form
          ref="formRef"
          layout="inline"
          :model="basicInfo"
          :rules="formRules"
          :label-col="{ style: 'width: 110px' }"
        >
          <Row class="w-100%">
            <Col :span="12">
              <FormItem label="巡更路线名称:" name="patrolRouteName">
                <Input
                  v-model:value="basicInfo.patrolRouteName"
                  :maxlength="20"
                  class="w-100%"
                />
              </FormItem>
            </Col>
          </Row>
          <Row class="w-100%">
            <Col :span="12">
              <FormItem label="巡更点:" name="locationIds">
                <a @click="addPoint">添加巡更点</a>
              </FormItem>
            </Col>
          </Row>
        </Form>

        <Table
          :columns="columns"
          :data-source="dataSource"
          class="mt-15px lineTable"
          :pagination="false"
          :scroll="{
            y: 400,
          }"
          rowKey="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'action'">
              <Popconfirm title="是否删除当前选中？" @confirm="delRow(record)">
                <Button type="link" danger>删除</Button>
              </Popconfirm>
            </template>
          </template>
        </Table>
      </div>
    </template>
    <template #footer-page>
      <Button class="ml-15px" @click="back">返回</Button>
      <Button class="ml-15px" type="primary" @click="savePoint">
        {{
          type === "add" ? "保存" : "修改"
        }}
      </Button>
    </template>
  </GLayout>
  <Modal v-model:visible="visible" title="添加巡更点" width="800px" @ok="handler">
    <Form
      ref="formRef"
      layout="inline"
      class="mt--15px"
      :model="formState"
      :label-col="{ style: 'width: 90px' }"
    >
      <FormItem label="巡更点名称:">
        <Input v-model:value="formState.keyword" placeholder="巡更点名称" />
      </FormItem>
      <FormItem label="所属区域:">
        <Cascader
          v-model:value="cascader"
          style="width: 200px"
          placeholder="请选择"
          :field-names="{ label: 'name', value: 'id', children: 'children' }"
          :options="areaOptions"
          allow-clear
          show-search
          change-on-select
          @change="onChange"
        />
      </FormItem>
      <FormItem>
        <Button type="primary" @click="pointquery"> 查询</Button>
        <Button class="ml-10px" @click="pointreset"> 重置</Button>
      </FormItem>
    </Form>
    <Table
      :row-key="(record) => record.id"
      :row-selection="selectionRow"
      :data-source="pointdataSource"
      :pagination="{
        pageSize:formState.pageSize,
        current:formState.pageNumber,
        total:formState.total,
        onChange:(pageNumber: number, pageSize: number)=>{
          formState.pageNumber = pageNumber;
          formState.pageSize = pageSize;
          pointquery()
        },
        showTotal(total) {
          return `共 ${total} 条数据`
        }
      }"
      :columns="pointCoulmns"
    />
  </Modal>
</template>
<script lang="ts">
import { getAreaList } from '@/api/ouaa'
import { addpath, pathById, updatepath } from '@/api/path-api'
import { pointPage } from '@/api/point-api'
import GLayout from '@/components/common/g-layout.vue'
import { Button, type TableColumnType, Popconfirm } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { computed, nextTick, onMounted, reactive, ref, unref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { changeArrayIndex, sortDragTable } from '@/utils/sort-table'
</script>
<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const formRef = ref()
const { id, type } = route.query
const basicInfo = reactive<{
  patrolRouteName: string;
  locationIds: unknown[];
}>({
  patrolRouteName: '',
  locationIds: [],
})
const pointCoulmns = ref<TableColumnType[]>([
  {
    title: '序号',
    width: 70,
    customRender: ({ index }) => {
      return index + 1
    },
  },
  {
    title: '巡更点名称',
    dataIndex: 'patrolLocationName',
    key: 'patrolLocationName',
  },
  {
    title: '所属区域',
    dataIndex: 'area',
    key: 'area',
    customRender: ({ record }) => {
      return `${record.area.map((res: { name?: string }) => res?.name ?? '').join("/") || '--'}`;
    },
  },
])
const selectedRowKeysList = ref<{ id: string; }[]>([])

const selectedRowKeysData = ref<string[]>([])
const onSelectChange = (selectedRowKeys: string[], selectedRows: any) => {
  selectedRowKeysData.value = selectedRowKeys
  selectedRowKeysList.value = selectedRows
  basicInfo.locationIds = selectedRows
}

const selectionRow = computed(() => {
  return {
  preserveSelectedRowKeys: true,
  selectedRowKeys: selectedRowKeysData,
  onChange: onSelectChange,
  }
})

const columns = ref<TableColumnType[]>([
  {
    title: '序号',
    width: 70,
    customRender: ({ index }) => {
      return index + 1
    },
  },
  {
    title: '巡更点',
    dataIndex: 'patrolLocationName',
    key: 'patrolLocationName',
  },
  {
    title: '所属区域',
    dataIndex: 'area',
    key: 'area',
    customRender: ({ record }) => {
      return `${record.area.map((res: { name?: string }) => res?.name ?? '').join("/") || '--'}`;
    },
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 200,
  },
])
const formRules: Record<string, Rule[]> = {
  patrolRouteName: [{ required: true, message: '请输入巡更路线名称', trigger: 'change' }],
  locationIds: [{ required: true, message: '请选择巡更点', trigger: 'change' }],
}
const dataSource = ref<{ id: string; }[]>([])
const back = () => {
  router.push('/path')
}

const visible = ref<boolean>(false)
const formState = reactive<Plan.FormState>({
  keyword: '',
  areaId: '',
  pageNumber: 1,
  pageSize: 10,
  total: 0,
})
const areaOptions = ref([])
const cascader = ref<string[]>([])
const handler = () => {
  visible.value = false
  const arr = [...selectedRowKeysList.value, ...preserveData.value].filter(e => e)
  const uniqueDevices = arr.reduce((acc, current) => {
    const x = acc.find(item => item.id === current.id)
    if (!x) {
      return acc.concat([current])
    } else {
      return acc
    }
  }, [])
  // 优化打巡更点弹窗全选/反选、排序后界面列表回显
  dataSource.value.length = 0
  basicInfo.locationIds.length = 0
  const sortArr = sortData.value.map(i => i.id)
  let list: { id: string; }[] = []
  if(Array.isArray(selectedRowKeysData.value) && selectedRowKeysData.value.length > 0){
    list = uniqueDevices.filter(item => selectedRowKeysData.value.includes(item.id))
  }
  // 排序
  list.sort((a, b) => {
    const indexA = sortArr.indexOf(a.id);
    const indexB = sortArr.indexOf(b.id);
    return indexA - indexB;
  });
  dataSource.value = list
  basicInfo.locationIds = list

}
const preserveData = ref([])
const sortData = ref<unknown[]>([])
onMounted(async () => {
  if (type === 'edit') {
    const { data } = await pathById(id)
    dataSource.value = data.patrolLocation
    selectedRowKeysData.value = data.patrolLocation.map((res: { id: string; }) => res.id)
    basicInfo.locationIds = data.patrolLocation
    preserveData.value = data.patrolLocation
    basicInfo.patrolRouteName = data.patrolRouteName
    Object.assign(basicInfo, data)
  }
  // 拖拽排序
  sortDragTable((evt: { newIndex: number; oldIndex: number })=>{
    const result = changeArrayIndex(JSON.parse(JSON.stringify(dataSource.value)), evt.oldIndex - 1, evt.newIndex - 1)
    dataSource.value = result as unknown as { id: string; }[]
    basicInfo.locationIds = result as unknown as { id: string; }[]
    sortData.value = [...dataSource.value]
  })
})
const pointdataSource = ref([])
const pointquery = () => {
  formState.areaId = cascader.value.join(',')
  pointPage(formState).then((res) => {
    const { data } = res
    pointdataSource.value = data.records
    formState.total = data.total
  })
}
const pointreset = () => {
  cascader.value = []
  Object.assign(formState, {
    keyword: '',
    areaId: '',
    pageNumber: 1,
    pageSize: 10,
    total: 0,
  })
  pointquery()
}
const delRow = (record: any) => {
  dataSource.value = dataSource.value.filter((res) => res.id !== record.id)
  preserveData.value = preserveData.value.filter((res) => res.id !== record.id)
  selectedRowKeysData.value = selectedRowKeysData.value.filter(
    (res) => res !== record.id
  )
  basicInfo.locationIds = basicInfo.locationIds.filter(
    (res: any) => res.id !== record.id
  )

  // basicInfo.locationIds.splice(index, 1)
}
const addPoint = () => {
  visible.value = true
  getAreaList().then((res) => {
    if (res.data) {
      areaOptions.value = res.data
    }
  })
  formState.pageNumber = 1
  pointquery()
  selectedRowKeysData.value = dataSource.value.map((res: { id: string; }) => res.id)
  selectedRowKeysList.value = dataSource.value
}
const onChange = () => {}
const savePoint = async () => {
  await formRef.value.validateFields()
  if (type === 'add') {
    //  = selectedRowKeysData.value
    await addpath(basicInfo)
    router.push('/path')
  } else {
    await updatepath(basicInfo)
    router.push('/path')
  }
}
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");
</style>
