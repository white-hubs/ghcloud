<template>
  <Spin :spinning="treeLoading">
    <Tabs v-model:activeKey="activeTab" size="small" type="card" @change="tabChange">
      <TabPane v-for="item in tabs.list" :key="item.key" :tab="item.name">
        <Input
          v-model:value.trim="areaName" placeholder="请输入" style="margin-bottom: 10px;" allow-clear
          @change="searchHandle"
        />
        <Empty v-if="!treeData.length" />
        <template v-else>
          <Tree
            v-model:expandedKeys="expandedKeys"
            v-model:selectedKeys="selectedKeys"
            v-model:checkedKeys="checkedKeys"
            checkable

            :selectable="false"
            :tree-data="treeData"
            :field-names="fieldNames"
            :auto-expand-parent="autoExpandParent"
            @expand="onExpand"
            @check="check"
          >
            <template #title="{areaName:title}">
              <span v-if="title.indexOf(areaName) > -1">
                {{ title.substr(0, title.indexOf(areaName)) }}
                <span style="color: #f50">{{ areaName }}</span>
                {{ title.substr(title.indexOf(areaName) + areaName.length) }}
              </span>
              <span v-else>{{ title }}</span>
            </template>
          </Tree>
        </template>
      </TabPane>
    </Tabs>
  </Spin>
</template>
<script setup lang="ts">
import { getAreaTree } from '@/api/feeManage'
import type { TreeProps } from 'ant-design-vue/es/tree/Tree'
import type { Key } from 'ant-design-vue/es/vc-tree-select/interface'
import { onMounted, reactive, ref, toRefs, watch } from 'vue'

const props = withDefaults(defineProps<{
  tabs?: Fee.TabState;
}>(), {
  tabs: () => {
    return {
      activeKey: 'electricity_meter',
      list: [
        { key: 'electricity_meter', name: '电' },
        { key: 'water_meter', name: '水' },
        { key: 'gas_meter', name: '燃气' },
        { key: 'energy_meter', name: '能量' },
      ]
    }
  }
})
const emit = defineEmits(['update:value', 'tabChange', 'treeExpand', 'checkClick'])
const state = reactive({
  activeTab: props.tabs.activeKey,
  areaName: '',
  // 树形
  treeLoading: false,
  treeData: [],
  fieldNames: {
    key: 'id',
    label: 'areaName',
    children: 'children'
  }
})
const selectedKeys = ref<(string | number)[]>([])
const expandedKeys = ref<(string | number)[]>([])
const checkedKeys = ref<{checked: (string | number)[]; halfChecked: (string | number)[];}>({ checked: [], halfChecked: [] })
const autoExpandParent = ref<boolean>(true)
const { treeLoading, treeData, fieldNames, areaName, activeTab } = toRefs(state)

// tab切换
const tabChange = (activeKey: Key) => {
  state.activeTab = activeKey as string
  checkedKeys.value = { checked: [], halfChecked: [] }
  getTreeData()
  emit('tabChange', activeKey)
}
// 获取区域数据
const getTreeData = async () => {
  state.treeLoading = true
  // state.treeData = []
  try {
    const result = await getAreaTree({ instrumentType: state.activeTab, areaName: state.areaName })
    state.treeData = result.data || []
    state.treeLoading = false
    // 父级默认展开
    autoExpandParent.value = true
    checkedKeys.value = result.data.map((res:{id:string;}) => res.id)
    emit('checkClick', result.data)
    // expandedKeys.value = state.treeData.map((item) => item.key);
  } catch (error) {
    state.treeLoading = false
  }
}
// 展开，收起
const onExpand = (keys: Key[]) => {
  expandedKeys.value = keys
  autoExpandParent.value = false
  emit('treeExpand', keys)
}
// 树形结构数据 已知某一子节点 一次向上获取所有父节点
const treeFindPath = (tree:Fee.TreeState[], func:Function, path:Array<string|number> = []) : Array<string|number> => {
  if (!tree) return []
  for (const data of tree) {
    // 这里按照需求来存放最后返回的内容
    path.push(data.id || '')
    if (func(data)) return path
    if (data.children) {
      const findChildren = treeFindPath(data.children, func, path)
      if (findChildren.length) return findChildren
    }
    path.pop()
  }
  return []
  // 调用 treeFindPath(res, data=> data.name==='北京')
}
// 搜索
const time = ref()
const searchHandle = () => {
  clearTimeout(time.value)
  time.value = setTimeout(() => {
    getTreeData()
    const ids = treeFindPath(state.treeData, (data: { areaName: string | string[]; }) => {
      return data.areaName.indexOf(areaName.value) > -1
    })
    expandedKeys.value = ids
    autoExpandParent.value = true
  }, 1000)

  // emit('checkClick', state.treeData)
}

const check: TreeProps['onCheck'] = (selectedKeys, info) => {
  const deepArr = JSON.parse(JSON.stringify(info.checkedNodes))
  const arr = deepArr.map((res: any) => {
    res.children = []
    return res
  })
  const newArr = treeDatainfo(arr)
  emit('checkClick', [...getlist(info.checkedNodes), ...newArr])
}
const treeDatainfo = (arr: any[], pid = null) => {
  // 判断是否是数组 不是数组就返回 []
  if (arr.length === 0) return []
  const newArr: any = []
  arr.forEach((item) => {
    // 判断 当前item.pid 和 传入的pid 是否相等，相等就push 进去
    if (item.parentId === pid) {
      newArr.push({
        ...item,
        children: treeDatainfo(arr, item.id)
      })
    }
  })
  return newArr
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

watch(() => checkedKeys.value, (value) => {

  emit('update:value', value)
})

onMounted(() => {
  getTreeData()
})
defineExpose({
  tabChange,
  onExpand
})
</script>
<style lang="less" scoped>
@import url('@/style/theme/color.less');
</style>
