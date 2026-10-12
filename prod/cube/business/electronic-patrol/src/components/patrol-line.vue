<template>
  <CLayout title="巡更路线名称">
    <template #content>
      <Form
        ref="pathfrom"
        layout="inline"
        :model="patrolline"
        :label-col="{ style: 'width: 120px' }"
      >
        <Row class="w-100% mt-15px">
          <Col :span="12">
            <FormItem
              label="巡更路线:"
              name="routeId"
              :rules="[{ required: true, message: '请选择巡更路线', trigger: 'change' }]"
            >
              <Select
                v-model:value="patrolline.routeId"
                :disabled="disablep"
                :field-names="{ label: 'patrolRouteName', value: 'id' }"
                class="w-100%"
                :options="options"
                @change="selectline"
              />
            </FormItem>
          </Col>
        </Row>
        <Row class="w-100% mt-15px">
          <Col :span="12">
            <FormItem label="是否按顺序巡更:">
              <Checkbox v-model:checked="patrolline.inOrder" :disabled="disablep" />
            </FormItem>
          </Col>
          <Col :span="12">
            <Button
              v-if="!disablep" type="primary" @click="openAddPoint"
            >
              添加巡更点
            </Button>
          </Col>
        </Row>
      </Form>

      <Table
        :pagination="false"
        :columns="columns"
        :data-source="dataSource"
        class="mt-15px"
        :class="{ 'lineTable': handle !== 'detiles' }"
        :scroll="{ y: scrollY }"
        rowKey="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'action'">
            <Popconfirm title="是否删除当前选中？" @confirm.stop="delRow(record)">
              <Button v-if="!disablep" type="link" danger>删除</Button>
            </Popconfirm>
          </template>
        </template>
      </Table>
    </template>

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
            selectedRowKeysData=dataSource.map(res => res.id)
            pointquery()
          },
          showTotal(total) {
            return `共 ${total} 条数据`
          }
        }"
        :columns="pointCoulmns"
      />
    </Modal>
  </CLayout>
</template>
<script lang="ts">

import { computed, nextTick, onMounted, reactive, ref, unref } from 'vue'
import CLayout from './common/c-layout.vue'
import { Button, type TableColumnType, Popconfirm } from 'ant-design-vue'

import { pointPage } from '@/api/point-api'
import { getAreaList } from '@/api/ouaa'
import { pathPageall } from '@/api/path-api'
import type { SelectValue } from 'ant-design-vue/lib/select'
import { useRoute } from 'vue-router'
import { changeArrayIndex, sortDragTable } from '@/utils/sort-table'
</script>
<script setup lang="ts">
const route = useRoute()

const { handle } = route.query
const props: any = withDefaults(defineProps(), {
  datainfo: null,
  disabled: false,
})
const disablep = ref<boolean>(false)
const validateFields = async () => {
  const values: boolean = await pathfrom.value.validateFields()
  return values
}
const scrollY = ref(300)
const pathfrom = ref()
const patrolline = reactive<{
  inOrder: boolean;
  routeId: string;
  locationIds: { id: string; }[];
}>({
  inOrder: false,
  routeId: '',
  locationIds: [],
})
const areaOptions = ref([])
const options = ref([])
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
      return `${ Array.isArray(record.area) && record.area.length > 0 ? record.area.map((res: { name?: string }) => res?.name ?? '').join("/") : '--'}`;
    },
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 200,
  },
])
const sortData = ref<unknown[]>([])
const preserveData = ref<unknown[]>([])
onMounted(async () => {
  const layoutContentHeight = document.getElementsByClassName('layout-container')[0]
  scrollY.value = layoutContentHeight.offsetHeight - 380
  if (handle === 'detiles') {
    columns.value.splice(3, 1)
  }
  if (props.datainfo !== undefined) {
    patrolline.routeId = props.datainfo.routerId
    patrolline.inOrder = props.datainfo.inOrder
    patrolline.locationIds = props.datainfo.locationIds.map(
      (res: { id: string; }) => res.id
    )
    dataSource.value = props.datainfo.locationIds
    preserveData.value = props.datainfo.locationIds
    selectedRowKeysData.value = props.datainfo.locationIds.map(
      (res: { id: string; }) => res.id
    )
  }
  const { data } = await pathPageall()
  options.value = data
  // 拖拽排序
  sortDragTable((evt: { newIndex: number; oldIndex: number })=>{
    const result = changeArrayIndex(JSON.parse(JSON.stringify(dataSource.value)), evt.oldIndex - 1, evt.newIndex - 1)
    dataSource.value = result as unknown as { id: string; }[]
    patrolline.locationIds = result as unknown as { id: string; }[]
    sortData.value = [...result]
  }, handle !== 'detiles')
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
const delRow = ({ id }: { id: string; }) => {
  dataSource.value = dataSource.value.filter((res) => res.id !== id)
  preserveData.value = dataSource.value.filter((res) => res.id !== id)
  selectedRowKeysData.value = selectedRowKeysData.value.filter((res) => res !== id)
  patrolline.locationIds = patrolline.locationIds.filter((res) => res.id !== id)
  cur.value = cur.value
    .filter((res: { id: any; }) => res.id !== id)
    .reduce((acc: any[], cur: { id: any; }) => {
      const isExist = acc.some((item) => item.id === cur.id)
      if (!isExist) {
        acc.push(cur)
      }
      return acc
    }, [])
}
const visible = ref<boolean>(false)
const openAddPoint = () => {
  visible.value = true
  formState.pageNumber = 1
  getAreaList().then((res) => {
    if (res.data) {
      areaOptions.value = res.data
    }
  })
  pointquery()
  selectedRowKeysData.value = dataSource.value.map((res: { id: string; }) => res.id)
  selectedRowKeysList.value = dataSource.value
}
const dataSource = ref<{ id: string; }[]>([])
const cascader = ref<string[]>([])
const selectedRowKeysList = ref<{ id: string; }[]>([])
const formState = reactive<Plan.FormState>({
  keyword: '',
  areaId: '',
  pageNumber: 1,
  pageSize: 10,
  total: 0,
})
const selectedRowKeysData = ref<string[]>([])

const onSelectChange = (selectedRowKeys: string[], selectedRows: any) => {
  selectedRowKeysData.value = selectedRowKeys
  // patrolline.locationIds = selectedRows
  selectedRowKeysList.value = selectedRows
}

const selectionRow = computed(() => {
  return {
  preserveSelectedRowKeys: true,
  selectedRowKeys: selectedRowKeysData,
  onChange: onSelectChange,
  }
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
const handler = () => {
  visible.value = false
  const arr = [...selectedRowKeysList.value, ...preserveData.value,...JSON.parse(JSON.stringify(dataSource.value))].filter(e => e)
  const uniqueArr: (unknown|{ id: string; })[] = arr.reduce((acc, current) => {
    const x = acc.find(item => item.id === current.id)
    if (!x) {
      return acc.concat([current])
    } else {
      return acc
    }
  }, [])
  // 优化打巡更点弹窗全选/反选、排序后界面列表回显
  dataSource.value.length = 0
  patrolline.locationIds.length = 0
  const sortArr = sortData.value.map(i => i.id)
  let list: { id: string; }[] = []
  if(Array.isArray(selectedRowKeysData.value) && selectedRowKeysData.value.length > 0){
    list = uniqueArr.filter(item => selectedRowKeysData.value.includes(item.id))
  }
  // 排序
  list.sort((a, b) => {
    const indexA = sortArr.indexOf(a.id);
    const indexB = sortArr.indexOf(b.id);
    return indexA - indexB;
  });
  dataSource.value = [...list]
  patrolline.locationIds = [...list]
}
const currentpoint = ref<any>([])
const selectline = (value: SelectValue) => {
  const linedata = options.value?.find((res: { id: string; }) => res.id === value)
  let targer: any = []
  let data: {
    patrolLocation: { id: string; }[];
  } = {
    patrolLocation: [],
  }
  if (linedata) {
    data = linedata
  }
  if (selectedRowKeysList.value.length === 0) {
    targer = [...data.patrolLocation]
  } else {
    targer = [...data.patrolLocation, ...patrolline.locationIds]
  }
  currentpoint.value = data.patrolLocation

  const uniqueArr = targer.reduce((acc: any[], cur: { id: any; }) => {
    const isExist = acc.some((item) => item.id === cur.id)
    if (!isExist) {
      acc.push(cur)
    }
    return acc
  }, [])
  cur.value = uniqueArr
  patrolline.locationIds = uniqueArr
  dataSource.value = uniqueArr
  selectedRowKeysData.value = uniqueArr.map((res: { id: string; }) => res.id)
}
const cur = ref<any>([])
const setInfo = (
  data: { routerId: string; inOrder: boolean; locationIds: any; },
  disable: boolean
) => {
  disablep.value = disable
  cur.value = data.locationIds
  patrolline.routeId = data.routerId
  patrolline.inOrder = data.inOrder
  patrolline.locationIds = data.locationIds
  selectedRowKeysData.value = data.locationIds.map((res: { id: string; }) => res.id)
  dataSource.value = data.locationIds
  currentpoint.value = data.locationIds
}
defineExpose({
  validateFields,
  patrolline,
  setInfo,
})
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");
</style>
