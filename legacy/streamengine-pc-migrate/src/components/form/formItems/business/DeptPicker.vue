<template>
  <template v-if="!readonly">
    <a-button type="primary" shape="round" @click="orgPickerRef.show()">
      选择部门</a-button>
    <span class="placeholder"> {{ placeholder }}</span>
  </template>
  <OrgPicker title="部门" :url="'depTree'" 
    :columns="columns" ref="orgPickerRef" :activeId="activeId" @close="selected" 
    :selectionType="props.multiple?'checkbox':'radio'"
    :search="search"
    />

  <template v-if="readonly">
    <span>{{ props.modelValue?.map(dept => dept.name).join('、') || '--' }}</span>
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
import { inject, onMounted, ref } from 'vue'
import OrgPicker from './OrgPicker.vue'
//@ts-ignore
import { getStaffDetail } from '@/api/staff'
import PopOver from "@/components/common/PopOver.vue"
import { ProcessType } from '@/typings/process'
const processType = inject("processType");

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
  const search=ref(
  [
    {
      label:'',
      placeholder:"请输入部门名称",
      value:'name'
    }
  ]
)
const columns = [
  {
    title: "部门名称",
    dataIndex: "name",
    align: "left",
    customRender: ({ text }: any) => {
      return <PopOver content={text}>{text}</PopOver>
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
  if (props.defaultValue && processType === ProcessType.ADD) {
    const formParams = {
      id: props.formData.sponsorId
    };
    getStaffDetail(formParams).then((res) => {
      if (res&&res.organizations&&res.organizations.length) {
        selected([{id:res.organizations[0].id,name:res.organizations[0].name}])
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