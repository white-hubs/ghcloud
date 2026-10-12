<template>
  <Button v-if="props.showBtn" type="primary" shape="round" @click="show">选择人员</Button>
  <OrgPicker ref="orgPickerRef" title="人员" :url="'getStaffPage'" :columns="columns"
    :selection-type="props.multiple?'checkbox':'radio'" :search="search" :active-id="activeId" @close="selected"
    :selectedRows="userSelect" />
  <div :style="{marginTop:readonly?0:'5px'}">
    <div v-for="(dept, i) in userSelect" :key="i" class="org-item" style="margin: 5px">
      {{ dept.name }}
      <CloseOutlined v-if="!readonly" @click="delDept(i)" />
    </div>
  </div>
</template>
<script setup lang="tsx">
import type { ColumnsType } from 'ant-design-vue/es/table/Table'
import { h, ref, onMounted } from 'vue'
import OrgPicker from './org-picker.vue'
import { Popover, TreeSelect } from 'ant-design-vue/es'
import { deptList, getStaffDetail } from '@/api/ouaa/ouaa'

const props = withDefaults(defineProps<{
  value?: {id:string; name:string;}[];
  placeholder?: string;
  defaultValue?: boolean;
  readonly?:boolean;
  multiple?:boolean;
  showBtn?:boolean;
}>(), {
  value: () => { return [] },
  placeholder: '请选择人员',
  defaultValue: false,
  readonly: false,
  multiple: false,
  showBtn: false
})
const emits = defineEmits(['update:value', 'comfirm', 'del'])
const orgPickerRef = ref()
const activeId = ref<string[]>([])
const columns:ColumnsType = [
  {
    title: '人员名称',
    dataIndex: 'name',
    align: 'left'
  },
  {
    title: '部门',
    dataIndex: 'organizations',
    ellipsis: true,
    customRender: ({ text }: { text: { name: string; }[]; }) => {
      const data = text?.map((item) => item.name)
      if (data.length) {
        return [
          h(Popover, { content: data.join('/') }, { default: () => data.join('/') ?? '--' })
        ]
      } else {
        return '--'
      }
    }
  },
  {
    title: '联系电话',
    dataIndex: 'mobile',
    align: 'left',
  }
]
const search = ref(
  [
    {
      label: '部门',
      placeholder: '请选择',
      value: 'organizationId',
      component: TreeSelect,
      options: [],
      fieldNames: { label: 'name', value: 'id', children: 'children' }
    },
    {
      label: '',
      placeholder: '请输入人员名称',
      value: 'keyword'
    }
  ]
)

const userSelect = ref<{id:string; name:string;}[]>([])

const selected = (values: {id:string;name:string;}[]) => {
  values=values&&values.length?values:[]
  userSelect.value = values
  emits('update:value', values)
  emits('comfirm', values)
  activeId.value = values.map((item: {id:string;}) => {
    return item.id;
  })
}

const delDept = (i: number) => {
  const values: {id:string}[] = JSON.parse(JSON.stringify(props.value));
  values.splice(i, 1);
  userSelect.value.splice(i, 1);
  const emitsValue=values.length ? values : []
  activeId.value = emitsValue.map((item: {id:string;}) => {
    return item.id;
  })
  emits('update:value', emitsValue)
  emits('del')
}

onMounted(() => {
    //自动带出当前员工
  if (props.defaultValue && sessionStorage.getItem('GH-UserInfo')) {
    const formParams = {
      id: JSON.parse(sessionStorage.getItem('GH-UserInfo') as string).id
    };
    getStaffDetail(formParams).then((res) => {
      if (res) {
        selected([res.data as {id:string;name:string}])
      }
    });
  }
  deptList().then(res => {
    search.value[0].options = res.data
  })
  if (props.value) {
    userSelect.value = props.value
    activeId.value = userSelect.value.map(e => e.id)
  }
})

const show = () => {
  orgPickerRef.value.show()
}
defineExpose({
  show
})
</script>
<style scoped lang="less">
.placeholder {
  margin-left: 10px;
  color: #adabab;
  font-size: smaller;
}

.org-item {
  display: inline-block;
  height: 24px;
  padding: 0 5px;
  line-height: 24px;
  border: 1px solid transparent;
  box-shadow: 0 2px #00000004;
  color: #000000d9;
  background: #fff;
  border-color: #d9d9d9;
}
</style>
