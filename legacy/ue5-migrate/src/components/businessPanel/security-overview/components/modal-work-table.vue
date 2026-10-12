<template>
  <Modal title="工单列表" :show="showModal && !show" @close="closeModal" wrapClassName="modal-table-device">
    <div class="modal-layout">
      <div class="table-top">
        <a-form ref="selectForm" :model="datainfo" layout="inline">
          <a-form-item label="应用">
            <a-select v-model:value="datainfo.application" style="width: 100px;">
              <a-select-option value="">全部</a-select-option>
              <a-select-option :value="item.value" v-for="item in application" :key="item.value">{{ item.label }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="状态">
            <a-select v-model:value="datainfo.status">
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="FINISHED">已完成</a-select-option>
              <a-select-option value="ACTIVE">未完成</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" size="middle" @click="query" :loading="loading">查询</a-button>
            <a-button size="middle" style="margin-left: 15px" @click="reset">重置</a-button>
          </a-form-item>
        </a-form>
      </div>
      <div style="margin-top: 15px">
        <div class="table_header">
          <div v-for="item in table_header">{{ item }}</div>
        </div>
        <a-spin :spinning="loading">
          <div class="table_content">
            <div v-if="dataSource.length === 0" class="no-content">
              <NoData />
            </div>
            <div v-for="item in dataSource">
              <div class="content">
                <div>{{ item.formNo }}</div>
                <div>{{ item.instanceName }}</div>
                <div>{{ item.startUserInfo.organizationName }}</div>
                <div>{{ item.status==='ACTIVE'?"未完成":"已完成" }}</div>
              </div>
            </div>
          </div>
        </a-spin>
      </div>
      <div style="height: 30px">
        <a-pagination style="float: right; margin-top: 15px" v-model:current="datainfo.pageNumber"
          v-model:page-size="datainfo.pageSize" @change="onShowSizeChange" :total="datainfo.total" />
      </div>
    </div>
  </Modal>
</template>
<script setup lang="ts">
import Modal from "@/components/modal-table/modal.vue";
import { onMounted, reactive, ref, watch } from "vue";
import NoData from "@/components/businessPanel/public/noData.vue";
import { getFlowOrderPage } from '@/api/flow'

interface Props {
  parameter?: any;
  showModal: boolean;
}
const application = [
  {label:'考勤管理',value:'ATTENDANCE_MANAGEMENT'},
  {label:'人事管理',value:'PERSONNELMANAGEMENT'},
  {label:'行政管理',value:'OFFICIAL_MANAGEMENT'},
  {label:'隐患排查',value:'HIDDENDANGER'},
  {label:'故障报修',value:'FAULT'},
]
const loading = ref(false);
const selectForm = ref();
const emit = defineEmits(["close"]);

const props = withDefaults(defineProps<Props>(), {
  title: "工单列表",
  showModal: false,
  parameter: {},
});
const datainfo = reactive({
  application:"",
  status: '',
  applicationCodes:[],
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});

const dataSource = ref([]);
const show = ref(false);

const table_header = ["工单编码", "工单名称", "部门", "状态"];
const onShowSizeChange = (current, size) => {
  datainfo.pageNumber = current;
  datainfo.pageSize = size;
  getData();
};
const getData = async () => {
  try {
    loading.value = true;
    const res = await getFlowOrderPage({...datainfo,applicationCodes:datainfo.application?datainfo.application:application.map(e=>e.value).join(',')})
    dataSource.value = res.records
    datainfo.total = res.total
  } catch (error) {
  } finally{
    loading.value = false;
  }
};
const query = () => {
  getData();
};
const reset = () => {
  Object.assign(datainfo, {
    ...props.parameter,
    keyword: "",
    status:props.parameter.status ?? '',
    application:"",
    pageSize: 10,
    pageNumber: 1,
    total: 0,
  });
  getData();
};
const closeModal = () => {
  Object.assign(datainfo, {
    keyword: "",
    status:props.parameter.status ?? '',
    application:"",
    pageSize: 10,
    pageNumber: 1,
    total: 0,
  });
  emit("close");
};
watch(
  () => props.showModal,
  () => {
    if(props.showModal){
      dataSource.value=[]
      datainfo.status=props.parameter.status ?? ''
      getData();
    }
  }
);
</script>

<style lang="less" scoped>
:deep(.ant-select-selection-item) {
  color: #fff;
}

:deep(.ant-form-item-label > label) {
  color: #fff;
}

:deep(.ant-picker-input > input) {
  color: #fff;
}

:deep(.ant-picker-input > input::placeholder) {
  color: #fff;
}

:deep(.ant-table-thead > tr > th) {
  color: #fff;
}

:deep(.ant-table-tbody > tr > td) {
  color: #fff;
}

:deep(.ant-table-tbody > tr > td.ant-table-cell-row-hover) {
  background-color: transparent;
}

:deep(.ant-select-selector) {
  background: rgba(216, 216, 216, 0.1) !important;
  border: 1px solid rgba(96, 112, 128, 0.6) !important;
}

:deep(.ant-picker-range) {
  background: rgba(216, 216, 216, 0.1) !important;
  border: 1px solid rgba(96, 112, 128, 0.6) !important;
}

:deep(.ant-table-cell) {
  background: rgba(16, 40, 68, 0.8);
  height: 48px;
  border-bottom: rgba(16, 40, 68, 0.8);
}

.table_header {
  background: rgba(16, 40, 68, 0.8);
  height: 48px;
  display: flex;
  color: #fff;
  line-height: 48px;

  div {
    width: 25%;
    text-align: center;
    padding: 0 15px;
  }
}

.table_content {
  // display: flex;
  color: #fff;
  min-height: 200px;

  .no-content {
    display: flex;
    justify-content: center;

    :deep(.content) {
      margin-top: 10%;
    }
  }

  .content {
    display: flex;

    div {
      width: 25%;
      line-height: 48px;
      text-align: center;
      height: 48px;
      border-bottom: 1px solid rgba(105, 116, 140, 0.5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

:deep(.ant-pagination-item-ellipsis) {
  color: #fff !important;
}

.overflow {
  overflow: hidden; //超出的文本隐藏
  text-overflow: ellipsis; //溢出用省略号显示
  white-space: nowrap;
}

:deep(.ant-pagination-item-link) {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

:deep(.ant-pagination-item) {
  background: rgba(255, 255, 255, 0.1);

  a {
    color: #fff;
  }
}

:deep(.ant-pagination-item-active) {
  background: #1890ff;

  a {
    color: #fff;
  }
}

:deep(.ant-modal-content) {
  background: rgba(4, 17, 32, 0.8) !important;
}

:deep(.modal-width) {
  width: 940px !important;
}
</style>
<style lang="less">
.modal-table-device {
  .modal-width {
    width: 940px !important;
  }

  a {
    color: #2989FF;
  }
}
</style>