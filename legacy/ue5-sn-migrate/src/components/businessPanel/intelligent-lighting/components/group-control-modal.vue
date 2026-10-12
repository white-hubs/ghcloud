<template>
  <Modal :title="title" :width="940" v-model="props.showModal" @close="closeModal" wrapClassName="modal-table-device">
    <template #modal-content>
      <div class="modal-layout">
        <div class="table-top">
          <a-form ref="selectForm" :model="search" layout="inline">
            <a-form-item label="群控组名称">
              <a-input style="width: 150px" v-model:value="search.keyword" @change="query"></a-input>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" size="middle" :loading="loading" @click="query">查询</a-button>
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
                  <div>{{ item.name }}</div>
                  <div>{{ item.count }}</div>
                  <div :style="{ color: item.status ? '#D9E7FF' : '#35D93D' }">{{ item.status ? "关闭" : "开启" }}</div>
                  <div>
                    <a @click="switchClick(item)">{{ item.status ? "全开" : "全关" }}</a>
                  </div>
                </div>
              </div>
            </div>
          </a-spin>
        </div>
        <div style="height: 30px">
          <a-pagination
            style="float: right; margin-top: 15px"
            v-model:current="search.pageNumber"
            v-model:page-size="search.pageSize"
            @change="onShowSizeChange"
            :total="search.total"
          />
        </div>
      </div>
    </template>
  </Modal>
  <!-- 密码弹窗 -->
  <PasswordModal title="群控密码" :showModal="pwdModalShow" @close="closePwdModal" @ok="handlePwdOk" :footer="null" />
  <!-- 照明群控结果弹窗 -->
  <ControlResultModal title="照明群控名称" :showModal="resultModalShow" @close="closeResultModal" @ok="handleResultOk" :footer="null" />
</template>
<script setup lang="ts">
import { message } from "ant-design-vue";
import { onMounted, reactive, ref, watch } from "vue";

import ControlResultModal from "./control-result-modal.vue";
import PasswordModal from "./password-modal.vue";
import NoData from "@/components/businessPanel/public/noData.vue";
import Modal from "@/components/modal-table/modal-layout.vue";

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
  reset();
};

const loading = ref(false);
const selectForm = ref();

const search = reactive({
  ...props.parameter,
  keyword: "",
  time: "",
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});

interface RowItem {
  id: string | number;
  name: string;
  count: string | number;
  status: string | number;
  isPassword: boolean | number;
}
const dataSource = ref<RowItem[]>([
  {
    id: "1",
    name: "早上7点开灯",
    count: 203,
    status: 0,
    isPassword: true,
  },
  {
    id: "2",
    name: "晚上12点关灯",
    count: 523,
    status: 0,
    isPassword: true,
  },
  {
    id: "3",
    name: "下午13点开灯",
    count: 154,
    status: 1,
    isPassword: true,
  },
  {
    id: "4",
    name: "下午14点开灯",
    count: 852,
    status: 1,
    isPassword: false,
  },
  {
    id: "5",
    name: "下午18点开灯",
    count: 753,
    status: 0,
    isPassword: false,
  },
  {
    id: "6",
    name: "下午18:30点开灯",
    count: 154,
    status: 1,
    isPassword: false,
  },
  {
    id: "7",
    name: "下午19点开灯",
    count: 852,
    status: 1,
    isPassword: false,
  },
  {
    id: "8",
    name: "下午20点开灯",
    count: 753,
    status: 1,
    isPassword: false,
  },
]);
const dataState = ref<RowItem[]>([...dataSource.value]);
const table_header = ["序号", "群控组名称", "控制数", "当前状态", "操作"];

// 群控密码
const pwdModalShow = ref<boolean>(false);
const resultModalShow = ref<boolean>(false);
const closePwdModal = () => {
  pwdModalShow.value = false;
};
const currentRow = ref<RowItem>();
const switchClick = (row: RowItem) => {
  pwdModalShow.value = true;
  currentRow.value = row;
};
const handlePwdOk = () => {
  message.success("操作成功");
  pwdModalShow.value = false;
  resultModalShow.value = true;
  dataSource.value.map((d) => {
    if (d.id == currentRow.value.id) {
      d.status = d.status === 0 ? 1 : 0;
    }
  });
};

// 照明群控结果弹窗
const closeResultModal = () => {
  resultModalShow.value = false;
};
const handleResultOk = () => {
  resultModalShow.value = false;
};

const onShowSizeChange = (current, size) => {
  search.pageNumber = current;
  search.pageSize = size;
};
// 演示demo 前端暂时处理查询
const query = () => {
  if (search.keyword) {
    dataSource.value = dataState.value.filter((item) => item.name.indexOf(search.keyword) > -1);
  } else {
    dataSource.value = dataState.value;
  }
};
const reset = () => {
  Object.assign(search, {
    ...props.parameter,
    keyword: "",
    pageSize: 10,
    pageNumber: 1,
    total: 0,
  });
  dataSource.value = dataState.value;
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
  background-color: rgba(4, 17, 32, 0.92) !important;
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
    color: #2989ff;
  }
}
</style>
