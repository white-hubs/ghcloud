<template>
  <a-button v-if="!readonly" type="primary" shape="round" @click="showPicker"
    style="height: 32px !important; padding: 4px 16px !important;">
    选择人员</a-button>
  <span class="placeholder" v-if='!readonly'> {{ placeholder }}</span>
  <OrgPicker title="人员" :url="'getStaffList'" :columns="columns" ref="orgPickerRef" :activeId="activeId" @close="selected" :selectionType="props.multiple?'checkbox':'radio'" :search="search" :selectedRows="selectedRows"/>
  <template v-if="readonly">
    <span>{{ props.modelValue?.map(item => item.name).join('、') || '--' }}</span>
  </template>
  <div v-else style="margin-top: 5px">
    <div class="org-item" style="margin: 5px" :key="i" v-for="(dept, i) in props.modelValue">
      {{ dept.name }}
      <CloseOutlined @click="delDept(i)" />
    </div>
  </div>
</template>
<script setup lang="tsx">
import { CloseOutlined } from '@ant-design/icons-vue'
import { inject, onMounted, ref, watch,h, Ref } from 'vue'
import OrgPicker from './OrgPicker.vue'
//@ts-ignore
import { getStaffDetail } from '@/api/staff'
import PopOver from "@/components/common/PopOver.vue"
import { ProcessType } from "@/typings/process"
import { deptList } from '@/api/ouaa'
import { Popover, message } from 'ant-design-vue'
import { Application } from '@ghcloud/cube-ouaa-service'
const processType = inject("processType");

const props = withDefaults(defineProps<{
  modelValue?: any[];
  placeholder?: string;
  defaultValue?: boolean;
  formData?: any;
  readonly?: boolean;
  multiple?: boolean;
  params?: string;
}>(), {
  modelValue: () => { return [] },
  placeholder: "请选择人员",
  defaultValue: false,
  readonly: false,
  multiple: false
})
const emits = defineEmits(['update:modelValue', 'clearValidate'])
const orgPickerRef = ref()
const activeId = ref<string[]>([])
const selectedRows = ref<{id:string,name:string}[]>([])
const apps=inject('applications') as Ref;
const depID = sessionStorage.getItem("GH-UserInfo") ? JSON.parse(sessionStorage.getItem("GH-UserInfo") as string)?.organizations?.[0]?.id : null;
const search = ref()
const columns=ref()
const initSearchDep=()=>{
  const statusType=new Map([
  ['REST','休息'],
  ['WORKING','在岗'],
  ['LEAVE_POST','离岗'],
  ['AWAY_BUSINESS','出差'],
  ['ASK_LEAVE','请假'],
])
  const statusOptions=[
    { text: '休息', value: 'REST' },
    { text: '在岗', value: 'WORKING' },
    { text: '离岗', value: 'LEAVE_POST' },
    { text: '出差', value: 'AWAY_BUSINESS' },
    { text: '请假', value: 'ASK_LEAVE' },
  ]
  if(!!apps.value.find((x:Application)=>x.code==='ATTENDANCE_MANAGEMENT')){
    search.value=[
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
        label: '状态',
        placeholder: "请选择",
        value: 'workStatus',
        component: 'a-select',
        options: statusOptions,
        fieldNames: { label: 'text', value: 'value'},
        disabled: false,
        defaultValue:undefined
      },
      {
        label: '',
        placeholder: "请输入人员名称",
        value: 'keyword'
      }
    ]
    columns.value=[
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
        dataIndex: "organizations",
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
      {
        title: "状态",
        dataIndex: "workStatus",
        align: "left",
        customRender: ({ text }: any) => {
          if (text) {
            return statusType.get(text);
          } else {
            return "--";
          }
        },
      },
    ]
  }else{
    search.value=[
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
    columns.value=[
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
        dataIndex: "organizations",
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
  }
}
watch(()=>{
  if(props.params){
    return props.formData[props.params]
  }
  return undefined
},()=>{
  emits('update:modelValue',null)
  activeId.value=[]
  selectedRows.value=[]
})

const selected = (values: any) => {
  if (values) {
    emits('update:modelValue', values.map((item: any) => { return { id: item.id, name: item.name } }))
    emits('clearValidate')
    activeId.value = values.map((item: any) => {
      return item.id;
    })
    selectedRows.value=values.map((e: any)=>{return e})
  }
}
const delDept = (i: number) => {
  let values: any[] = JSON.parse(JSON.stringify(props.modelValue));
  values.splice(i, 1);
  emits('update:modelValue', values.length ? values : null)
  activeId.value = values.map((item: any) => {
    return item.id;
  })
  selectedRows.value=values.map((e: any)=>{return e})
}

onMounted(() => {
  //自动带出当前员工
  if (props.defaultValue && processType === ProcessType.ADD) {
    const formParams = {
      id: props.formData.sponsorId
    };
    getStaffDetail(formParams).then((res) => {
      if (res) {
        selected([res])
      }
    });
  }
  deptList({enabled:true}).then(res => {
    search.value[0].options = res
  })

  if(props.modelValue&&!props.readonly){
    selectedRows.value=props.modelValue??[]
  }
  initSearchDep()
})

const showPicker = () => {
  if (props.params) {
    if (!props.formData[props.params]||props.formData[props.params].length===0) {
      message.warning('请先选择部门')
      return
    }
    search.value[0].disabled = true
    search.value[0].defaultValue = props.formData[props.params][0].id
  }
  orgPickerRef.value.show()
}
defineExpose({
  showPicker
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