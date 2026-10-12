<template>
  <div class="push" @click="orgPickerRef.show()"></div>
  <OrgPicker title="人员" :url="'getStaffList'" :columns="columns" ref="orgPickerRef" :activeId="activeId"
    @close="selected" :selectionType="'checkbox'" :disabledId="disabledId" :search="search"/>
</template>
<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import OrgPicker from '../formItems/business/OrgPicker.vue';
import PopOver from "@/components/common/PopOver.vue";
import { deptList } from '@/api/ouaa'

const props = withDefaults(defineProps<{
  modelValue?: any[];
  placeholder?: string;
  defaultValue?: boolean;
  formData?: any;
  readonly?: boolean;
  multiple?: boolean;
  activeId: string[];
  disabledId: string[];
}>(), {
  modelValue: () => { return [] },
  placeholder: "请选择人员",
  defaultValue: false,
  readonly: false,
  multiple: false,
  activeId: () => [],
  disabledId: () => [],
})
const emits = defineEmits(['update:modelValue', 'push'])
const orgPickerRef = ref()
const columns = [
  {
    title: "人员名称",
    dataIndex: "name",
    align: "left",
    customRender: ({ text }: any) => {
      return <PopOver content={text}>{text}</PopOver>
    },
  },
  {
    title: "部门",
    align: "left",
    customRender: ({ record }: any) => {
      if (record.organizations&&record.organizations.length) {
        return <PopOver content={record.organizations[0].name}>{record.organizations[0].name}</PopOver>;
      } else {
        return <PopOver content='--'>--</PopOver>;
      }
    },
  },
  {
    title: "联系电话",
    dataIndex: "mobile",
    align: "left",
    customRender: ({ text }: any) => {
      if (text) {
        return text;
      } else {
        return "--";
      }
    },
  },
]
const depID = sessionStorage.getItem("GH-UserInfo") ? JSON.parse(sessionStorage.getItem("GH-UserInfo") as string)?.organizations?.[0]?.id : null;
const search=ref(
  [
    {
      label:'部门',
      placeholder:"请选择",
      value:'organizationId',
      component:'a-tree-select',
      options:[],
      fieldNames:{ label: 'name', value: 'id', children:'children'},
      defaultValue:depID??undefined
    },
    {
      label:'',
      placeholder:"请输入人员名称",
      value:'keyword'
    }
  ]
)

const selected = (values: any) => {
  if (values) {
    emits('update:modelValue', values)
    emits('push', values)
  }
}

onMounted(()=>{
  deptList({}).then(res=>{
    search.value[0].options=res
  })
})
</script>
<style scoped lang="less">
.push {
  width: 50px;
  height: 50px;
  background: #f5f6f9;
  border-radius: 4px;
  position: relative;
  display: inline-block;
  cursor: pointer;

  &::after {
    content: "+";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 32px;
    color: #999999;
  }
}
</style>