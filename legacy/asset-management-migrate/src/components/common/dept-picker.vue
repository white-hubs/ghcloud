<template>
  <Button type="primary"  shape="round" @click="orgPickerRef.show()">选择部门</Button>
  <OrgPicker title="部门" :url="'deptList'" :columns="columns" ref="orgPickerRef" :activeId="activeId" @close="selected" :selectionType="props.multiple?'checkbox':'radio'" />

  <div :style="{marginTop:readonly?0:'5px'}">
    <div class="org-item" style="margin: 5px" :key="i" v-for="(dept, i) in props.modelValue">
      {{ dept.name }}
      <CloseOutlined @click="delDept(i)" v-if="!readonly" />
    </div>
  </div>
</template>
<script setup lang="tsx">
import { CloseOutlined } from '@ant-design/icons-vue'
import { onMounted, ref } from 'vue'
import OrgPicker from './org-picker.vue'
import {  getStaffDetail } from '@/api/ouaa/ouaa'
import { Popover } from 'ant-design-vue/es'
import type { ColumnsType } from 'ant-design-vue/es/table/Table'

const props = withDefaults(defineProps<{
  modelValue?: any[];
  placeholder?: string;
  readonly?: boolean;
  formData?: any;
  defaultValue?: boolean;
  multiple?:boolean;
}>(), {
  modelValue: () => { return [] },
  placeholder: "请选择部门",
  defaultValue: false,
  readonly: false,
  multiple:false
})
const emits = defineEmits(['update:modelValue','clearValidate'])
const orgPickerRef = ref()
const activeId = ref<any[]>([])

const columns:ColumnsType = [
  {
    title: "部门名称",
    dataIndex: "name",
    align: "left",
    customRender: ({ text }: any) => {
      return <Popover content={text}>{text}</Popover>
    },
  }
]

const selected = (values: any) => {
  if (values.length) {
    emits('update:modelValue', values)
    //重新触发表单校验
    emits('clearValidate')
    activeId.value = values.map((item: any) => {
      return item.id;
    })
  }
}
const delDept = (i: number) => {
  let values: any[] = JSON.parse(JSON.stringify(props.modelValue));
  values.splice(i, 1);
  emits('update:modelValue', values.length ? values : null)
  activeId.value = values.map((item: any) => {
    return item.id;
  })
}

onMounted(() => {
  //自动带出当前员工的部门
  if (props.defaultValue && sessionStorage.getItem('GH-UserInfo')) {
    const formParams = {
      id: JSON.parse(sessionStorage.getItem('GH-UserInfo') as string).id
    };
    getStaffDetail(formParams).then((res:any) => {
      if (res&&res.data.organizations&&res.data.organizations.length) {
        selected([{id:res.data.organizations[0].id,name:res.data.organizations[0].name}])
      }
    });
  }
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