<template>
  <div class="object-select">
    <a-select :value="state.selected.map(e=>e.id)" mode="multiple" @change="handleChange" :open="false"
      v-if="!props.readonly">
      <a-select-option :value="item.id" v-for="item in state.selected" :key="item.id">{{
        item.name??item.projectName??item.patrolLocationName }}</a-select-option>
    </a-select>
    <span v-else>{{ (props.modelValue && props.modelValue.length) && (props.modelValue[0].name || '--') }}</span>
    <a-button type="primary" @click="open" v-if="!props.readonly">选择对象</a-button>
    <a-modal v-model:visible="modalVisible" :width="1200" :title="modalTitle" @cancel="modalVisible = false" @ok="ok"
      centered class="org-picker-modal" v-if="!props.readonly">
      <a-form layout="inline" class="modal-form" v-if="modalSearch.length > 0" style="margin-bottom: 15px;">
        <a-form-item v-for="(item, index) in modalSearch" :label="item.label" :key="index">
          <component v-model:value="formState[item.value]" :is="item.component ? item.component : 'a-input'"
            :placeholder="item.placeholder ? item.placeholder : '请输入'" :options="item.options ? item.options : []"
            :treeData="item.options ? item.options : []" :fieldNames="item.fieldNames ? item.fieldNames : {}"
            :style="{ width: '218px !important' }" allowClear></component>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="query">查询</a-button>
        </a-form-item>
        <a-form-item>
          <a-button @click="reset">重置</a-button>
        </a-form-item>
      </a-form>
      <a-table rowKey="id" :dataSource="dataSource" :columns="modalColumns" :row-selection="rowSelection"
        :pagination="pagination" :scroll="{ y: 450 }" size="small" @change="changePage" :loading="loading">
      </a-table>
    </a-modal>
  </div>
</template>
<script lang="tsx" setup>
import { deptList } from '@/api/ouaa'
import { computed, inject, onMounted, reactive, ref, unref, watch } from 'vue'
import PopOver from "@/components/common/PopOver.vue";
import message from 'ant-design-vue/es/message'
import { projectScheduleList } from '@/api/smallScattered';
import { useRoute } from 'vue-router'
type IdName = {
  id: string;
  name: string;
  projectName?:string;
  patrolLocationName?:string;
}
const emits = defineEmits(['update:modelValue'])
const props = withDefaults(defineProps<{
  modelValue?: IdName[] | null;
  readonly?: boolean,
  params: string,
  formData: Record<string, any>,
}>(), {
  modelValue: null,
  readonly: false,
})
const businessType = inject("businessType") as string;
const modalVisible = ref(false)
const depSelectOptions = ref([])
const route=useRoute()
const loading = ref(false)
const formState = ref<Record<string, any>>({})
const dataSource = ref([])
const pagination = ref({
  total: 0,
  position: "bottom",
  pageSize: 10,
  current: 1,
})
const state=reactive<{
  selectedRows:IdName[],
  selectedRowKeys:string[],
  selected:IdName[],
}>({
  selectedRows:[],
  selectedRowKeys:[],
  selected:[]
})


const objectType = computed(() => {
  if (props.formData && props.params) {
    return props.formData[props.params] ?? ''
  }
  return ''
})
const modalTitle = computed(() => {
  let name = ''
  if (businessType === 'FAULT') {
    name = '故障'
  } else if (businessType === 'HIDDENDANGER') {
    name = '隐患'
  }
  return '选择' + name + '对象'
})
const modalSearch =ref() 
const modalColumns = computed(() => {
  const dep = {
    title: "部门",
    dataIndex: "receiveDepName",
    align: "left",
    customRender: ({ text }: any) => {
      return <PopOver content={text||'--'}>{text||'--'}</PopOver>
    },
  }
  const typeName={
    title: "类别",
    dataIndex: "typeName",
    align: "left",
    customRender: ({ text }: any) => {
      return <PopOver content={text||'--'}>{text||'--'}</PopOver>
    },
  }
  const areaName={
    title: "区域",
    dataIndex: "areaName",
    align: "left",
    customRender: ({ text }: any) => {
      return <PopOver content={text||'--'}>{(typeof text ==='object'?text?.map((x:any)=>x.name).join('/'):text)||'--'}</PopOver>
    },
  }
  const name={
      title: "名称",
      dataIndex: "name",
      align: "left",
      customRender: ({ text }: any) => {
        return <PopOver content={text||'--'}>{text||'--'}</PopOver>
      },
    }
  name.dataIndex='projectName'
  dep.dataIndex='depName'
  typeName.dataIndex='projectTypeName'
  areaName.dataIndex='areaNames'
  const res= [
  {
        title: "序号",
        dataIndex: "key",
        align: "center",
        customRender: ({ index }: any): string => {
          return index + 1;
        },
        width: 100,
      },
      name,
      typeName,
      dep,
    ]
  return res
})
const rowSelection = computed(() => {
  return {
    preserveSelectedRowKeys: true,
    selectedRowKeys: unref(state.selectedRowKeys),
    type: 'radio',
    onChange: (keys: any, selectedRows: any) => {
      state.selectedRowKeys = keys;
      selectedRows.forEach((item: any) => {
        if(item){
          const index = state.selectedRows.findIndex((s: { id: string; }) => s.id === item.id);
          if (index === -1) {
            state.selectedRows.push(item as never);
          }
        }
      });
    },
  };
});

watch(()=>objectType.value,()=>{
  formState.value={}
  state.selected = []
  emits('update:modelValue', null)
})

const getFilter = () => {
  state.selected = [];
  state.selected = state.selectedRows.filter((item: { id: string; }) => {
    if (state.selectedRowKeys.indexOf(item.id as never) > -1) {
      return item;
    }
  });
};
const getData =async () => {
  const formParams:Record<string,string|number|boolean> = {
    ...formState.value,
    pageNumber: pagination.value.current,
    pageSize: pagination.value.pageSize,
    enabled:true
  };
  try {
    loading.value = true
      await projectScheduleList(formParams).then((res: any) => {
      dataSource.value = res.records ?? [];
      pagination.value.total = res.total;
      })
    getFilter()
  } catch (error) {
    loading.value = false
  } finally {
      loading.value = false
  }
};
const changePage = (e: { current: number, pageSize: number }) => {
  pagination.value.current = e.current;
  pagination.value.pageSize = e.pageSize;
  getData();
};
const reset = () => {
  modalSearch.value.forEach((item:any) => {
    formState.value[item.value] = '';
  });
  pagination.value.current = 1
  pagination.value.pageSize = 10
  getData();
};
const query = () => {
  pagination.value.current = 1;
  getData();
}
const open = () => {
  if(!props.params&&route.query.businessType==='PROJECT_REFORM'){
    state.selectedRowKeys = state.selected.map(e=>e.id);
    state.selectedRows = state.selected
    modalVisible.value = true
    reset()
    return
  }
  if(!objectType.value){
    message.error('请先选择对象类型')
    return
  }
  state.selectedRowKeys = state.selected.map(e=>e.id);
  state.selectedRows = state.selected
  modalVisible.value = true
  reset()
}
const emitValue=()=>{
  const value = state.selected.map((e:IdName)=>{
    return {
      id:e.id,
      name:e.name??e.patrolLocationName??e.projectName
    }
  })
  emits('update:modelValue', value)
}
// 弹窗确定事件
const ok = () => {
  getFilter()
  emitValue()
  modalVisible.value=false
}

const handleChange = (val: string) => {
  state.selected = state.selected.filter((item: { id: string; }) => val.indexOf(item.id) > -1);
  emitValue()
};

onMounted(async () => {
  deptList({}).then(res => {
    depSelectOptions.value = res
    modalSearch.value=[
      {
        label: '状态',
        placeholder: "请选择",
        value: 'status',
        component: 'a-select',
        options: [{label:'进行中',value:'UNDERWAY'},{label:'已完成',value:'COMPLETED'},{label:'待验收',value:'WAIT_ACCEPT'},]
      },
      {
        label: '部门',
        placeholder: "请选择",
        value: 'depId',
        component: 'a-tree-select',
        options: depSelectOptions.value,
        fieldNames: { label: 'name', value: 'id', children: 'children' }
      },
      {
        label: '',
        placeholder: "请输入名称",
        value: 'keyword'
      },
    ]
  })
  if(props.modelValue){
    state.selected=props.modelValue
  }
})
</script>
<style lang="less">
.object-select {
  display: flex;
}
</style>
