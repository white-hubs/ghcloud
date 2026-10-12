<template>
  <ModalPicker ref="orgPickerRef" title="请假单" :columns="columns" :active-id="activeId"
    :selected-rows="selectedRows" :selection-type="'radio'" :search="search" @close="selected" v-if="!props.readonly"/>
  <div>
    <a-input-group compact v-if="!props.readonly">
      <a-select v-model:value="userSelect" style="width: 50%" :open="false" mode="multiple" placeholder="请选择" :options="selectOption" @change="userSelectChange">
        <template #suffixIcon />
      </a-select>
      <a-button type="primary" @click="orgPickerRef.show()">选择</a-button>
    </a-input-group>
    <span v-else>{{ props.modelValue?props.modelValue.flowInstanceName:'--' }}</span>
  </div>
</template>
<script setup lang="tsx">
import type { ColumnsType } from 'ant-design-vue/es/table/Table'
import { computed, ref } from 'vue'
import ModalPicker from './modal.vue';
import dayjs from 'dayjs'
import { Popover } from 'ant-design-vue'

const props = withDefaults(defineProps<{
  modelValue?: {id:string; flowInstanceName:string;};
  readonly?:boolean;
}>(), {
  readonly: false,
})
const emits = defineEmits(['update:modelValue','clearValidate'])
const orgPickerRef = ref()
const activeId = ref<string[]>(props.modelValue ? [props.modelValue.id] : [])
const selectedRows = ref(props.modelValue ?[props.modelValue]:[])

const search: any[] = []
const statusText = (str: string): string => {
  const statusMap = new Map([
    ['SUBMIT', '提交'],
    ['UNDO', '撤销'],
    ['REPEAT', '重新提交'],
    ['APPROVAL', '审批'],
    ['BACK', '撤回'],
    ['COPY', '抄送'],
    ['REJECT', '驳回'],
    ['FINISHED', '完成']
  ])
  return statusMap.get(str) || '处理中'
}
const columns = computed(():ColumnsType => {
  let res: ColumnsType = [
    {
      title: '编号',
      dataIndex: 'flowFromNo',
      align: 'left',
      width:150,
      customRender: ({ text }: { text: string; }) => {
        return  <Popover content={text}>{text}</Popover>
      }
    },
    {
      title: '请假单名称',
      dataIndex: 'flowInstanceName',
      align: 'left',
      customRender: ({ text }: { text: string; }) => {
        return  <Popover content={text}>{text}</Popover>
      }
    },
    {
      title: '发起时间',
      dataIndex: 'flowSubmitTime',
      align: 'left',
      customRender: ({ text }: { text: string; }) => {
        const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'
        return  <Popover content={time}>{time}</Popover>
      }
    },
    {
      title: '请假开始时间',
      dataIndex: 'leaveStartTime',
      align: 'left',
      customRender: ({ text }: { text: string; }) => {
        const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-'
        return <Popover content={time}>{time}</Popover>
      }
    },
    {
      title: '请假结束时间',
      dataIndex: 'leaveEndTime',
      align: 'left',
      customRender: ({ text }: { text: string; }) => {
        const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-'
        return <Popover content={time}>{time}</Popover>
      }
    },
    {
        title: '处理状态',
        dataIndex: 'flowStatus',
        key: 'flowStatus',
        customRender: ({ text }: { text: string; }) => {
          text = text ? statusText(text) : '-'
          return <Popover content={text || '--'}>{text || '--'}</Popover>
        }
      },
  ]
  return res
})

type RawValue = string | number;
const userSelect = ref<RawValue[]>(props.modelValue ? [props.modelValue.id] : [])
const selectOption = ref<{label:string; value:string;}[]>(
  props.modelValue ? [{ label: props.modelValue.flowInstanceName, value: props.modelValue.id }] : []
)

const selected = (values: {[x: string]: string;id:string;flowInstanceName:string;}[]) => {
  if (values) {
    selectOption.value = values.map(e => {
      return { label: e.flowInstanceName, value: e.id }
    })
    userSelect.value = values.map(e => e.id)
    activeId.value = values.map((item: {id:string;}) => {
      return item.id;
    })
    emits('update:modelValue',values[0])
    emits('clearValidate')
  }
}

const  userSelectChange=()=>{
  if(userSelect.value.length===0){
    activeId.value.length=0
    emits('update:modelValue',null)
  }
}

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
