<template>
  <div class="changeperson">
    <div class="change-person-input" @click="showPicker" v-if="!props.readonly">
      <span class="placeholder" v-if='!readonly&&!props.modelValue'> {{ placeholder }}</span>
      <div v-if="props.modelValue" class="usertag">
        {{ props.modelValue.name }}
        <CloseOutlined @click.stop="clearUser" v-if="!readonly" />
      </div>
    </div>
    <span v-else>{{ props.modelValue?props.modelValue.name:"--" }}</span>
    <OrgPicker title="人员" :url="'getStaffList'" :columns="columns" ref="orgPickerRef" :activeId="activeId"
      @close="selected" selectionType="radio" :search="search" :selectedRows="selectedRows" />
  </div>
</template>
<script setup lang="tsx">
import { CloseOutlined } from '@ant-design/icons-vue'
import { onMounted, ref, watch } from 'vue'
import OrgPicker from './OrgPicker.vue'
import PopOver from "@/components/common/PopOver.vue"
import { deptList } from '@/api/ouaa'
const props = withDefaults(defineProps<{
  modelValue?: any;
  placeholder?: string;
  defaultValue?: boolean;
  formData?: any;
  readonly?: boolean;
  params?: string;
}>(), {
  modelValue: () => { return [] },
  placeholder: "请选择人员",
  defaultValue: false,
  readonly: false,
})
const emits = defineEmits(['update:modelValue', 'clearValidate'])
const orgPickerRef = ref()
const activeId = ref<string[]>([])
const selectedRows = ref<{id:string,name:string}[]>([])

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
const search = ref(
  [
    {
      label: '部门',
      placeholder: "请选择",
      value: 'organizationId',
      component: 'a-tree-select',
      options: [],
      fieldNames: { label: 'name', value: 'id', children: 'children' },
      disabled: false,
      defaultValue:depID??undefined
    },
    {
      label: '',
      placeholder: "请输入人员名称",
      value: 'keyword'
    }
  ]
)
const selected = (value: any) => {
  if (value.length) {
    emits('update:modelValue', value[0])
    emits('clearValidate')
    activeId.value =[value[0].id] ;
  }
}
const clearUser = () => {
  emits('update:modelValue',  null)
  activeId.value = []
  selectedRows.value=[]
}
onMounted(() => {
  //自动带出当前员工
  deptList({}).then(res => {
    search.value[0].options = res
  })
})

const showPicker = () => {
  if(props.readonly) return;
  orgPickerRef.value.show()
}
defineExpose({
  showPicker
})
</script>
<style scoped lang="less">
.change-person-input {
  box-sizing: border-box;
  margin: 0;
  align-items: center;
  padding: 0;
  font-variant: tabular-nums;
  list-style: none;
  font-feature-settings: 'tnum';
  position: relative;
  display: flex;
  cursor: pointer;

  width: 100%;
  min-width: 0;
  padding: 4px 11px;
  color: rgba(0, 0, 0, 0.85);
  font-size: 14px;
  line-height: 1.5715;
  background-color: #fff;
  background-image: none;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  transition: all 0.3s;

  .usertag {
    padding: 2px 11px;
    color: #fff;
    background: #87d068;
  }
}

.placeholder {
  margin-left: 10px;
  color: #adabab;
  font-size: smaller;
}

.changeperson {
  display: flex;
  align-items: center;
  gap: 20px;
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