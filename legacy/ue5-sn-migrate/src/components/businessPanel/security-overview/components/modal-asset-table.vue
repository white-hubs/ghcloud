<template>
  <Modal title="风险源列表" :show="showModal" v-if="!riskShow" @close="closeModal" wrapClassName="modal-table-device">
    <div class="modal-layout">
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
                <div>{{ item.name }}</div>
                <div>{{ item.serialNumber||'--' }}</div>
                <div>{{ item.typeName||'--' }}</div>
                <div>{{ item.areaName||'--' }}</div>
                <div>{{ item.number||"--" }}</div>
                <div class="details" @click="openRiskModal(item)">详情</div>
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
  <Teleport to="body">
    <RiskDetailPanel :id="riskId" v-if="riskShow" @close="riskShow = false"></RiskDetailPanel>
  </Teleport>
</template>
<script setup lang="ts">
import Modal from "@/components/modal-table/modal.vue";
import { reactive, ref, watch } from "vue";
import NoData from "@/components/businessPanel/public/noData.vue";
import { sourceLedgerPage } from '@/api/property'
import RiskDetailPanel from "@/components/equipmentdetails/risk-model/risk-model.vue";

interface Props {
  parameter?: any;
  showModal: boolean;
}
const loading = ref(false);
const emit = defineEmits(["close"]);
const riskId = ref('')
const riskShow = ref(false)
const props = withDefaults(defineProps<Props>(), {
  title: "资产列表",
  showModal: false,
  parameter: {},
});
const datainfo = reactive({
  keyword: "",
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});

const dataSource = ref([]);
const table_header = ["风险源名称", "风险源编码", "风险源分类", "所在区域","数量","操作"];
const onShowSizeChange = (current, size) => {
  datainfo.pageNumber = current;
  datainfo.pageSize = size;
  getData();
};
const openRiskModal = (value)=>{
  riskId.value = value.id
  riskShow.value = true
}
const getData = async () => {
  try {
    loading.value = true;
    const res = await sourceLedgerPage({...datainfo,...props.parameter,children:false})
    dataSource.value = res.records;
    datainfo.total=res.total
  } catch (error) {
  }
  loading.value = false;
};

const closeModal = () => {
  Object.assign(datainfo, {
    keyword: "",
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
    width: 20%;
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
      width: 20%;
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
  background-color: rgba(4, 17, 32, 0.92) !important;
}

:deep(.modal-width) {
  width: 940px !important;
}
.details{
  color:#1890ff;
  cursor: pointer;
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