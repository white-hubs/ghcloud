<!-- eslint-disable dot-notation -->
<template>
  <Tabs v-model:activeKey="activeKey" size="small" type="card" @change="tabchange">
    <TabPane key="area" tab="分区">
      <Input v-model:value="searchName.areaName" placeholder="搜索" @change="areaChange">
        <template #suffix>
          <SearchOutlined style="color: rgba(0, 0, 0, 0.45)" />
        </template>
      </Input>

      <div class="mt-15px">
        <Empty v-if="!arealist.length" />
        <template v-else>
          <Tree
            v-model:checkedKeys="areacheckedKeys"
            :disabled="disabled"
            checkable
            :tree-data="arealist"
            :field-names="{
              children: 'children',
              title: 'areaName',
              key: 'id',
            }"
            @check="areaselect"
          />
        </template>
      </div>
    </TabPane>
    <TabPane v-if="showroute" key="route" tab="支路">
      <Input
        v-model:value="searchName.routerName"
        placeholder="搜索"
        @change="routeChange"
      >
        <template #suffix>
          <SearchOutlined style="color: rgba(0, 0, 0, 0.45)" />
        </template>
      </Input>

      <div class="mt-15px">
        <Empty v-if="!routelist.length" />
        <template v-else>
          <Tree
            v-model:checkedKeys="routercheckedKeys"
            :disabled="disabled"
            checkable
            :tree-data="routelist"
            :field-names="{
              children: 'children',
              title: 'routeName',
              key: 'id',
            }"
            @check="routeselect"
          />
        </template>
      </div>
    </TabPane>
  </Tabs>
</template>
<script lang="ts" setup>
import { AreaTree, RouteTree } from '@/api/dosageAnalysis'
import type { TreeProps } from 'ant-design-vue'
import { type TabsProps } from 'ant-design-vue/es'
import { defineEmits, onMounted, reactive, ref, watch } from 'vue'
interface Props {
  /** 标题 */
  instrumentType?: string;
  showroute?: boolean;
  activeKey?: string;
  disabled?: boolean;
}

const routercheckedKeys = ref<any>([])
const areacheckedKeys = ref<any>([])
const emit = defineEmits(['areaClick', 'routeClick', 'allList'])
const props = withDefaults(defineProps<Props>(), {
  instrumentType: '',
  showroute: true,
  activeKey: 'route',
  disabled: false
})
const searchName = reactive<{
  routerName: string;
  areaName: string;
}>(
  {
    routerName: '',
    areaName: ''
  }
)
const routelist = ref([])
const arealist = ref([])

const tabchange: TabsProps['onChange'] = (data) => {
  routercheckedKeys.value = []
  areacheckedKeys.value = []
  routercheckedKeys.value = routelist.value.map((res: { id: string; }) => res.id)

  areacheckedKeys.value = arealist.value.map((res: { id: string; }) => res.id)
  if (data === 'area') {
    emit('areaClick', areacheckedKeys.value, arealist.value)
  } else {
    emit('routeClick', routercheckedKeys, routelist.value)
  }
}

const time = ref()
const areaChange = () => {
  clearTimeout(time.value)
  time.value = setTimeout(() => {
    getData(props.instrumentType)
  }, 1000)
}

const routeChange = () => {
  getData(props.instrumentType)
}
const areaselect: TreeProps['onCheck'] = (selectedKeys, info) => {
  const deepArr = JSON.parse(JSON.stringify(info.checkedNodes))
  const arr = deepArr.map((res: any) => {
    res.children = []
    return res
  })

  const ids = info.checkedNodes.map((res: any) => res.id)
  const map = new Map()
  const newArr = treeData(arr).filter((v: { id: string; }) => !map.has(v.id) && map.set(v.id, 1))

  emit('areaClick', ids, [...newArr, ...getlist(info.checkedNodes)])
}
const routeselect: TreeProps['onCheck'] = (selectedKeys, info) => {
  const all = info.checkedNodes.filter((res: any) => res.parentId == null)
  const deepArr = JSON.parse(JSON.stringify(info.checkedNodes))
  const arr = deepArr.map((res: any) => {
    res.children = []
    return res
  })
  const ids = info.checkedNodes.map((res: any) => res.id)
  const map = new Map()
  const newArr = treeData(arr).filter((v: { id: string; }) => !map.has(v.id) && map.set(v.id, 1))

  emit('routeClick', ids, [...getlist(info.checkedNodes), ...newArr])
}

const getlist = (array: any) => {
  const data: any = []

  const idarr:string[] = array.map((res: { id: string; }) => res.id)
  array.forEach((ele:any) => {
    if (!idarr.includes(ele.parentId) && ele.parentId != null) {
      data.push(ele)
    }
  })
  return data
}
const treeData = (arr: any[], pid = null) => {
  // 判断是否是数组 不是数组就返回 []
  if (arr.length === 0) return []
  const newArr: any = []
  arr.forEach((item) => {
    // 判断 当前item.pid 和 传入的pid 是否相等，相等就push 进去
    if (item.parentId === pid) {
      newArr.push({
        ...item,
        children: treeData(arr, item.id)
      })
    }
  })
  return newArr
}
onMounted(async () => {
  activeKey.value = props.activeKey
  setTimeout(async () => {
    const { data: RouteList } = await RouteTree(searchName.routerName, props.instrumentType)
    routelist.value = RouteList
    const { data: AreaList } = await AreaTree(searchName.areaName, props.instrumentType)
    arealist.value = AreaList
    activeKey.value = props.activeKey
    routercheckedKeys.value = RouteList.map((res: { id: string; }) => res.id)
    emit('allList', getcheckedKeys())
    areacheckedKeys.value = AreaList.map((res: { id: string; }) => res.id)
  }, 100)
})

const activeKey = ref<string>('route')

const getData = async (n: string) => {
  const { data: RouteList } = await RouteTree(searchName.routerName, n)
  routelist.value = RouteList
  const { data: AreaList } = await AreaTree(searchName.areaName, n)
  arealist.value = AreaList
  routercheckedKeys.value = RouteList.map((res: { id: string; }) => res.id)

  areacheckedKeys.value = AreaList.map((res: { id: string; }) => res.id)

  emit('allList', getcheckedKeys())
}
const getcheckedKeys = () => {
  if (activeKey.value === 'route') {
    return routelist.value
  } else {
    return arealist.value
  }
}
defineExpose({
  activeKey,
  getcheckedKeys
})
watch(() => props.instrumentType, async (n: string) => {
  getData(n)
})
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");
</style>
