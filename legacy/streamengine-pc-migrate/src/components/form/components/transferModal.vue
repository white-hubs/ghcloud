<template>
  <a-modal :title="title" v-model:visible="showTransferUserPicker" centered width="1000px" @cancel="closeModal">
    <div class="top-step">
      <a-steps :current="transferFormStep" size="small">
        <a-step title="选择人员" />
        <a-step title="填写备注" />
        <a-step title="完成" />
      </a-steps>
    </div>
    <template v-if="transferFormStep === 0">
      <a-form layout="inline" :model="state.form" class="modal-form" v-if="search.length > 0">
        <a-form-item v-for="(item, index) in search" :label="item.label" :key="index">
          <component v-model:value="state.form[item.value]" :is="item.component ? item.component : 'a-input'"
            :placeholder="item.placeholder ? item.placeholder : '请输入'" :options="item.options ? item.options : []"
            :treeData="item.options ? item.options : []" :fieldNames="item.fieldNames ? item.fieldNames : null"
            :defaultValue="item.defaultValue" :disabled="item.disabled ? item.disabled : false"
            :style="{ width: '218px !important' }" allowClear>
          </component>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="query">查询</a-button>
        </a-form-item>
        <a-form-item>
          <a-button @click="reset">重置</a-button>
        </a-form-item>
      </a-form>
      <a-table rowKey="id" :dataSource="state.dataSource" :columns="columns" :row-selection="rowSelection"
        :pagination="state.pagination" :scroll="{ y: 450 }" size="middle" @change="changePage"
        :loading="staffTableLoading">
      </a-table>
    </template>
    <template v-else-if="transferFormStep === 1">
      <a-form-item label="备注">
        <a-textarea v-model:value="state.remark" placeholder="请输入备注" :auto-size="{ minRows: 3, maxRows: 5 }" />
      </a-form-item>
    </template>
    <template v-else>
      <a-result status="success" title="转交完成">
      </a-result>
    </template>
    <template #footer>
      <a-button key="back" @click="handleCancel" v-if="transferFormStep!==3">{{ transferFormStep===0?'取消':'上一步'
        }}</a-button>
      <a-button key="submit" type="primary" :loading="loading" @click="handleOk">{{ transferFormStep===3?'完成':'下一步'
        }}</a-button>
    </template>
  </a-modal>
</template>
<script setup lang="ts">
import { reactive, ref, h, unref, computed, onMounted, inject, Ref } from 'vue'
import { Popover, message } from 'ant-design-vue'
import { deptList, getUserForPage } from '@/api/ouaa'
import { postProcessTransfer } from '@/api/flow'
import { Application } from '@ghcloud/cube-ouaa-service'

const props= defineProps({
  taskId: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
})

const loading = ref(false)
const showTransferUserPicker = ref(false)
const transferFormStep = ref(0)
const apps=inject('applications') as Ref;
const state = reactive<Record<string, any>>({
  modalVisible: false,
  dataSource: [],
  selectedRows: [],
  selectedRowKeys: [],
  selected: null,
  form: {},
  pagination: {
    total: 0,
    position: "bottom",
    pageSize: 10,
    current: 1,
  },
  remark:''
});
const depID = sessionStorage.getItem("GH-UserInfo") ? JSON.parse(sessionStorage.getItem("GH-UserInfo") as string)?.organizations?.[0]?.id : null;
const search = ref()
const columns=ref()
const rowSelection = computed(() => {
  return {
    preserveSelectedRowKeys: true,
    selectedRowKeys: unref(state.selectedRowKeys),
    type:'checkbox',
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
      disabled: false,
    }),
  };
});
const getFilter = () => {
  state.selected = [];
  state.selected = state.selectedRowKeys.map((item: any)=>{
     return state.selectedRows.find((row: { id: any })=>row.id===item)
  })
};
const staffTableLoading=ref(false)
const getData = async () => {
  const formParams = {
    ...state.form,
    pageNumber: state.pagination.current,
    pageSize: state.pagination.pageSize,
    enabled:true
  };

  try {
    staffTableLoading.value=true
    await getUserForPage(formParams).then((res: any) => {
      state.dataSource = res.records ?? [];
      state.pagination.total = res.total;
      getFilter();
    });
  } catch (error) {
    staffTableLoading.value = false
  }finally{
    setTimeout(() => {
      staffTableLoading.value = false
    }, 300);
  }
};
const reset = () => {
  search.value&&search.value.forEach((item: { value: string | number; defaultValue: any }) => {
    state.form[item.value] = item.defaultValue ? item.defaultValue : null;
  });
  state.pagination.current = 1
  state.pagination.pageSize = 10
  getData();
  if(!state.modalVisible) return
};
const query =()=>{
  state.pagination.current = 1;
  getData();
}
const changePage = (e: { current: number, pageSize: number }) => {
  state.pagination.current = e.current;
  state.pagination.pageSize = e.pageSize;
  getData();
};


const closeModal=()=>{
  if(transferFormStep.value === 3){
    goBack()
    return
  }
}
const goBack=()=>{
  history.go(-1)
}

/** 上一步 */
const handleCancel = ()=>{
  if(transferFormStep.value === 0){
    showTransferUserPicker.value = false
    return
  }
  transferFormStep.value--
}
/** 下一步 */
const handleOk = async () => {
  if(transferFormStep.value === 0){
    if(state.selectedRowKeys.length === 0){
      message.warning('请选择转交对象')
      return
    }

    transferFormStep.value = 1
    return
  }
  if(transferFormStep.value === 3){
    goBack()
    return
  }
  try {
    loading.value = true
    await postProcessTransfer({
      taskId: props.taskId,
      targetAccount:state.selectedRowKeys.join(','),
      account: null,
      approvalOpinion:{
        text:state.remark
      }
    });
    transferFormStep.value=3
  } catch (error) {
    message.error('转移失败');
  } finally {
    loading.value = false
  }
}

const open = ()=>{
  transferFormStep.value = 0
  state.remark = ''
  state.pageNumber = 1
  state.selectedRowKeys.length = 0
  state.selectedRows.length = 0
  showTransferUserPicker.value = true;
  search.value&&search.value.forEach((item: { value: string | number; defaultValue: any }) => {
    state.form[item.value] = item.defaultValue ? item.defaultValue : null;
  });
  getData()
}
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
          return [
            h(Popover, { content: text}, { default: () => text ?? '--' })
          ]
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
          return [
            h(Popover, { content: text}, { default: () => text ?? '--' })
          ]
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
      }
    ]
  }
}

onMounted(()=>{
  initSearchDep()
  deptList({enabled:true}).then(res => {
    search.value[0].options = res
  })
})

defineExpose({
  open
})
</script>

<style scoped lang="less">
.top-step {
  margin-bottom: 20px
}

.modal-form {
  margin-bottom: 20px
}
</style>