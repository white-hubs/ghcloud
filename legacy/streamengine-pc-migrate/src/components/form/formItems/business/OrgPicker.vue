<template>
  <a-modal v-model:visible="state.modalVisible" :width="props.width" :title="title + '列表'" @cancel="close"
    @ok="close('ok')" centered class="org-picker-modal">
    <a-form layout="inline" :model="state.form" class="modal-form" v-if="search.length > 0">
      <a-form-item v-for="(item, index) in search" :label="item.label" :key="index">
        <component v-model:value="state.form[item.value]" :is="item.component ? item.component : 'a-input'"
          :placeholder="item.placeholder ? item.placeholder : '请输入'" :options="item.options ? item.options : []"
          :treeData="item.options ? item.options : []" :field="item.field ? item.field : null"
          :url="item.url ? item.url : null" :fieldNames="item.fieldNames ? item.fieldNames : null"
          :params="item.params ? item.params : null" :disabled="item.disabled ? item.disabled : false"
          :style="{ width: '218px !important' }" allowClear></component>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="query">查询</a-button>
      </a-form-item>
      <a-form-item>
        <a-button @click="reset">重置</a-button>
      </a-form-item>
    </a-form>
    <a-table rowKey="id" :dataSource="state.dataSource" :columns="columns" :row-selection="rowSelection"
      :pagination="state.pagination" :scroll="{ y: 450 }" size="middle" @change="changePage" :loading="loading">
    </a-table>
  </a-modal>
</template>

<script setup lang="ts">
import { depTree, getUserForPage,batchGetUserByIds, batchGetUserByRoleIds } from "@/api/ouaa"
import { getConsumablePage, getPropertyDetailedPage ,getConsumableStoreStock} from "@/api/property/index";
import { computed, reactive, ref, unref, watch } from "vue"
import {message} from 'ant-design-vue'
const props = withDefaults(defineProps<{
  activeId: string[];
  selectedRows?:{id:string,name:string}[]
  title?: string;
  url?: string;
  selectionType?: string;
  search?: { label?: string, component?: string, options?: any[], placeholder?: string, field?: any,fieldNames?: any, params?: any, url?: string, value: string, defaultValue?: string ,disabled?:boolean}[];
  searchParams?:{key:string,value:string|number}[]
  columns: any[];
  disabledId?: string[];
  width?:string;
}>(), {
  activeId: () => [],
  selectedRows:() => [],
  title: '',
  url: '',
  selectionType: 'radio',
  search: () => [],
  searchParams: () => [],
  columns: () => [],
  disabledId: () => [],
  width:'1000px'
});

const emits = defineEmits(['close'])

const apiContext: Record<string, (params: any) => Promise<Service.RequestResult<unknown>>> = {
  'depTree': depTree,
  'getStaffList': getUserForPage,
  'getPropertyDetailedPage': getPropertyDetailedPage,
  'getConsumablePage': getConsumablePage,
  'getConsumableStoreStock':getConsumableStoreStock,
  'batchGetUserByIds':batchGetUserByIds,
  'batchGetUserByRoleIds':batchGetUserByRoleIds,
}

const loading = ref(false)
const state = reactive<Record<string, any>>({
  modalVisible: false,
  dataSource: [],
  selectedRows: [],
  selectedRowKeys: props.activeId,
  selected: null,
  form: {},
  pagination: {
    total: 0,
    position: "bottom",
    pageSize: 10,
    current: 1,
  },
});

const rowSelection = computed(() => {
  return {
    preserveSelectedRowKeys: true,
    selectedRowKeys: unref(state.selectedRowKeys),
    type: props.selectionType,
    onChange: (keys: any, selectedRows: any) => {
      state.selectedRowKeys = keys;
      selectedRows.forEach((item: any) => {
        if(item){
          const index = state.selectedRows.findIndex((s: { id: string; }) => s.id === item.id);
          if (index === -1) {
            state.selectedRows.push(item);
          }
        }
      });
    },
    getCheckboxProps: (row: any) => ({
      disabled: props.disabledId.includes(row.id)
    }),
  };
});

watch(state.modalVisible, (n) => {
  if (n) {
    state.selectedRowKeys = props.activeId;
    getData();
  }
});
// 选中的是id 返回所有数据
const getFilter = () => {
  state.selected = [];
  state.selected = state.selectedRowKeys.map((item: any)=>{
     return state.selectedRows.find((row: { id: any })=>row.id===item)
  })
};
const show = () => {
  state.selectedRowKeys = props.activeId;
  state.selectedRows = props.selectedRows??[];
  state.modalVisible = true;
  reset()
};
const getData = () => {
  const searchParams:Record<string,any>={}
  props.searchParams.forEach(e=>{
    searchParams[e.key]=e.value
  })
  const formParams = {
    ...state.form,
    ...searchParams,
    date: null,
    pageNumber: state.pagination.current,
    pageSize: state.pagination.pageSize,
  };
  if (props.url) {
    if (['getStaffList','depTree'].includes(props.url)) {
      formParams.enabled = true
    }
    try {
      loading.value=true
      apiContext[props.url](formParams).then((res: any) => {
        if ( props.url === 'depTree') {
          state.dataSource = res ?? [];
          state.pagination.total = res.total;
        } else {
          state.dataSource = res.records ?? [];
          state.pagination.total = res.total;
        }
        getFilter();
      });
    } catch (error) {
      loading.value = false
    }finally{
      setTimeout(() => {
        loading.value = false
      }, 300);
    }
  }
};

const close = (data: any) => {
  if (data === "ok") {
    if(!state.selectedRowKeys.length){
      return message.warn('请选择人员')
    }
    getFilter();
    emits("close", state.selected);
  } else {
    emits("close");
  }
  state.modalVisible = false
  state.dataSource=[]
  reset()
};
const changePage = (e: { current: number, pageSize: number }) => {
  state.pagination.current = e.current;
  state.pagination.pageSize = e.pageSize;
  getData();
};
const reset = () => {
  props.search.forEach((item) => {
    state.form[item.value] = item.defaultValue ? item.defaultValue : null;
  });
  state.pagination.current = 1
  state.pagination.pageSize = 10
  if(!state.modalVisible) return
  getData();
};

const query =()=>{
  state.pagination.current = 1;
  getData();
}

defineExpose({
  show
})
</script>

<style lang="less" scoped>
.modal-form {
  margin-bottom: 20px;
}

:deep(.ant-form-inline .ant-form-item) {
  margin-bottom: 10px;
}
</style>
<style lang="less">
.modal-form {
  .ant-form-item {
    margin-bottom: 10px !important;
  }
}

.org-picker-modal {
  .ant-modal-body {
    padding-bottom: 0;
  }
}
</style>
