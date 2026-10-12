<template>
  <Modal title="电瓶车建档统计" :show="showModal" @close="closeModal" wrapClassName="modal-table-alarm">
    <div class="modal-layout">
      <div class="table-top">
        <a-form ref="selectForm" :model="datainfo" layout="inline">
          <a-form-item label="名称">
            <a-input placeholder="请输入名称" v-model:value="keyword" />
          </a-form-item>
          <a-form-item label="电瓶车分类">
            <a-select @change="getData" style="width: 100px" v-model:value="queryScoped">
              <a-select-option :value="item.value" v-for="item in carTypeOptions">{{ item.label }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" size="small" @click="getData" :loading="loadingDataSource">查询</a-button>
            <a-button size="small" style="margin-left: 15px" @click="reset">重置</a-button>
          </a-form-item>
        </a-form>
      </div>
      <div style="margin-top: 15px">
        <div class="table_header">
          <div v-for="item in table_header">{{ item }}</div>
        </div>
        <a-spin :spinning="loadingDataSource">
          <div class="table_content">
            <div v-if="dataSource.length === 0" class="no-content">
              <noData />
            </div>
            <div v-for="item in dataSource">
              <div class="content">
                <div>{{ item.name ||'--' }}</div>
                <div>{{carTypeOptions.find(e=>e.value === item.electronMobileType).label  ||'--' }}</div>
                <div>{{ item.norms ||'--' }}</div>
                <div>{{ item.brand ||'--' }}</div>
                <div>{{ item.plateNumber ||'--' }}</div>
                <div>{{ item.areaName ||'--' }}</div>
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
import dayjs, { Dayjs } from "dayjs";
import { cubeElectricVehicleService } from '@/api/service'
import noData from "@/components/businessPanel/public/noData.vue";

interface Props {
  showModal: boolean;
  parameter: any;
}
const selectForm = ref();
const emit = defineEmits(["close"]);
const carTypeOptions = [
  {
    label: '全部',
    value: ''
  },
  {
    label: '电动单车',
    value: 'BICYCLE'
  },
  {
    label: '电动三轮车',
    value: 'TRICYCLE'
  },
  {
    label: '电动四轮车',
    value: 'FOUR_WHEELED'
  }
]
const props = withDefaults(defineProps<Props>(), {
  showModal: false,
});

const keyword = ref("");
const queryScoped = ref("");
const datainfo = reactive<Record<string, any>>({
  period: "",
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});

const dataSource = ref([
]);

const loadingDataSource = ref(false);
const table_header = ["名称", "分类","规格型号", "品牌", "车牌号", "所在区域"];
const onShowSizeChange = (current, size) => {
  datainfo.pageNumber = current;
  datainfo.pageSize = size;
  getData();
};
const getData = async () => {
  loadingDataSource.value = true;
  if (props.parameter.dateRange) {
    datainfo.period =
      dayjs(props.parameter.dateRange[0]).format("YYYY-MM-DD 00:00:00") +
      "," +
      dayjs(props.parameter.dateRange[1]).format("YYYY-MM-DD 23:59:59");
  } else {
    datainfo.period = "";
  }
  const res = await cubeElectricVehicleService.genElectronMobilePage({
      pageNumber: datainfo.pageNumber,
      pageSize: datainfo.pageSize,
      keyword: keyword.value,
      period: datainfo.period,
      electronMobileType: queryScoped.value
    })
  dataSource.value = res.records;
  datainfo.total = res.total;

  loadingDataSource.value = false;
};

const reset = () => {
  datainfo.pageNumber = 1;
  keyword.value = "";
  queryScoped.value = "";
  getData();
};
const closeModal = () => {
  emit("close");
};
watch(
  () => props.showModal,
  () => {
    if (props.showModal) {
      datainfo.pageNumber = 1;
      getData();
    }
  }
);


</script>

<style lang="less" scoped>
.table_header {
  background: rgba(16, 40, 68, 0.8);
  height: 48px;
  display: flex;
  color: #fff;
  line-height: 48px;

  div {
    flex: 1;
    text-align: center;
  }
}

.table_content {
  // display: flex;
  color: #fff;

  .no-content {
    display: flex;
    justify-content: center;

    :deep(.content) {
      margin-top: 5%;
    }
  }

  .content {
    display: flex;

    div {
      flex: 1;
      line-height: 48px;
      height: 48px;
      border-bottom: 1px solid rgba(105, 116, 140, 0.5);
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.alarm-time-picker {
  width: 250px;
}

.alarm-level-select,
.handle-status-select {
  width: 150px;
}

:deep(.ant-pagination-item-ellipsis) {
  color: #fff !important;
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
  background: rgba(4, 17, 32, 0.9) !important;
}

:deep(.ant-form-item-label > label) {
  color: #fff;
}

:deep(.ant-select-selector) {
  color: #fff;
}
</style>

