<template>
  <OrgPicker ref="orgPickerRef" :title="ouaaName" :url="url" :columns="columns" :active-id="activeId"
    :selected-rows="selectedRows" :selection-type="props.multiple?'checkbox':'radio'" :search="search"
    @close="selected" />
  <div>
    <InputGroup compact>
      <Select v-model:value="userSelect" style="width: 200px" :open="false" mode="multiple" :options="selectOption">
        <template #suffixIcon />
      </Select>
      <Button type="primary" @click="orgPickerRef.show()">选择{{ ouaaName }}</Button>
    </InputGroup>
  </div>
</template>
<script setup lang="tsx">
import type { ColumnsType } from 'ant-design-vue/es/table/Table'
import { computed, h, ref, watch } from 'vue'
import OrgPicker from '../org-picker.vue';
import { OuaaEnum, ouaaOptions } from './ouaa-picker'
import { Popover } from 'ant-design-vue'
const props = withDefaults(defineProps<{
  value?: {id:string; name:string;}[];
  defaultValue?: boolean;
  readonly?:boolean;
  multiple?:boolean;
  showBtn?:boolean;
  type:OuaaEnum;
}>(), {
  value: () => { return [] },
  defaultValue: false,
  readonly: false,
  multiple: false
})
const emits = defineEmits(['update:value', 'comfirm', 'del'])
const orgPickerRef = ref()
const activeId = ref<string[]>(props.value ? props.value.map(e => e.id) : [])
const selectedRows = ref(props.value ?? [])


const ouaaName = computed(() => {
  return ouaaOptions.find(e => e.value === props.type)?.label ?? ''
})
const search = computed(() => {
  let valueKey = 'name'
  if (props.type === OuaaEnum.USER) {
    valueKey = 'keyword'
  }
  return [
    {
      label: '',
      placeholder: '请输入' + ouaaName.value + '名称',
      value: valueKey
    }
  ]
})

const columns = computed(():ColumnsType => {
  let res: ColumnsType = []
  if (props.type === OuaaEnum.USER) {
    res = [
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
  } else if (props.type === OuaaEnum.POST) {
    res = [
      {
        title: '岗位',
        dataIndex: 'name',
        align: 'left'
      }
    ]
  } else if (props.type === OuaaEnum.ROLE) {
    res = [
      {
        title: '角色',
        dataIndex: 'name',
        align: 'left'
      }
    ]
  } else if (props.type === OuaaEnum.DEPARTMENT) {
    res = [
      {
        title: '部门',
        dataIndex: 'name',
        align: 'left'
      }
    ]
  }
  return res
})

const url = computed(() => {
  let res = '';
  if (props.type === OuaaEnum.USER) {
    res = 'getStaffPage'
  } else if (props.type === OuaaEnum.POST) {
    res = 'getPositionList'
  } else if (props.type === OuaaEnum.ROLE) {
    res = 'getRoleList'
  } else if (props.type === OuaaEnum.DEPARTMENT) {
    res = 'deptList'
  }
  return res
})

type RawValue = string | number;
const userSelect = ref<RawValue[]>(props.value ? props.value.map(e => e.id) : [])
const selectOption = ref<{label:string; value:string;}[]>(
  props.value ? props.value.map(e => { return { label: e.name, value: e.id } }) : []
)

const selected = (
  values: {
    [x: string]: string;id:string;name:string;
  }[]) => {
  if (values) {
    selectOption.value = values.map(e => {
      return { label: e.name, value: e.id }
    })
    userSelect.value = values.map(e => e.id)
    emits('comfirm', values)
    activeId.value = values.map((item: {id:string;}) => {
      return item.id;
    })
  }
}
const unWatch = ref(false)
watch(() => userSelect.value.length, () => {
  if (unWatch.value) {
    return
  }
  const value = userSelect.value.map(e => {
    const option = selectOption.value.find(ele => ele.value === e)
    return {
      id: option?.value,
      name: option?.label
    }
  })
  emits('update:value', value)
}, { deep: true })

watch(() => props.value, () => {
  unWatch.value = true
  userSelect.value = props.value ? props.value.map(e => e.id) : []
  selectOption.value = props.value ? props.value.map(e => { return { label: e.name, value: e.id } }) : []
  activeId.value = props.value ? props.value.map(e => e.id) : []
  selectedRows.value = props.value
  setTimeout(() => {
    unWatch.value = false
  }, 0);
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
