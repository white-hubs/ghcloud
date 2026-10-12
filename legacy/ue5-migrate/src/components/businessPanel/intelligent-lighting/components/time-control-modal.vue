<template>
  <Modal :title="title" :width="940" v-model="props.showModal" @close="closeModal" wrapClassName="modal-table-device">
    <template #modal-content>
      <div class="modal-layout">
        <div class="table-top">
          <a-form ref="selectForm" :model="search" layout="inline">
            <a-form-item label="选择日期">
              <a-range-picker
                class="alarm-time-picker"
                v-model:value="search.time"
                format="YYYY-MM-DD"
                :allowClear="false"
              />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" size="middle" :loading="loading">查询</a-button>
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
                  <div>{{ item.id }}</div>
                  <div>{{ item.time }}</div>
                  <div>{{ item.typeName }}</div>
                  <div>{{ item.ruleName }}</div>
                  <div :style="{ 'color': item.status ? '#D9E7FF' : '#35D93D' }">{{ item.status ? '关闭' : '开启' }}</div>
                  <div>{{ item.lightRate }}</div>
                  <div :style="{ 'color': item.result ? '#D9E7FF' : '#35D93D' }">{{ item.result ? '成功' : '失败' }}</div>

                </div>
              </div>
            </div>
          </a-spin>
        </div>
        <div style="height: 30px">
          <a-pagination style="float: right; margin-top: 15px" v-model:current="search.pageNumber"
            v-model:page-size="search.pageSize" @change="onShowSizeChange" :total="search.total" />
        </div>
      </div>
    </template>
  </Modal>
</template>
<script setup lang="ts">
import Modal from "@/components/modal-table/modal-layout.vue";
import { message } from "ant-design-vue";
import { onMounted, reactive, ref, watch } from "vue";
import NoData from "@/components/businessPanel/public/noData.vue";
import moment from "moment";
import dayjs, { Dayjs } from "dayjs";

const emit = defineEmits(["close"]);
interface Props {
  parameter?: any;
  title: string;
  showModal: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  title: "",
  showModal: false,
  parameter: {},
});
const closeModal = () => {
  emit("close");
};

const loading = ref(false);
const selectForm = ref();

const search = reactive({
  ...props.parameter,
  keyword: "",
  time: [],
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});
interface RowItem {
  id: string | number;
  time: string;
  typeName: string | number;
  ruleName: string | number;
  status: string | number;
  lightRate: string | number;
  result: string | number;
}
const dataSource = ref<RowItem[]>([
  {
    id: '1',
    time: '2023-06-01 09:00',
    typeName: '照明回路',
    ruleName: '1F公共照明',
    status: 0,
    lightRate: '50%',
    result: 1,
  },
  {
    id: '2',
    time: '2023-05-21 07:00',
    typeName: '照明回路',
    ruleName: '1F公共照明',
    status: 1,
    lightRate: '50%',
    result: 0,
  },
  {
    id: '3',
    time: '2023-05-20 12:00',
    typeName: '照明回路',
    ruleName: '1F公共照明',
    status: 0,
    lightRate: '50%',
    result: 0,
  },
  {
    id: '4',
    time: '2023-05-15 18:00',
    typeName: '照明回路',
    ruleName: '1F公共照明',
    status: 1,
    lightRate: '50%',
    result: 1,
  },
  {
    id: '5',
    time: '2023-05-15 17:00',
    typeName: '照明回路',
    ruleName: '1F公共照明',
    status: 0,
    lightRate: '50%',
    result: 1,
  },
  {
    id: '6',
    time: '2023-05-14 09:00',
    typeName: '照明回路',
    ruleName: '1F公共照明',
    status: 1,
    lightRate: '50%',
    result: 0,
  },
  {
    id: '7',
    time: '2023-05-12 08:00',
    typeName: '照明回路',
    ruleName: '1F公共照明',
    status: 0,
    lightRate: '50%',
    result: 0,
  },
  {
    id: '8',
    time: '2023-05-10 10:00',
    typeName: '照明回路',
    ruleName: '1F公共照明',
    status: 0,
    lightRate: '50%',
    result: 1,
  },
]);
const dataState = ref<RowItem[]>([...dataSource.value])

const table_header = ["序号", "计划时间", "对象类型", "规则对象", "开关控制", "光照度", "执行结果"];
const onShowSizeChange = (current, size) => {
  search.pageNumber = current;
  search.pageSize = size;
};
const reset = () => {
  Object.assign(search, {
    ...props.parameter,
    keyword: "",
    time: [],
    pageSize: 10,
    pageNumber: 1,
    total: 0,
  });
};
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