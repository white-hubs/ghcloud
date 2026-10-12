<template>
  <Spin :spinning="loading">
    <div class="tree-left">
      <div class="tree-title">
        <div class="title">耗材分类</div>
        <Button type="link" @click="()=>addClass()">新增分类</Button>
      </div>
      <Tree
        v-if="treeData?.length" v-model:selectedKeys="selectedKeys" v-model:expandedKeys="selectedKeys"
        :tree-data="treeData!" default-expand-all :field-names="{title:'name',key:'id'}"
        auto-expand-parent
      >
        <template #title="{ key: treeKey, name ,parentId}">
          <div style="display: flex;align-items: center;">
            <span style="width:80px;display: inline-block;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">{{ name }}</span>
            <EditOutlined style="color:var(--asset-management-primary-color);margin-right: 10px;" @click.stop="onContextMenuClick(treeKey,name,parentId, 'edit')" />
            <DeleteOutlined style="color:var(--asset-management-error-color)" @click.stop="onContextMenuClick(treeKey,name,parentId, 'del')" />
          </div>
        </template>
      </Tree>
      <Empty v-else description="暂无分类" :image-style="{maxWidth:'100%'}" style="margin-top: 30px;" />
    </div>
  </Spin>
  <GModalForm
    v-model="modalVisible" :form-source="formSource!" :form-state="modalFormState!" :rule="modalFormRules!"
    :title="modalTitle" :submit-loading="modalLoading" @ok="handleOk"
  />
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import GModalForm from '@/components/common/g-modal-form.vue'
import type { RuleObject } from 'ant-design-vue/es/form/interface'
import {
  getConsumableCategoryTree,
  consumableCategoryInsert,
  consumableCategoryUpdate,
  consumableCategoryDel
} from '@/api/asset-management/asset-management'
import { type TreeProps, Input, TreeSelect, type TreeSelectProps, Modal, message } from 'ant-design-vue'

const props = withDefaults(defineProps<{
  selectedKeys:string[];
}>(), {})
const emits = defineEmits(['update:selectedKeys'])

interface TreeNode{
  id:string;
  key:string;
  children:TreeNode[];
}

const loading = ref(false)
const modalVisible = ref(false)
const modalTitle = ref('')
const modalAction = ref<'AddCategory'|'EditCategory'>('AddCategory')
const modalLoading = ref(false)
const modalFormState = ref<Record<string, string | number|undefined>>({})
const formSource = ref< {
  value: string | number;
  label: string;
  component: unknown;
  props?: unknown;
}[]>()
const modalFormRules = ref<Record<string, RuleObject[]>>()

const selectedKeys = ref<string[]>(props.selectedKeys)
const treeData = ref<TreeProps['treeData']>([])
const handleGetConsumableCategoryTree = async (name?:string, parentId?:string) => {
  try {
    loading.value = true
    const params:Record<string, string> = {}
    name && (params.name = name)
    parentId && (params.parentId = parentId)
    const res = await getConsumableCategoryTree(params)
    const setKey = (tree:TreeNode[]) => {
      for (const iterator of tree) {
        iterator.key = iterator.id
        if (iterator.children?.length) {
          setKey(iterator.children)
        }
      }
    }
    setKey(res.data as unknown as TreeNode[])
    treeData.value = res.data as TreeProps['treeData']
  } catch (error) {
    loading.value = false
  } finally {
    loading.value = false
  }
}
const initClassFormRule = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' } as RuleObject]
}
const initClassFormSource = ref<{ value: string | number; label: string; component: unknown; props?: Record<string, unknown>; }[]>([
  {
    label: '分类名称',
    value: 'name',
    component: Input,
    props: {
      placeholder: '请输入分类名称',
      maxLength: 20
    }
  },
  {
    label: '上级分类',
    value: 'parentId',
    component: TreeSelect,
    props: {
      placeholder: '请选择',
      treeData: [],
      allowClear: true
    }
  }
])
const addClass = (disableId = '') => {
  formSource.value = initClassFormSource.value
  modalFormState.value = initClassFormSource.value.reduce((prv: Record<string, string | number>, cur) => {
    prv[cur.value] = ''
    return prv
  }, {})
  modalFormRules.value = initClassFormRule

  // treeSelect 选项数据
  const getTreeSelectoptions = (tree:TreeProps['treeData'] = []):TreeSelectProps['treeData'] => {
    return tree.map(e => {
      return {
        title: e.name,
        value: e.id,
        children: e.children?.length ? getTreeSelectoptions(e.children)! : [],
        disabled: e.id === disableId
      }
    })
  }
  initClassFormSource.value[1].props!.treeData = getTreeSelectoptions(treeData.value)
  modalTitle.value = '新增分类'
  modalAction.value = 'AddCategory'
  modalVisible.value = true
}
const handleAddCategory = async () => { // 添加分类接口请求 在弹窗确认事件中调用
  const params = {
    name: modalFormState.value.name!.toString(),
    parentId: modalFormState.value.parentId ? modalFormState.value.parentId!.toString() : null
  }
  await consumableCategoryInsert(params)
  handleGetConsumableCategoryTree()
}
const handleEditCategory = async () => { // 添加分类接口请求 在弹窗确认事件中调用
  const params = {
    name: modalFormState.value.name!.toString(),
    parentId: modalFormState.value.parentId as string ?? undefined,
    id: modalFormState.value.id!.toString()
  }
  await consumableCategoryUpdate(params)
  handleGetConsumableCategoryTree()
}
const onContextMenuClick = (id: string, name:string, parentId: string, menuKey: string | number) => {
  if (menuKey === 'edit') {
    addClass(id);
    modalTitle.value = '编辑分类'
    modalFormState.value.name = name
    modalFormState.value.parentId = parentId || undefined
    modalFormState.value.id = id
    modalAction.value = 'EditCategory'
  } else {
    Modal.confirm({
      title: `确认删除名为${name}的分类`,
      okType: 'danger',
      async  onOk () {
        await consumableCategoryDel({ id })
        handleGetConsumableCategoryTree()
      }
    });
  }
};

// 弹窗确认事件
const handleOk = async () => {
  try {
    modalLoading.value = true
    if (modalAction.value === 'AddCategory') {
      await handleAddCategory()
    } else if (modalAction.value === 'EditCategory') {
      await handleEditCategory()
    } else {
    }
    message.success('操作成功')
    modalVisible.value = false
  } catch (error) {
    modalLoading.value = false
    const errorData = (error as {data:unknown;}).data as { code:number; data:{name:string;};}
    if (errorData.code === 412) {
      message.error(errorData.data.name)
    }
  } finally {
    modalLoading.value = false
  }
}

watch(() => selectedKeys.value, () => {
  emits('update:selectedKeys', selectedKeys.value)
}, { deep: true })

onMounted(async () => {
  await handleGetConsumableCategoryTree()
})
</script>
<style scoped lang="less">
.tree-left {
  width: 200px;
  padding: 0 20px;

  .tree-title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title {
      font-size: 16px;
      font-weight: 500;
      font-family: PingFang SC-Medium;
    }
  }
}
:deep(.asset-management-empty-image svg){
  max-width: 100%;
}
</style>
<style lang="less">
.consumable-category-popover{
  .asset-management-popover-inner-content{
    padding: 0;
  }
}
</style>
