<template>
  <div class="object-select">
    <a-select :value="state.selected.map(e=>e.id)" mode="multiple" @change="handleChange" :open="false" v-if="!props.readonly">
      <a-select-option :value="item.id" v-for="item in state.selected" :key="item.id">{{ item.name??item.projectName??item.patrolLocationName }}</a-select-option>
    </a-select>
    <span v-else>{{ (props.modelValue && props.modelValue.length) && (props.modelValue[0].name || '--') }}</span>
    <a-button type="primary" @click="open" v-if="!props.readonly">选择对象</a-button>
    <a-modal v-model:visible="modalVisible" :width="1200" :title="modalTitle" @cancel="modalVisible = false" @ok="ok"
      centered class="org-picker-modal" v-if="!props.readonly">
      <a-form layout="inline" class="modal-form" v-if="modalSearch.length > 0" style="margin-bottom: 15px;">
        <a-form-item v-for="(item, index) in modalSearch" :label="item.label" :key="index">
          <component v-model:value="formState[item.value]" :is="item.component ? item.component : 'a-input'"
            :placeholder="item.placeholder ? item.placeholder : '请输入'" :options="item.options ? item.options : []"
            :treeData="item.options ? item.options : []" :field="item.field ? item.field : null"
            :url="item.url ? item.url : null" :fieldNames="item.fieldNames ? item.fieldNames : null"
            :params="item.params ? item.params : null" :disabled="item.disabled ? item.disabled : false"
            :changeOnSelect="item.changeOnSelect ? item.changeOnSelect : false"
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
    <DeviceModalTable ref="deviceModalTableRef" @ok='deviceModalOnOk' :value="state.selected" :multiple="false"/>
  </div>
</template>
<script lang="tsx" setup>
import { DeviceModalTable } from '@ghcloud/generic-component'
import { deptList } from '@/api/ouaa'
import { computed, inject, onMounted, reactive, ref, unref, watch } from 'vue'
import PopOver from "@/components/common/PopOver.vue";
import { getAssemblyClassify, getPropertyDetailedPage, getRiskSource } from '@/api/property/index'
import { getInspectSceneTypeList, getInspectpointList } from '@/api/inspect'
import { getAreaList, getGearPage, getGearTypeList } from '@/api/mdata'
import message from 'ant-design-vue/es/message'
import { projectScheduleList } from '@/api/smallScattered';
import { cubeMaintainService } from '@/api/service';
import { useRoute } from 'vue-router'

type IdName = {
  id: string;
  name: string;
  projectName?:string;
  patrolLocationName?:string;
}
enum ObjectType {
  设备='DEVICE',
  档位='STALL',
  资产='PROPERTY',
  现场点='SITE_POINT',
  小散工程='SMALL_ENGINEERING',
  巡更点='PATROL_POINT',
  风险源='RISK_SOURCE'
}
const emits = defineEmits(['update:modelValue'])
const apiContext: Record<string, (params: any) => Promise<unknown>> = {
  'PROPERTY' : getPropertyDetailedPage,
  'SITE_POINT': getInspectpointList,
  'STALL': getGearPage,
  'SMALL_ENGINEERING':projectScheduleList,
  'RISK_SOURCE':getRiskSource
}

const props = withDefaults(defineProps<{
  modelValue?: IdName[] | null;
  readonly?: boolean,
  params: string,
  formData: Record<string, any>,
}>(), {
  modelValue: null,
  readonly: false,
})

const deviceModalTableRef=ref()
const businessType = inject("businessType") as string;
const modalVisible = ref(false)
const depSelectOptions = ref([])
const areaOptions = ref([])
const assetTypeOptions = ref<IdName[]>([])
const deviceTypeOptions = ref<IdName[]>([])
const sceneTypeOptions = ref<IdName[]>([])
const gearTypeOptions = ref<IdName[]>([])
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
const modalSearch = computed(() => {
  const res: any[] = []
  if (objectType.value) {
    if (objectType.value === 'DEVICE') {
      res.push({
        label: '设备类型',
        placeholder: "请选择",
        value: 'genreId',
        component: 'a-select',
        options: deviceTypeOptions.value,
        fieldNames: { label: 'name', value: 'id', children: 'children' }
      })
      res.push({
        label: '部门',
        placeholder: "请选择",
        value: 'departmentId',
        component: 'a-tree-select',
        options: depSelectOptions.value,
        fieldNames: { label: 'name', value: 'id', children: 'children' }
      })
      res.push({
        label: '',
        placeholder: "请输入名称",
        value: 'keyword'
      })
    } else if (objectType.value === 'STALL') {
      res.push({
        label: '档位类型',
        placeholder: "请选择",
        value: 'type',
        component: 'a-select',
        options: gearTypeOptions.value,
        fieldNames: { label: 'name', value: 'id', children: 'children' }
      })
      res.push({
        label: '所属区域',
        placeholder: "请选择",
        value: 'areaId',
        component: 'a-cascader',
        options: areaOptions.value,
        fieldNames: { label: 'name', value: 'id', children: 'children' },
        changeOnSelect:true
      })
      res.push({
        label: '',
        placeholder: "请输入名称",
        value: 'keyword'
      })
    } else if (objectType.value === 'PROPERTY') {
      res.push({
        label: '类型',
        placeholder: "请选择",
        value: 'typeId',
        component: 'a-select',
        options: assetTypeOptions.value,
        fieldNames: { label: 'name', value: 'id', children: 'children' }
      })
      res.push({
        label: '部门',
        placeholder: "请选择",
        value: 'receiveDepId',
        component: 'a-tree-select',
        options: depSelectOptions.value,
        fieldNames: { label: 'name', value: 'id', children: 'children' }
      })
      res.push({
        label: '',
        placeholder: "请输入名称",
        value: 'keyword'
      })
    } else if (objectType.value === 'SITE_POINT') {
      res.push({
        label: '类型',
        placeholder: "请选择",
        value: 'typeId',
        component: 'a-select',
        options: sceneTypeOptions.value,
        fieldNames: { label: 'name', value: 'id', children: 'children' }
      })
      res.push({
        label: '部门',
        placeholder: "请选择",
        value: 'receiveDepId',
        component: 'a-tree-select',
        options: depSelectOptions.value,
        fieldNames: { label: 'name', value: 'id', children: 'children' }
      })
      res.push({
        label: '',
        placeholder: "请输入名称",
        value: 'pointName'
      })
    }else if(objectType.value==='SMALL_ENGINEERING'){
      res.push({
        label: '状态',
        placeholder: "请选择",
        value: 'status',
        component: 'a-select',
        options: [{label:'进行中',value:'UNDERWAY'},{label:'已完成',value:'COMPLETED'},{label:'待验收',value:'WAIT_ACCEPT'},]
      })
      res.push({
        label: '部门',
        placeholder: "请选择",
        value: 'depId',
        component: 'a-tree-select',
        options: depSelectOptions.value,
        fieldNames: { label: 'name', value: 'id', children: 'children' }
      })
      res.push({
        label: '',
        placeholder: "请输入名称",
        value: 'keyword'
      })
    }else{
      res.push({
        label: '',
        placeholder: "请输入名称",
        value: 'keyword',
      })
    }
  }
  return res
})
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
      return <PopOver content={text||'--'}>{(typeof text ==='object'?text?.map(x=>x.name).join('/'):text)||'--'}</PopOver>
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
  if(objectType.value===ObjectType.现场点){
    dep.dataIndex='depName'
  }
  if(objectType.value===ObjectType.设备){
    dep.dataIndex='departmentName'
    typeName.dataIndex='genreName'
  }
  if(objectType.value===ObjectType.档位){
    areaName.dataIndex='areaNames'
    dep.dataIndex='deptNames'
    dep.customRender=({ text }: any) => {
      const name = (text as string[]).join('/') || '--'
      return <PopOver content={name}>{name}</PopOver>
    }
  }
  if(objectType.value===ObjectType.巡更点){
    name.dataIndex='patrolLocationName'
    areaName.dataIndex='area'
  }
  if(objectType.value===ObjectType.小散工程||!props.params&&route.query.businessType==='PROJECT_REFORM'){
    name.dataIndex='projectName'
    dep.dataIndex='depName'
    typeName.dataIndex='projectTypeName'
    areaName.dataIndex='areaNames'
  }
  const res=  objectType.value===ObjectType.小散工程
    ?[
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
    :objectType.value===ObjectType.巡更点?[
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
      areaName
    ]:[
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
      areaName
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
    // getCheckboxProps: (row: any) => ({
    //   disabled: props.disabledId.includes(row.id)
    // }),
  };
});

watch(()=>objectType.value,()=>{
  formState.value={}
  state.selected = []
  emits('update:modelValue', null)
  if(objectType.value===ObjectType.资产){
    getAssemblyClassify({ pageNumber: 1, pageSize: 1000, type: 'assetType' }).then(res => {
      if (res) {
        assetTypeOptions.value = res.records as IdName[]
      }
    })
  }else if(objectType.value===ObjectType.设备){

  }else if(objectType.value===ObjectType.现场点){
    getInspectSceneTypeList().then(res => {
      if (res) {
        sceneTypeOptions.value = res as IdName[]
      }
    })
  }else if(objectType.value===ObjectType.档位){
    getGearTypeList().then(res => {
      if (res) {
        gearTypeOptions.value = res.records as IdName[]
      }
    })
  }
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
  if(objectType.value===ObjectType.档位){
    const areaIds= formParams.areaId as unknown as string[]
    (areaIds&&areaIds.length )&& (formParams.areaId=areaIds[areaIds.length-1])
  }
  try {
    loading.value = true
    if(objectType.value==='PATROL_POINT'){
      const res=await cubeMaintainService.patrolPage({...formParams})
      dataSource.value = res.records ?? [];
      pagination.value.total = res.total;
    }else if(!props.params&&route.query.businessType==='PROJECT_REFORM'){
      await apiContext['SMALL_ENGINEERING'](formParams).then((res: any) => {
      dataSource.value = res.records ?? [];
      pagination.value.total = res.total;
      })
    }else{
      await apiContext[objectType.value](formParams).then((res: any) => {
      dataSource.value = res.records ?? [];
      pagination.value.total = res.total;
    });
    }
    getFilter()
  } catch (error) {
    loading.value = false
  } finally {
    setTimeout(() => {
      loading.value = false
    }, 300);
  }
};
const changePage = (e: { current: number, pageSize: number }) => {
  pagination.value.current = e.current;
  pagination.value.pageSize = e.pageSize;
  getData();
};
const reset = () => {
  modalSearch.value.forEach((item) => {
    formState.value[item.value] = item.defaultValue ? item.defaultValue : '';
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
  if(objectType.value==='DEVICE'){
    deviceModalTableRef.value?.openModal()
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
const deviceModalOnOk=(values:{ id: string; name: string; }[])=>{
  state.selected = values
  emitValue()
}

const handleChange = (val: string) => {
  state.selected = state.selected.filter((item: { id: string; }) => val.indexOf(item.id) > -1);
  emitValue()
};

onMounted(async () => {
  deptList({}).then(res => {
    depSelectOptions.value = res
  })
  getAreaList().then(res=>{
    areaOptions.value = res
  })
  if(props.modelValue){
    state.selected=props.modelValue
  }
})
</script>
<style lang="less">.object-select {
  display: flex;
}</style>
